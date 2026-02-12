import type { PresenceStatus, PresenceVisibility } from '@protoimsg/shared';

/**
 * MVP limitation: Presence is stored in a single process Map. Horizontal scaling
 * would give split-brain presence (each instance has its own view). For v1, plan
 * a shared store (e.g. Redis) so presence is consistent across instances.
 */

export interface UserPresence {
  did: string;
  status: PresenceStatus;
  visibleTo: PresenceVisibility;
  awayMessage?: string;
  lastSeen: Date;
  rooms: Set<string>;
}

/** In-memory presence tracker backed by WebSocket connections */
export class PresenceTracker {
  private users = new Map<string, UserPresence>();
  /** Reverse index: roomId → Set of DIDs currently in that room. O(1) lookups. */
  private roomMembers = new Map<string, Set<string>>();

  setOnline(did: string): void {
    const existing = this.users.get(did);
    if (existing) {
      existing.status = 'online';
      existing.lastSeen = new Date();
    } else {
      this.users.set(did, {
        did,
        status: 'online',
        visibleTo: 'no-one',
        lastSeen: new Date(),
        rooms: new Set(),
      });
    }
  }

  setOffline(did: string): void {
    const user = this.users.get(did);
    if (user) {
      // Clean up reverse index for all rooms this user was in
      for (const roomId of user.rooms) {
        const members = this.roomMembers.get(roomId);
        if (members) {
          members.delete(did);
          if (members.size === 0) this.roomMembers.delete(roomId);
        }
      }
      this.users.delete(did);
    }
  }

  setStatus(
    did: string,
    status: PresenceStatus,
    awayMessage?: string,
    visibleTo?: PresenceVisibility,
  ): void {
    const user = this.users.get(did);
    if (user) {
      user.status = status;
      user.awayMessage = status === 'away' ? awayMessage : undefined;
      if (visibleTo) user.visibleTo = visibleTo;
      user.lastSeen = new Date();
    }
  }

  joinRoom(did: string, roomId: string): void {
    const user = this.users.get(did);
    if (user) {
      user.rooms.add(roomId);
      // Update reverse index
      let members = this.roomMembers.get(roomId);
      if (!members) {
        members = new Set();
        this.roomMembers.set(roomId, members);
      }
      members.add(did);
    }
  }

  leaveRoom(did: string, roomId: string): void {
    const user = this.users.get(did);
    if (user) {
      user.rooms.delete(roomId);
      // Update reverse index
      const members = this.roomMembers.get(roomId);
      if (members) {
        members.delete(did);
        if (members.size === 0) this.roomMembers.delete(roomId);
      }
    }
  }

  getStatus(did: string): PresenceStatus {
    return this.users.get(did)?.status ?? 'offline';
  }

  getPresence(did: string): { status: PresenceStatus; awayMessage?: string } {
    const user = this.users.get(did);
    return { status: user?.status ?? 'offline', awayMessage: user?.awayMessage };
  }

  getVisibleTo(did: string): PresenceVisibility {
    return this.users.get(did)?.visibleTo ?? 'no-one';
  }

  getPresenceBulk(dids: string[]): Map<string, { status: PresenceStatus; awayMessage?: string }> {
    const result = new Map<string, { status: PresenceStatus; awayMessage?: string }>();
    for (const did of dids) {
      result.set(did, this.getPresence(did));
    }
    return result;
  }

  getUserRooms(did: string): Set<string> {
    return this.users.get(did)?.rooms ?? new Set();
  }

  /** O(1) via reverse index instead of O(N) scan over all users */
  getRoomMembers(roomId: string): string[] {
    const members = this.roomMembers.get(roomId);
    return members ? [...members] : [];
  }

  getOnlineUsers(): string[] {
    return Array.from(this.users.keys());
  }
}
