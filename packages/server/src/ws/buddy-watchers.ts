import type { WebSocket } from 'ws';
import type { PresenceVisibility } from '@protoimsg/shared';
import type { Sql } from '../db/client.js';
import type { BlockService } from '../moderation/block-service.js';
import { isCommunityMember, isInnerCircle } from '../community/queries.js';
import { resolveVisibleStatus } from '../presence/visibility.js';

/**
 * Tracks which sockets are watching which DIDs for community presence.
 * When a watched DID's status changes, we notify the watchers,
 * respecting visibility settings (everyone / inner-circle / no-one).
 */
export class CommunityWatchers {
  /** did → set of sockets watching that did */
  private watchers = new Map<string, Set<WebSocket>>();
  /** socket → ownerDid (the DID that authenticated this socket) */
  private socketDids = new Map<WebSocket, string>();

  constructor(
    private sql: Sql,
    private blockService: BlockService,
  ) {}

  /** Register a socket as watching a set of DIDs */
  watch(ws: WebSocket, ownerDid: string, dids: string[]): void {
    this.socketDids.set(ws, ownerDid);
    for (const did of dids) {
      let set = this.watchers.get(did);
      if (!set) {
        set = new Set();
        this.watchers.set(did, set);
      }
      set.add(ws);
    }
  }

  /** Remove a socket from all watch lists (on disconnect) */
  unwatchAll(ws: WebSocket): void {
    this.socketDids.delete(ws);
    for (const [did, set] of this.watchers) {
      set.delete(ws);
      if (set.size === 0) {
        this.watchers.delete(did);
      }
    }
  }

  /** Notify all sockets watching a specific DID, respecting visibility */
  notify(did: string, status: string, awayMessage?: string, visibleTo?: PresenceVisibility): void {
    const set = this.watchers.get(did);
    if (!set) return;

    const visibility = visibleTo ?? 'everyone';

    // Fast path: everyone can see — but still check blocks per-watcher
    if (visibility === 'everyone') {
      const realMsg = JSON.stringify({
        type: 'community_presence',
        data: [{ did, status, awayMessage }],
      });
      const offlineMsg = JSON.stringify({
        type: 'community_presence',
        data: [{ did, status: 'offline' }],
      });
      for (const ws of set) {
        if (ws.readyState !== ws.OPEN) continue;
        try {
          const watcherDid = this.socketDids.get(ws);
          if (watcherDid && this.blockService.doesBlock(did, watcherDid)) {
            ws.send(offlineMsg);
          } else {
            ws.send(realMsg);
          }
        } catch {
          // Socket closed between readyState check and send — skip
        }
      }
      return;
    }

    // For inner-circle / no-one, resolve per-watcher
    void this.notifyWithVisibility(did, status, awayMessage, visibility, set);
  }

  private async notifyWithVisibility(
    did: string,
    status: string,
    awayMessage: string | undefined,
    visibility: PresenceVisibility,
    sockets: Set<WebSocket>,
  ): Promise<void> {
    for (const ws of sockets) {
      if (ws.readyState !== ws.OPEN) continue;

      const watcherDid = this.socketDids.get(ws);
      if (!watcherDid) continue;

      try {
        // If the user blocked this watcher, always show offline
        if (this.blockService.doesBlock(did, watcherDid)) {
          ws.send(
            JSON.stringify({
              type: 'community_presence',
              data: [{ did, status: 'offline' }],
            }),
          );
          continue;
        }

        const isMember =
          visibility === 'community' || visibility === 'inner-circle'
            ? await isCommunityMember(this.sql, did, watcherDid)
            : false;
        const isFriend =
          visibility === 'inner-circle' ? await isInnerCircle(this.sql, did, watcherDid) : false;

        const effectiveStatus = resolveVisibleStatus(
          visibility,
          status as 'online' | 'away' | 'idle' | 'offline' | 'invisible',
          isMember,
          isFriend,
        );
        const effectiveAway = effectiveStatus === 'offline' ? undefined : awayMessage;

        ws.send(
          JSON.stringify({
            type: 'community_presence',
            data: [{ did, status: effectiveStatus, awayMessage: effectiveAway }],
          }),
        );
      } catch {
        // Socket closed between readyState check and send — skip
      }
    }
  }
}
