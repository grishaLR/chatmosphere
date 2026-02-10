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
    allowlistEnabled: z.boolean().optional(),
  })
  .optional();

export const roomRecordSchema = z.object({
  name: z.string().max(100),
  topic: z.string().max(200),
  description: z.string().max(500).optional(),
  purpose: z.enum(['discussion', 'event', 'community', 'support']),
  createdAt: z.string(),
  settings: roomSettings,
});

const replyRefSchema = z
  .object({
    root: z.string(),
    parent: z.string(),
  })
  .optional();

export const messageRecordSchema = z.object({
  room: z.string(),
  text: z.string().max(3000),
  facets: z.array(z.unknown()).optional(),
  reply: replyRefSchema,
  embed: z.unknown().optional(),
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

const communityMemberSchema = z.object({
  did: z.string(),
  addedAt: z.string(),
});

const communityGroupSchema = z.object({
  name: z.string().max(100),
  isInnerCircle: z.boolean().optional(),
  members: z.array(communityMemberSchema).max(500),
});

export const communityRecordSchema = z.object({
  groups: z.array(communityGroupSchema).max(50),
});

export const allowlistRecordSchema = z.object({
  room: z.string(),
  subject: z.string(),
  createdAt: z.string(),
});

export type RoomRecordParsed = z.infer<typeof roomRecordSchema>;
export type MessageRecordParsed = z.infer<typeof messageRecordSchema>;
export type BanRecordParsed = z.infer<typeof banRecordSchema>;
export type RoleRecordParsed = z.infer<typeof roleRecordSchema>;
export type CommunityRecordParsed = z.infer<typeof communityRecordSchema>;
export type AllowlistRecordParsed = z.infer<typeof allowlistRecordSchema>;
