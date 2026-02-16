import { ClientMessage } from '@protoimsg/shared';

export enum PeerConnectionType {
  Caller = 'caller',
  Callee = 'callee',
}

interface PeerConnectionConfig {
  config: RTCConfiguration;
  send: (msg: ClientMessage) => void;
  conversationId: string;
  onRemoteStream: (conversationId: string, stream: MediaStream) => void;
  type: PeerConnectionType;
}

export class PeerManager {
  public pc: RTCPeerConnection;
  private send: (msg: ClientMessage) => void;
  private conversationId: string;
  private onRemoteStream: (conversationId: string, stream: MediaStream) => void;
  private type: PeerConnectionType;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(peerConfig: PeerConnectionConfig) {
    this.send = peerConfig.send;
    this.pc = new RTCPeerConnection(peerConfig.config);
    this.conversationId = peerConfig.conversationId;
    this.onRemoteStream = peerConfig.onRemoteStream;
    this.type = peerConfig.type;

    this.pc.onicecandidate = this.handleICECandidateEvent.bind(this);
    this.pc.ontrack = this.handleTrackEvent.bind(this);
    this.pc.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
    this.pc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
    this.pc.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
    this.pc.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
  }

  /** Buffer ICE candidates until remote description is set, then flush */
  addBufferedCandidate(candidate: RTCIceCandidateInit): void {
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err: unknown) => {
        console.error('Failed to add ICE candidate', err);
      });
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  /** Flush buffered ICE candidates — call after setRemoteDescription */
  flushCandidates(): void {
    for (const c of this.pendingCandidates) {
      this.pc.addIceCandidate(new RTCIceCandidate(c)).catch((err: unknown) => {
        console.error('Failed to add buffered ICE candidate', err);
      });
    }
    this.pendingCandidates = [];
  }

  private handleICECandidateEvent(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate) {
      this.send({
        type: 'new_ice_candidate',
        conversationId: this.conversationId,
        candidate: event.candidate.toJSON(), // Send the candidate as a JSON object instead of a string
      });
    }
  }

  private handleTrackEvent(t: RTCTrackEvent): void {
    const stream = t.streams[0] ?? new MediaStream([t.track]);
    this.onRemoteStream(this.conversationId, stream);
  }

  private handleNegotiationNeededEvent(_: Event): void {
    // Only the caller should create offers — callee sends answers only
    if (this.type !== PeerConnectionType.Caller) return;

    void this.pc
      .createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      .then(
        (offer): Promise<RTCSessionDescriptionInit> =>
          this.pc.setLocalDescription(offer).then(() => offer),
      )
      .then((offer): void => {
        if (!offer.sdp) {
          throw new Error('Offer SDP is undefined');
        }
        this.send({ type: 'make_call', conversationId: this.conversationId, offer: offer.sdp });
      })
      .catch((err: unknown) => {
        console.error('Error during negotiation', err);
      });
  }

  private handleICEConnectionStateChangeEvent(e: Event): void {
    console.warn(
      'ICE connection state change - this should be handled in VideoCallContext, not PeerConnectionImpl',
      e,
    );
  }

  private handleICEGatheringStateChangeEvent(e: Event): void {
    console.warn(
      'ICE gathering state change - this should be handled in VideoCallContext, not PeerConnectionImpl',
      e,
    );
  }

  private handleSignalingStateChangeEvent(_: Event): void {
    console.warn(
      'Signaling state change - this should be handled in VideoCallContext, not PeerConnectionImpl',
    );

    if (this.pc.signalingState === 'stable') {
      // Once stable, we can check if there are pending offers to create and send an answer for
      // TODO: render peer connection in UI
    }
  }
}
