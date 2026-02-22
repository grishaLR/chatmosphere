import { Router } from 'express';
import { z } from 'zod';
import type { Sql } from '../db/client.js';
import type { EmailService } from '../email/service.js';
import { createLogger } from '../logger.js';

const log = createLogger('waitlist');

const waitlistSchema = z.object({
  email: z.string().email(),
  handle: z.string().min(1),
});

export function waitlistRouter(sql: Sql, emailService: EmailService | null): Router {
  const router = Router();

  // POST / — join the waitlist
  router.post('/', async (req, res, next) => {
    try {
      const parsed = waitlistSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
        return;
      }

      const { email, handle } = parsed.data;

      const rows = await sql`
        INSERT INTO waitlist (email, handle, source)
        VALUES (${email}, ${handle}, 'web')
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;

      const isNew = rows.length > 0;

      if (isNew && emailService) {
        // Fire-and-forget — don't block the response on Resend API
        void emailService.sendWaitlistConfirmation(email, handle);
      }

      if (isNew) {
        log.info({ email, handle }, 'New waitlist signup');
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
