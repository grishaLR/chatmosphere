import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from '../hooks/useAuth';
import { playImNotify } from '../lib/sounds';
import { PeerManager, PeerConnectionType } from '../lib/peerconnection';
import type { ServerMessage } from '@protoimsg/shared';

export interface VideoCall {
  conversationId: string;
  recipientDid: string;
  status: 'outgoing' | 'incoming' | 'active';
  localStream: MediaStream | null;
  remoteStream: MediaStream | undefined;
}

interface VideoCallContextValue {
  activeCall: VideoCall | null;
  videoCall: (recipientDid: string) => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  hangUp: () => void;
}

const VideoCallContext = createContext<VideoCallContextValue | null>(null);

// TODO: Replace with our own STUN/TURN server to avoid exposing IPs to Google
function getStunServers(): RTCIceServer[] {
  console.warn('Falling back to public Google STUN servers');
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];
}

const INCOMING_CALL_TIMEOUT_MS = 30_000;

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const { send, subscribe } = useWebSocket();
  const { did } = useAuth();
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);

  // Refs for internal state that WS handlers need without triggering re-renders
  const peerConnection = useRef<PeerManager | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const incomingOffer = useRef<string | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
  const pendingCallDid = useRef<string | null>(null);
  const incomingCallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirror of activeCall so WS handlers always see latest state
  const activeCallRef = useRef<VideoCall | null>(null);
  activeCallRef.current = activeCall;

  /** Clean up all WebRTC + media state */
  const cleanUp = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.pc.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStream.current = null;
    }
    incomingOffer.current = null;
    pendingIceCandidates.current = [];
    pendingCallDid.current = null;
    if (incomingCallTimer.current) {
      clearTimeout(incomingCallTimer.current);
      incomingCallTimer.current = null;
    }
    setActiveCall(null);
  }, []);

  /** Handle remote stream from PeerManager */
  const onRemoteStream = useCallback((_conversationId: string, stream: MediaStream) => {
    setActiveCall((prev) => (prev ? { ...prev, remoteStream: stream, status: 'active' } : prev));
  }, []);

  /** Start call after we have a conversationId */
  const initiateCall = useCallback(
    async (conversationId: string, recipientDid: string) => {
      if (!did) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStream.current = stream;

        const pm = new PeerManager({
          config: { iceServers: getStunServers() },
          conversationId,
          send,
          onRemoteStream,
          type: PeerConnectionType.Caller,
        });

        if (peerConnection.current) {
          peerConnection.current.pc.close();
        }
        peerConnection.current = pm;

        stream.getTracks().forEach((track) => {
          pm.pc.addTrack(track, stream);
        });

        setActiveCall({
          conversationId,
          recipientDid,
          status: 'outgoing',
          localStream: stream,
          remoteStream: undefined,
        });
      } catch (err) {
        console.error('Failed to start call', err);
        cleanUp();
      }
    },
    [send, did, onRemoteStream, cleanUp],
  );

  const videoCall = useCallback(
    (recipientDid: string) => {
      // Already in a call — ignore
      if (activeCallRef.current) return;

      pendingCallDid.current = recipientDid;
      // Dedicated call_init — gets a conversationId for signaling without
      // triggering a DM popover (DmContext doesn't process call_ready)
      send({ type: 'call_init', recipientDid });
    },
    [send],
  );

  const acceptCall = useCallback(async () => {
    const call = activeCallRef.current;
    if (!call || call.status !== 'incoming' || !did) return;

    const offer = incomingOffer.current;
    if (!offer) {
      console.error('No incoming offer found');
      return;
    }

    if (incomingCallTimer.current) {
      clearTimeout(incomingCallTimer.current);
      incomingCallTimer.current = null;
    }

    try {
      const pm = new PeerManager({
        config: { iceServers: getStunServers() },
        conversationId: call.conversationId,
        send,
        onRemoteStream,
        type: PeerConnectionType.Callee,
      });

      if (peerConnection.current) {
        peerConnection.current.pc.close();
      }
      peerConnection.current = pm;

      await pm.pc.setRemoteDescription({ type: 'offer', sdp: offer });

      // Flush any ICE candidates that arrived before we accepted
      for (const c of pendingIceCandidates.current) {
        pm.addBufferedCandidate(c);
      }
      pendingIceCandidates.current = [];
      pm.flushCandidates();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStream.current = stream;

      stream.getTracks().forEach((track) => {
        pm.pc.addTrack(track, stream);
      });

      const answer = await pm.pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pm.pc.setLocalDescription(answer);

      if (!answer.sdp) {
        throw new Error('Answer SDP is undefined');
      }

      send({ type: 'accept_call', conversationId: call.conversationId, answer: answer.sdp });

      setActiveCall((prev) => (prev ? { ...prev, status: 'active', localStream: stream } : prev));
      incomingOffer.current = null;
    } catch (err) {
      console.error('Failed to accept call', err);
      cleanUp();
    }
  }, [send, did, onRemoteStream, cleanUp]);

  const rejectCall = useCallback(() => {
    const call = activeCallRef.current;
    if (!call) return;

    send({ type: 'reject_call', conversationId: call.conversationId });
    cleanUp();
  }, [send, cleanUp]);

  const hangUp = useCallback(() => {
    const call = activeCallRef.current;
    if (!call) return;

    send({ type: 'reject_call', conversationId: call.conversationId });
    cleanUp();
  }, [send, cleanUp]);

  // WS event handler
  useEffect(() => {
    const unsub = subscribe((msg: ServerMessage) => {
      switch (msg.type) {
        case 'call_ready': {
          const { conversationId, recipientDid } = msg.data;
          if (pendingCallDid.current && pendingCallDid.current === recipientDid) {
            pendingCallDid.current = null;
            void initiateCall(conversationId, recipientDid);
          }
          break;
        }

        case 'incoming_call': {
          const { conversationId, senderDid, offer } = msg.data;

          // Already in a call — auto-reject
          if (activeCallRef.current) {
            send({ type: 'reject_call', conversationId });
            break;
          }

          playImNotify();
          incomingOffer.current = offer;

          // Subscribe for signaling on this conversation (call_init subscribes
          // the socket without triggering a DM popover)
          send({ type: 'call_init', recipientDid: senderDid });

          setActiveCall({
            conversationId,
            recipientDid: senderDid,
            status: 'incoming',
            localStream: null,
            remoteStream: undefined,
          });

          // Auto-reject after timeout
          incomingCallTimer.current = setTimeout(() => {
            if (activeCallRef.current?.conversationId === conversationId) {
              send({ type: 'reject_call', conversationId });
              cleanUp();
            }
          }, INCOMING_CALL_TIMEOUT_MS);
          break;
        }

        case 'accept_call': {
          const { conversationId, answer } = msg.data;
          const pm = peerConnection.current;
          if (!pm || activeCallRef.current?.conversationId !== conversationId) break;

          pm.pc
            .setRemoteDescription({ type: 'answer', sdp: answer })
            .then(() => {
              pm.flushCandidates();
            })
            .catch((err: unknown) => {
              console.error('Failed to set remote description', err);
            });

          setActiveCall((prev) => (prev ? { ...prev, status: 'active' } : prev));
          break;
        }

        case 'reject_call': {
          const { conversationId } = msg.data;
          if (activeCallRef.current?.conversationId === conversationId) {
            cleanUp();
          }
          break;
        }

        case 'new_ice_candidate': {
          const { conversationId, candidate } = msg.data;
          if (activeCallRef.current?.conversationId !== conversationId) break;

          const pm = peerConnection.current;
          if (!pm) {
            // Buffer until PeerManager is created (callee hasn't accepted yet)
            pendingIceCandidates.current.push(candidate);
            break;
          }

          pm.addBufferedCandidate(candidate);
          break;
        }
      }
    });

    return () => {
      unsub();
    };
  }, [subscribe, send, initiateCall, cleanUp]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.pc.close();
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (incomingCallTimer.current) {
        clearTimeout(incomingCallTimer.current);
      }
    };
  }, []);

  const value: VideoCallContextValue = {
    activeCall,
    videoCall,
    acceptCall,
    rejectCall,
    hangUp,
  };

  return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
}

export function useVideoCall(): VideoCallContextValue {
  const ctx = useContext(VideoCallContext);
  if (!ctx) throw new Error('useVideoCall must be used within VideoCallProvider');
  return ctx;
}
