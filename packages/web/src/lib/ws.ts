import type { ClientMessage, ServerMessage } from '@protoimsg/shared';

export type WsHandler = (msg: ServerMessage) => void;

export interface WsClient {
  send: (msg: ClientMessage) => void;
  subscribe: (handler: WsHandler) => () => void;
  close: () => void;
  isConnected: () => boolean;
}

export function createWsClient(url: string, token: string): WsClient {
  let ws: WebSocket | null = null;
  let handlers = new Set<WsHandler>();
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let authFailed = false;

  function connect() {
    if (authFailed) return;
    ws = new WebSocket(url);

    ws.onopen = () => {
      // Send auth token as first message
      ws?.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        for (const handler of handlers) {
          handler(msg);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      // 4001 = auth failure — don't reconnect
      if (event.code === 4001) {
        authFailed = true;
        return;
      }
      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      // onclose will fire after this, triggering reconnect
    };
  }

  connect();

  return {
    send(msg: ClientMessage) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    },

    subscribe(handler: WsHandler) {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },

    close() {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      handlers = new Set();
    },

    isConnected() {
      return ws?.readyState === WebSocket.OPEN;
    },
  };
}
