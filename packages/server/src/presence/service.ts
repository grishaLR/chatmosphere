import type { PresenceStatus } from '@chatmosphere/shared';
import { presenceTracker } from './tracker.js';

export function handleUserConnect(did: string): void {
  presenceTracker.setOnline(did);
}

export function handleUserDisconnect(did: string): void {
  presenceTracker.setOffline(did);
}

export function handleStatusChange(
  did: string,
  status: PresenceStatus,
  awayMessage?: string,
): void {
  presenceTracker.setStatus(did, status, awayMessage);
}

export function handleJoinRoom(did: string, roomId: string): void {
  presenceTracker.joinRoom(did, roomId);
}

export function handleLeaveRoom(did: string, roomId: string): void {
  presenceTracker.leaveRoom(did, roomId);
}

export function getUserStatus(did: string): PresenceStatus {
  return presenceTracker.getStatus(did);
}

export function getRoomPresence(roomId: string): string[] {
  return presenceTracker.getRoomMembers(roomId);
}

export function getBulkPresence(
  dids: string[],
): Array<{ did: string; status: string; awayMessage?: string }> {
  const presenceMap = presenceTracker.getPresenceBulk(dids);
  return dids.map((did) => {
    const p = presenceMap.get(did) ?? { status: 'offline' };
    return { did, status: p.status, awayMessage: p.awayMessage };
  });
}

export function getUserRooms(did: string): Set<string> {
  return presenceTracker.getUserRooms(did);
}
