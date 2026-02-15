import { ClientMessage } from '@protoimsg/shared';

interface PeerConnectionConfig {
  config: RTCConfiguration;
  send: (msg: ClientMessage) => void;
}

export default class PeerManager {
  public pc: RTCPeerConnection;
  send: (msg: ClientMessage) => void;

  constructor(peerConfig: PeerConnectionConfig) {
    this.send = peerConfig.send;
    this.pc = new RTCPeerConnection(peerConfig.config);

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
        target: 'TODO',
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
    // Handle signaling state change event
  }
}
