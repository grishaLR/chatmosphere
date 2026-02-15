import { ClientMessage } from '@protoimsg/shared';

interface PeerConnectionConfig {
  config: RTCConfiguration;
  send: (msg: ClientMessage) => void;
  conversationId: string;
}

export default class PeerManager {
  public pc: RTCPeerConnection;
  send: (msg: ClientMessage) => void;
  public conversationId: string;

  constructor(peerConfig: PeerConnectionConfig) {
    this.send = peerConfig.send;
    this.pc = new RTCPeerConnection(peerConfig.config);
    this.conversationId = peerConfig.conversationId;

    this.pc.onicecandidate = this.handleICECandidateEvent.bind(this);
    this.pc.ontrack = this.handleTrackEvent.bind(this);
    this.pc.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
    this.pc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
    this.pc.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
    this.pc.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
  }

  handleICECandidateEvent(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate) {
      this.send({
        type: 'new_ice_candidate',
        conversationId: this.conversationId,
        candidate: event.candidate,
      });
    }
  }

  handleTrackEvent(_: RTCTrackEvent): void {
    // Handle track event
  }

  handleNegotiationNeededEvent(_: Event): void {
    console.warn(
      'Negotiation needed - this should be handled in DmContext, not PeerConnectionImpl',
    );
    // Handle negotiation needed event
  }

  handleICEConnectionStateChangeEvent(_: Event): void {
    console.warn(
      'ICE connection state change - this should be handled in DmContext, not PeerConnectionImpl',
    );
    // Handle ICE connection state change event
  }

  handleICEGatheringStateChangeEvent(_: Event): void {
    console.warn(
      'ICE gathering state change - this should be handled in DmContext, not PeerConnectionImpl',
    );
    // Handle ICE gathering state change event
  }

  handleSignalingStateChangeEvent(_: Event): void {
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
