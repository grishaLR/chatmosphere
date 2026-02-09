/**
 * Zod schemas for Jetstream record validation.
 * Mirrors lexicon types so malformed or adversarial records are skipped, not indexed.
 */
import { z } from 'zod';

const roomSettings = z
  .object({
    visibility: z.enum(['public', 'unlisted', 'private']).optional(),
    minAccountAgeDays: z.number().int().min(0).optional(),
    slowModeSeconds: z.number().int().min(0).optional(),
  })
  .optional();

export const roomRecordSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  purpose: z.enum(['discussion', 'event', 'community', 'support']),
  createdAt: z.string(),
  settings: roomSettings,
});

export const messageRecordSchema = z.object({
  room: z.string(),
  text: z.string().max(3000),
  facets: z.array(z.unknown()).optional(),
  replyTo: z.string().optional(),
  createdAt: z.string(),
});

export const banRecordSchema = z.object({
  room: z.string(),
  subject: z.string(),
  reason: z.string().max(300).optional(),
  createdAt: z.string(),
});

export const roleRecordSchema = z.object({
  room: z.string(),
  subject: z.string(),
  role: z.enum(['moderator', 'owner']),
  createdAt: z.string(),
});

const buddyMemberSchema = z.object({
  did: z.string(),
  addedAt: z.string(),
});

const buddyGroupSchema = z.object({
  name: z.string().max(100),
  isCloseFriends: z.boolean().optional(),
  members: z.array(buddyMemberSchema).max(500),
});

export const buddyListRecordSchema = z.object({
  groups: z.array(buddyGroupSchema).max(50),
});

export type RoomRecordParsed = z.infer<typeof roomRecordSchema>;
export type MessageRecordParsed = z.infer<typeof messageRecordSchema>;
export type BanRecordParsed = z.infer<typeof banRecordSchema>;
export type RoleRecordParsed = z.infer<typeof roleRecordSchema>;
export type BuddyListRecordParsed = z.infer<typeof buddyListRecordSchema>;
