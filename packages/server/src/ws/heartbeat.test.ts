import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachHeartbeat } from './heartbeat.js';
import { EventEmitter } from 'events';

function mockWs() {
  const emitter = new EventEmitter();
  return {
    ping: vi.fn(),
    terminate: vi.fn(),
    on: emitter.on.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
    // Simulate pong
    emitPong: () => emitter.emit('pong'),
  };
}

describe('attachHeartbeat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends ping at interval', () => {
    const ws = mockWs();
    const cleanup = attachHeartbeat(ws as never, { intervalMs: 1000, maxMissed: 3 });

    vi.advanceTimersByTime(1000);
    expect(ws.ping).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(ws.ping).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('resets missed count on pong', () => {
    const ws = mockWs();
    const cleanup = attachHeartbeat(ws as never, { intervalMs: 1000, maxMissed: 2 });

    vi.advanceTimersByTime(1000); // miss 1
    vi.advanceTimersByTime(1000); // miss 2
    ws.emitPong(); // reset
    vi.advanceTimersByTime(1000); // miss 1 again
    vi.advanceTimersByTime(1000); // miss 2 again

    // Should NOT have terminated (pong reset the counter)
    expect(ws.terminate).not.toHaveBeenCalled();

    cleanup();
  });

  it('terminates after max missed pongs', () => {
    const ws = mockWs();
    const cleanup = attachHeartbeat(ws as never, { intervalMs: 1000, maxMissed: 2 });

    vi.advanceTimersByTime(1000); // miss 1
    vi.advanceTimersByTime(1000); // miss 2
    vi.advanceTimersByTime(1000); // miss 3 → terminate

    expect(ws.terminate).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('cleanup clears interval', () => {
    const ws = mockWs();
    const cleanup = attachHeartbeat(ws as never, { intervalMs: 1000, maxMissed: 3 });

    cleanup();

    vi.advanceTimersByTime(5000);
    expect(ws.ping).not.toHaveBeenCalled();
  });
});
