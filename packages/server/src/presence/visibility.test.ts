import { describe, it, expect } from 'vitest';
import { resolveVisibleStatus } from './visibility.js';

describe('resolveVisibleStatus', () => {
  it('returns real status when visibility is everyone', () => {
    expect(resolveVisibleStatus('everyone', 'online', false, false)).toBe('online');
    expect(resolveVisibleStatus('everyone', 'away', false, false)).toBe('away');
    expect(resolveVisibleStatus('everyone', 'idle', true, true)).toBe('idle');
    expect(resolveVisibleStatus('everyone', 'offline', false, false)).toBe('offline');
  });

  it('returns offline when visibility is no-one', () => {
    expect(resolveVisibleStatus('no-one', 'online', false, false)).toBe('offline');
    expect(resolveVisibleStatus('no-one', 'online', true, true)).toBe('offline');
    expect(resolveVisibleStatus('no-one', 'away', true, true)).toBe('offline');
  });

  it('returns real status for community when requester is a member', () => {
    expect(resolveVisibleStatus('community', 'online', true, false)).toBe('online');
    expect(resolveVisibleStatus('community', 'away', true, false)).toBe('away');
  });

  it('returns offline for community when requester is not a member', () => {
    expect(resolveVisibleStatus('community', 'online', false, false)).toBe('offline');
    expect(resolveVisibleStatus('community', 'away', false, false)).toBe('offline');
  });

  it('returns real status for inner-circle when requester is in inner circle', () => {
    expect(resolveVisibleStatus('inner-circle', 'online', true, true)).toBe('online');
    expect(resolveVisibleStatus('inner-circle', 'away', true, true)).toBe('away');
    expect(resolveVisibleStatus('inner-circle', 'idle', true, true)).toBe('idle');
  });

  it('returns offline for inner-circle when requester is not in inner circle', () => {
    expect(resolveVisibleStatus('inner-circle', 'online', true, false)).toBe('offline');
    expect(resolveVisibleStatus('inner-circle', 'away', false, false)).toBe('offline');
    expect(resolveVisibleStatus('inner-circle', 'idle', false, false)).toBe('offline');
  });

  it('returns invisible as-is for everyone visibility', () => {
    expect(resolveVisibleStatus('everyone', 'invisible', false, false)).toBe('invisible');
  });

  it('returns offline for invisible status with no-one visibility', () => {
    expect(resolveVisibleStatus('no-one', 'invisible', true, true)).toBe('offline');
  });

  it('returns offline for inner-circle when not in inner circle regardless of status', () => {
    expect(resolveVisibleStatus('inner-circle', 'invisible', true, false)).toBe('offline');
  });
});
