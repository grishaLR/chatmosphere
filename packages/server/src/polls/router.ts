import { Router } from 'express';
import {
  getPollsByRoom,
  getPollById,
  getVoteTallies,
  getTotalVoters,
  getUserVote,
} from './queries.js';
import type { Sql } from '../db/client.js';

export function pollsRouter(sql: Sql): Router {
  const router = Router();

  // GET /api/rooms/:id/polls — list polls for a room (with tallies + user vote)
  router.get('/:id/polls', async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const userDid = (req as unknown as { did: string }).did;

      const polls = await getPollsByRoom(sql, roomId);

      const pollViews = await Promise.all(
        polls.map(async (poll) => {
          const [tallies, totalVoters, myVote] = await Promise.all([
            getVoteTallies(sql, poll.id),
            getTotalVoters(sql, poll.id),
            getUserVote(sql, poll.id, userDid),
          ]);

          return {
            ...poll,
            tallies,
            totalVoters,
            myVote: myVote ? myVote.selected_options : null,
          };
        }),
      );

      res.json({ polls: pollViews });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/rooms/:id/polls/:pollId — single poll with tallies + user vote
  router.get('/:id/polls/:pollId', async (req, res, next) => {
    try {
      const userDid = (req as unknown as { did: string }).did;
      const poll = await getPollById(sql, req.params.pollId);

      if (!poll || poll.room_id !== req.params.id) {
        res.status(404).json({ error: 'Poll not found' });
        return;
      }

      const [tallies, totalVoters, myVote] = await Promise.all([
        getVoteTallies(sql, poll.id),
        getTotalVoters(sql, poll.id),
        getUserVote(sql, poll.id, userDid),
      ]);

      res.json({
        poll: {
          ...poll,
          tallies,
          totalVoters,
          myVote: myVote ? myVote.selected_options : null,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
