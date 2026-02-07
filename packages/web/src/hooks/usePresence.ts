import { useCallback, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from './useAuth';
import { putPresenceRecord } from '../lib/atproto';
import type { PresenceStatus } from '@chatmosphere/shared';

export function usePresence() {
  const [status, setStatus] = useState<PresenceStatus>('online');
  const [awayMessage, setAwayMessage] = useState<string | undefined>();
  const { send } = useWebSocket();
  const { agent } = useAuth();

  const changeStatus = useCallback(
    (newStatus: PresenceStatus, newAwayMessage?: string) => {
      const msg = newStatus === 'away' ? newAwayMessage : undefined;
      setStatus(newStatus);
      setAwayMessage(msg);

      // Immediate WS broadcast
      send({
        type: 'status_change',
        status: newStatus as 'online' | 'away' | 'idle',
        awayMessage: msg,
      });

      // Fire-and-forget ATProto presence record write
      if (agent) {
        void putPresenceRecord(agent, newStatus, { awayMessage: msg });
      }
    },
    [send, agent],
  );

  return { status, awayMessage, changeStatus };
}
