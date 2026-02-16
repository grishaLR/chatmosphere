import { ClientMessage } from '@protoimsg/shared';
import { DmConversation } from '../contexts/DmContext';

export enum PeerConnectionType {
  Caller = 'caller',
  Callee = 'callee',
}

interface PeerConnectionConfig {
  config: RTCConfiguration;
  send: (msg: ClientMessage) => void;
  conversationId: string;
  setConversations: React.Dispatch<React.SetStateAction<DmConversation[]>>;
  type: PeerConnectionType;
}

export class PeerManager {
  public pc: RTCPeerConnection;
  private send: (msg: ClientMessage) => void;
  private conversationId: string;
  private setConversations: React.Dispatch<React.SetStateAction<DmConversation[]>>;

  constructor(peerConfig: PeerConnectionConfig) {
    this.send = peerConfig.send;
    this.pc = new RTCPeerConnection(peerConfig.config);
    this.conversationId = peerConfig.conversationId;
    this.setConversations = peerConfig.setConversations;

    this.pc.onicecandidate = this.handleICECandidateEvent.bind(this);
    this.pc.ontrack = this.handleTrackEvent.bind(this);

    this.pc.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
    this.pc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
    this.pc.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
    this.pc.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
    this.pc.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
  }

  private handleICECandidateEvent(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate) {
      this.send({
        type: 'new_ice_candidate',
        conversationId: this.conversationId,
        candidate: event.candidate,
      });
    }
  }

  private handleTrackEvent(t: RTCTrackEvent): void {
    this.setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === this.conversationId ? { ...c, remoteVideoSrc: t.streams[0] } : c,
      ),
    );
  }

  private handleNegotiationNeededEvent(_: Event): void {
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
      'ICE connection state change - this should be handled in DmContext, not PeerConnectionImpl',
      e,
    );
    // Handle ICE connection state change event
  }

  private handleICEGatheringStateChangeEvent(e: Event): void {
    console.warn(
      'ICE gathering state change - this should be handled in DmContext, not PeerConnectionImpl',
      e,
    );
    // Handle ICE gathering state change event
  }

  private handleSignalingStateChangeEvent(_: Event): void {
    console.warn(
      'Signaling state change - this should be handled in DmContext, not PeerConnectionImpl',
    );

    if (this.pc.signalingState === 'stable') {
      // Once stable, we can check if there are pending offers to create and send an answer for
      // This can happen if the remote peer creates multiple offers before we respond to the first one
      // In that case, we want to make sure we process all offers and don't leave any pending
      // (This is a bit of a band-aid for handling rapid offer creation, ideally we'd want a more robust solution for queuing offers)
      // Note: This is only relevant for the callee - the caller should not be receiving multiple offers without responding to the first one
      // TODO: render peer connection in UI
    }
  }
}
