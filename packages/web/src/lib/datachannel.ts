import type { ClientMessage, IceCandidateInit } from '@protoimsg/shared';
import { Sentry } from '../sentry';
import { createLogger } from './logger';

const log = createLogger('DataChannelPeer');

const DC_LABEL = 'im';
const KEEPALIVE_INTERVAL_MS = 30_000;

/** Messages sent over the RTCDataChannel (JSON-encoded) */
export interface DcTextMessage {
  type: 'text';
  id: string;
  text: string;
  ts: string;
}

export interface DcTypingMessage {
  type: 'typing';
}

export interface DcPingMessage {
  type: 'ping';
}

export type DcMessage = DcTextMessage | DcTypingMessage | DcPingMessage;

export type DataChannelState = 'connecting' | 'open' | 'closed' | 'failed';

interface DataChannelPeerConfig {
  rtcConfig: RTCConfiguration;
  conversationId: string;
  send: (msg: ClientMessage) => void;
  onMessage: (msg: DcTextMessage) => void;
  onTyping: () => void;
  onStateChange: (state: DataChannelState) => void;
  isCaller: boolean;
}

export class DataChannelPeer {
  public pc: RTCPeerConnection;
  public readonly isCaller: boolean;
  private dc: RTCDataChannel | null = null;
  private send: (msg: ClientMessage) => void;
  private conversationId: string;
  private onMessage: (msg: DcTextMessage) => void;
  private onTyping: () => void;
  private onStateChange: (state: DataChannelState) => void;
  private pendingCandidates: IceCandidateInit[] = [];
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  private _state: DataChannelState = 'connecting';

  get state(): DataChannelState {
    return this._state;
  }

  constructor(config: DataChannelPeerConfig) {
    this.send = config.send;
    this.conversationId = config.conversationId;
    this.onMessage = config.onMessage;
    this.onTyping = config.onTyping;
    this.onStateChange = config.onStateChange;
    this.isCaller = config.isCaller;

    this.pc = new RTCPeerConnection(config.rtcConfig);
    this.pc.onicecandidate = this.handleIceCandidate.bind(this);
    this.pc.oniceconnectionstatechange = this.handleIceConnectionStateChange.bind(this);

    if (config.isCaller) {
      this.dc = this.pc.createDataChannel(DC_LABEL, { ordered: true });
      this.setupDataChannel(this.dc);
    } else {
      this.pc.ondatachannel = (event) => {
        this.dc = event.channel;
        this.setupDataChannel(this.dc);
      };
    }
  }

  async createOffer(): Promise<void> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    if (!offer.sdp) throw new Error('Offer SDP is undefined');
    this.send({ type: 'im_offer', conversationId: this.conversationId, offer: offer.sdp });
  }

  async handleOffer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'offer', sdp });
    this.flushCandidates();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    if (!answer.sdp) throw new Error('Answer SDP is undefined');
    this.send({ type: 'im_answer', conversationId: this.conversationId, answer: answer.sdp });
  }

  async handleAnswer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'answer', sdp });
    this.flushCandidates();
  }

  addBufferedCandidate(candidate: IceCandidateInit): void {
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err: unknown) => {
        log.error('Failed to add ICE candidate', err);
      });
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  flushCandidates(): void {
    for (const c of this.pendingCandidates) {
      this.pc.addIceCandidate(new RTCIceCandidate(c)).catch((err: unknown) => {
        log.error('Failed to add buffered ICE candidate', err);
      });
    }
    this.pendingCandidates = [];
  }

  sendMessage(msg: DcTextMessage): boolean {
    if (!this.dc || this.dc.readyState !== 'open') return false;
    this.dc.send(JSON.stringify(msg));
    return true;
  }

  sendTyping(): boolean {
    if (!this.dc || this.dc.readyState !== 'open') return false;
    this.dc.send(JSON.stringify({ type: 'typing' }));
    return true;
  }

  close(): void {
    this.stopKeepalive();
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    this.pc.close();
    this.updateState('closed');
  }

  private setupDataChannel(dc: RTCDataChannel): void {
    dc.onopen = () => {
      log.info('Data channel open for %s', this.conversationId);
      this.updateState('open');
      this.startKeepalive();
    };
    dc.onclose = () => {
      log.info('Data channel closed for %s', this.conversationId);
      this.stopKeepalive();
      this.updateState('closed');
    };
    dc.onerror = (event) => {
      log.error('Data channel error', event);
      this.stopKeepalive();
      this.pc.close();
      this.updateState('failed');
    };
    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DcMessage;
        switch (msg.type) {
          case 'text':
            this.onMessage(msg);
            break;
          case 'typing':
            this.onTyping();
            break;
          case 'ping':
            // Keepalive — no action needed
            break;
        }
      } catch (err) {
        log.warn('Failed to parse data channel message', err);
      }
    };
  }

  private handleIceCandidate(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate) {
      this.send({
        type: 'im_ice_candidate',
        conversationId: this.conversationId,
        candidate: event.candidate.toJSON() as IceCandidateInit,
      });
    }
  }

  private handleIceConnectionStateChange(): void {
    const state = this.pc.iceConnectionState;
    log.debug('ICE connection state: %s', state);
    if (state === 'failed') {
      log.warn('ICE connection failed for data channel');
      Sentry.captureMessage('WebRTC DataChannel ICE connection failed', {
        level: 'warning',
        extra: { conversationId: this.conversationId },
      });
      this.updateState('failed');
    } else if (state === 'disconnected') {
      // Brief disconnections are normal — ICE will attempt recovery.
      // Only mark as failed if the data channel itself closes.
      log.debug('ICE disconnected (may recover)');
    }
  }

  private updateState(state: DataChannelState): void {
    if (this._state === state) return;
    this._state = state;
    this.onStateChange(state);
  }

  private startKeepalive(): void {
    this.stopKeepalive();
    this.keepaliveTimer = setInterval(() => {
      if (this.dc?.readyState === 'open') {
        this.dc.send(JSON.stringify({ type: 'ping' }));
      }
    }, KEEPALIVE_INTERVAL_MS);
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
  }
}
