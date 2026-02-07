import type { WebSocket } from 'ws';

const DEFAULT_INTERVAL_MS = 30_000;
const MAX_MISSED_PONGS = 3;

export function attachHeartbeat(
  ws: WebSocket,
  opts?: { intervalMs?: number; maxMissed?: number },
): () => void {
  const intervalMs = opts?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const maxMissed = opts?.maxMissed ?? MAX_MISSED_PONGS;
  let missedPongs = 0;

  const interval = setInterval(() => {
    missedPongs++;
    if (missedPongs > maxMissed) {
      ws.terminate();
      return;
    }
    ws.ping();
  }, intervalMs);

  const onPong = () => {
    missedPongs = 0;
  };

  ws.on('pong', onPong);

  return () => {
    clearInterval(interval);
    ws.removeListener('pong', onPong);
  };
}
