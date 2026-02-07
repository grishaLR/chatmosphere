import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from '../contexts/WebSocketContext';
import { getBuddyListRecord, putBuddyListRecord } from '../lib/atproto';
import { fetchPresence } from '../lib/api';
import type { BuddyGroup } from '@chatmosphere/lexicon';
import type { BuddyWithPresence } from '../types';
import type { ServerMessage } from '@chatmosphere/shared';

const DEFAULT_GROUP = 'Buddies';

export function useBuddyList() {
  const { agent } = useAuth();
  const { send, subscribe } = useWebSocket();
  const [buddies, setBuddies] = useState<BuddyWithPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<BuddyGroup[]>([]);

  // Load buddy list from PDS + fetch presence
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!agent) return;

    cancelledRef.current = false;
    const currentAgent = agent;

    async function load() {
      const pdsGroups = await getBuddyListRecord(currentAgent);
      if (cancelledRef.current) return;
      setGroups(pdsGroups);

      // Flatten all DIDs
      const allDids = pdsGroups.flatMap((g) => g.members.map((m) => m.did));
      const addedAtMap = new Map<string, string>();
      for (const g of pdsGroups) {
        for (const m of g.members) {
          if (!addedAtMap.has(m.did)) {
            addedAtMap.set(m.did, m.addedAt);
          }
        }
      }

      if (allDids.length === 0) {
        setBuddies([]);
        setLoading(false);
        return;
      }

      const presenceList = await fetchPresence(allDids);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref mutated in cleanup
      if (cancelledRef.current) return;

      setBuddies(
        presenceList.map((p) => ({
          did: p.did,
          status: p.status,
          awayMessage: p.awayMessage,
          addedAt: addedAtMap.get(p.did) ?? new Date().toISOString(),
        })),
      );
      setLoading(false);

      // Request WS-based buddy presence for live updates
      send({ type: 'request_buddy_presence', dids: allDids });
    }

    void load();
    return () => {
      cancelledRef.current = true;
    };
  }, [agent, send]);

  // Subscribe to presence + buddy_presence WS events
  useEffect(() => {
    const unsub = subscribe((msg: ServerMessage) => {
      if (msg.type === 'buddy_presence') {
        setBuddies((prev) => {
          const presMap = new Map(msg.data.map((p) => [p.did, p]));
          return prev.map((b) => {
            const update = presMap.get(b.did);
            if (update) {
              return { ...b, status: update.status, awayMessage: update.awayMessage };
            }
            return b;
          });
        });
      } else if (msg.type === 'presence') {
        setBuddies((prev) =>
          prev.map((b) =>
            b.did === msg.data.did
              ? { ...b, status: msg.data.status, awayMessage: msg.data.awayMessage }
              : b,
          ),
        );
      }
    });

    return unsub;
  }, [subscribe]);

  const addBuddy = useCallback(
    async (did: string) => {
      if (!agent) return;

      const now = new Date().toISOString();
      const newMember = { did, addedAt: now };

      // Update local groups
      let updatedGroups: BuddyGroup[];
      const defaultGroup = groups.find((g) => g.name === DEFAULT_GROUP);
      if (defaultGroup) {
        if (defaultGroup.members.some((m) => m.did === did)) return; // already exists
        updatedGroups = groups.map((g) =>
          g.name === DEFAULT_GROUP ? { ...g, members: [...g.members, newMember] } : g,
        );
      } else {
        updatedGroups = [...groups, { name: DEFAULT_GROUP, members: [newMember] }];
      }

      setGroups(updatedGroups);
      setBuddies((prev) => [...prev, { did, status: 'offline', addedAt: now }]);

      await putBuddyListRecord(agent, updatedGroups);

      // Fetch their current presence
      const presenceList = await fetchPresence([did]);
      const buddyPresence = presenceList[0];
      if (buddyPresence) {
        setBuddies((prev) =>
          prev.map((b) =>
            b.did === did
              ? { ...b, status: buddyPresence.status, awayMessage: buddyPresence.awayMessage }
              : b,
          ),
        );
      }
    },
    [agent, groups],
  );

  const removeBuddy = useCallback(
    async (did: string) => {
      if (!agent) return;

      const updatedGroups = groups.map((g) => ({
        ...g,
        members: g.members.filter((m) => m.did !== did),
      }));

      setGroups(updatedGroups);
      setBuddies((prev) => prev.filter((b) => b.did !== did));

      await putBuddyListRecord(agent, updatedGroups);
    },
    [agent, groups],
  );

  return { buddies, loading, addBuddy, removeBuddy };
}
