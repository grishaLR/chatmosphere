import { useCallback, useEffect, useState } from 'react';
import { NSID } from '@protoimsg/shared';
import { fetchPolls } from '../lib/api';
import {
  createPollRecord,
  createVoteRecord,
  generateTid,
  type CreatePollInput,
} from '../lib/atproto';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from './useAuth';
import type { PollView } from '../types';

export function usePolls(roomId: string) {
  const [polls, setPolls] = useState<PollView[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscribe } = useWebSocket();
  const { agent, did } = useAuth();

  // Load polls on mount
  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        const data = await fetchPolls(roomId, { signal: ac.signal });
        if (!ac.signal.aborted) {
          setPolls(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to load polls:', err);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => {
      ac.abort();
    };
  }, [roomId]);

  // Subscribe to WS poll events
  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === 'poll_created') {
        const event = msg;
        if (event.data.roomId !== roomId) return;

        setPolls((prev) => {
          // Dedup: if we have a pending poll with same id, replace it
          const existing = prev.findIndex((p) => p.id === event.data.id);
          if (existing !== -1) {
            const updated = [...prev];
            updated[existing] = {
              ...updated[existing],
              uri: event.data.uri,
              pending: false,
            } as PollView;
            return updated;
          }

          return [
            ...prev,
            {
              id: event.data.id,
              uri: event.data.uri,
              did: event.data.did,
              room_id: event.data.roomId,
              question: event.data.question,
              options: event.data.options,
              allow_multiple: event.data.allowMultiple,
              expires_at: event.data.expiresAt ?? null,
              created_at: event.data.createdAt,
              indexed_at: event.data.createdAt,
              tallies: {},
              totalVoters: 0,
              myVote: null,
            },
          ];
        });
      } else if (msg.type === 'poll_vote') {
        const event = msg;
        if (event.data.roomId !== roomId) return;

        setPolls((prev) =>
          prev.map((p) => {
            if (p.id !== event.data.pollId) return p;
            const updated: PollView = {
              ...p,
              tallies: event.data.tallies,
              totalVoters: event.data.totalVoters,
            };
            if (event.data.voterDid === did) {
              updated.myVote = event.data.selectedOptions;
            }
            return updated;
          }),
        );
      }
    });

    return unsub;
  }, [roomId, subscribe, did]);

  // Create a poll with optimistic update
  const createPoll = useCallback(
    async (input: Omit<CreatePollInput, 'roomUri'>, roomUri: string) => {
      if (!agent || !did) return;

      const rkey = generateTid();
      const uri = `at://${did}/${NSID.Poll}/${rkey}`;

      // Optimistic: add pending poll
      setPolls((prev) => [
        ...prev,
        {
          id: rkey,
          uri,
          did,
          room_id: roomId,
          question: input.question,
          options: input.options,
          allow_multiple: input.allowMultiple ?? false,
          expires_at: input.expiresAt ?? null,
          created_at: new Date().toISOString(),
          indexed_at: new Date().toISOString(),
          tallies: {},
          totalVoters: 0,
          myVote: null,
          pending: true,
        },
      ]);

      try {
        await createPollRecord(agent, { ...input, roomUri }, rkey);
      } catch (err) {
        // Rollback on failure
        setPolls((prev) => prev.filter((p) => p.id !== rkey));
        console.error('Failed to create poll:', err);
        throw err;
      }
    },
    [agent, did, roomId],
  );

  // Cast a vote with optimistic update
  const castVote = useCallback(
    async (pollId: string, pollUri: string, selectedOptions: number[]) => {
      if (!agent || !did) return;

      // Optimistic: update tallies locally
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p;
          const newTallies = { ...p.tallies };

          // Remove old vote tallies if re-voting
          if (p.myVote) {
            for (const idx of p.myVote) {
              newTallies[idx] = Math.max(0, (newTallies[idx] ?? 0) - 1);
            }
          }

          // Add new vote tallies
          for (const idx of selectedOptions) {
            newTallies[idx] = (newTallies[idx] ?? 0) + 1;
          }

          return {
            ...p,
            tallies: newTallies,
            totalVoters: p.myVote ? p.totalVoters : p.totalVoters + 1,
            myVote: selectedOptions,
          };
        }),
      );

      try {
        await createVoteRecord(agent, { pollUri, selectedOptions });
      } catch (err) {
        // Rollback — refetch polls
        console.error('Failed to cast vote:', err);
        try {
          const data = await fetchPolls(roomId);
          setPolls(data);
        } catch {
          // ignore refetch failure
        }
        throw err;
      }
    },
    [agent, did, roomId],
  );

  return { polls, loading, createPoll, castVote };
}
