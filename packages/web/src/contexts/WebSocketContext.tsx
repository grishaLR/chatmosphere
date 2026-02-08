import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createWsClient, type WsClient, type WsHandler } from '../lib/ws';
import type { ClientMessage } from '@chatmosphere/shared';
import { useAuth } from '../hooks/useAuth';

interface WebSocketContextValue {
  send: (msg: ClientMessage) => void;
  subscribe: (handler: WsHandler) => () => void;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { did, serverToken } = useAuth();
  const clientRef = useRef<WsClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!did || !serverToken) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    const client = createWsClient(wsUrl, serverToken);
    clientRef.current = client;

    // Poll connection status
    const interval = setInterval(() => {
      setConnected(client.isConnected());
    }, 1000);

    return () => {
      clearInterval(interval);
      client.close();
      clientRef.current = null;
      setConnected(false);
    };
  }, [did, serverToken]);

  // Both `send` and `subscribe` depend on `connected` so that consumer effects
  // re-run when the WS client connects. Without this, effects that fire before
  // the client is ready get stale no-ops and never retry.
  const send = useCallback(
    (msg: ClientMessage) => {
      if (!connected) return;
      clientRef.current?.send(msg);
    },
    [connected],
  );

  const subscribe = useCallback(
    (handler: WsHandler) => {
      if (!connected) return () => {};
      return clientRef.current?.subscribe(handler) ?? (() => {});
    },
    [connected],
  );

  const value = useMemo<WebSocketContextValue>(
    () => ({ send, subscribe, connected }),
    [send, subscribe, connected],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}
