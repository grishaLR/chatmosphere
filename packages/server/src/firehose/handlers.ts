import { NSID } from '@protoimsg/shared';
import type { Sql } from '../db/client.js';
import { createRoom } from '../rooms/queries.js';
import { insertMessage } from '../messages/queries.js';
import { recordModAction, isUserBanned, upsertRoomRole } from '../moderation/queries.js';
import { upsertCommunityList, syncCommunityMembers } from '../community/queries.js';
import { checkMessageContent } from '../moderation/service.js';
import type { WsServer } from '../ws/server.js';
import {
  roomRecordSchema,
  messageRecordSchema,
  banRecordSchema,
  roleRecordSchema,
  communityRecordSchema,
  allowlistRecordSchema,
} from './record-schemas.js';

export interface FirehoseEvent {
  did: string;
  collection: string;
  rkey: string;
  record: unknown;
  uri: string;
}

export function createHandlers(db: Sql, wss: WsServer) {
  const handlers: Record<string, (event: FirehoseEvent) => Promise<void>> = {
    [NSID.Room]: async (event) => {
      const parsed = roomRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(
          `Invalid room record from ${event.did} (${event.rkey}):`,
          parsed.error.message,
        );
        return;
      }
      const record = parsed.data;
      await createRoom(db, {
        id: event.rkey,
        uri: event.uri,
        did: event.did,
        name: record.name,
        topic: record.topic,
        description: record.description,
        purpose: record.purpose,
        visibility: record.settings?.visibility ?? 'public',
        minAccountAgeDays: record.settings?.minAccountAgeDays ?? 0,
        slowModeSeconds: record.settings?.slowModeSeconds ?? 0,
        allowlistEnabled: record.settings?.allowlistEnabled ?? false,
        createdAt: record.createdAt,
      });
      console.info(`Indexed room: ${record.name} (${event.rkey})`);
    },

    [NSID.Message]: async (event) => {
      const parsed = messageRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(
          `Invalid message record from ${event.did} (${event.rkey}):`,
          parsed.error.message,
        );
        return;
      }
      const record = parsed.data;
      const roomId = extractRkey(record.room);

      // Content filter — skip indexing if blocked
      const filterResult = checkMessageContent(record.text);
      if (!filterResult.passed) {
        console.info(`Message filtered from ${event.did}: ${filterResult.reason ?? 'blocked'}`);
        return;
      }

      // Ban check — skip broadcast if banned (still index, record exists on atproto)
      const banned = await isUserBanned(db, roomId, event.did);

      await insertMessage(db, {
        id: event.rkey,
        uri: event.uri,
        did: event.did,
        roomId,
        text: record.text,
        replyRoot: record.reply?.root,
        replyParent: record.reply?.parent,
        facets: record.facets,
        embed: record.embed,
        createdAt: record.createdAt,
      });

      if (!banned) {
        wss.broadcastToRoom(roomId, {
          type: 'message',
          data: {
            id: event.rkey,
            uri: event.uri,
            did: event.did,
            roomId,
            text: record.text,
            reply: record.reply,
            facets: record.facets,
            embed: record.embed,
            createdAt: record.createdAt,
          },
        });
      }
    },

    [NSID.Ban]: async (event) => {
      const parsed = banRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(`Invalid ban record from ${event.did} (${event.rkey}):`, parsed.error.message);
        return;
      }
      const record = parsed.data;
      await recordModAction(db, {
        roomId: extractRkey(record.room),
        actorDid: event.did,
        subjectDid: record.subject,
        action: 'ban',
        reason: record.reason,
      });
      console.info(`Ban indexed: ${record.subject} from room ${extractRkey(record.room)}`);
    },

    [NSID.Role]: async (event) => {
      const parsed = roleRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(
          `Invalid role record from ${event.did} (${event.rkey}):`,
          parsed.error.message,
        );
        return;
      }
      const record = parsed.data;
      await upsertRoomRole(db, {
        roomId: extractRkey(record.room),
        subjectDid: record.subject,
        role: record.role,
        grantedBy: event.did,
        uri: event.uri,
        createdAt: record.createdAt,
      });
      console.info(
        `Role indexed: ${record.subject} as ${record.role} in ${extractRkey(record.room)}`,
      );
    },

    [NSID.Community]: async (event) => {
      const parsed = communityRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(`Invalid community record from ${event.did}:`, parsed.error.message);
        return;
      }
      const record = parsed.data;
      await upsertCommunityList(db, { did: event.did, groups: record.groups });

      // Flatten all members across groups for denormalized lookup table
      const allMembers: Array<{ did: string; addedAt: string }> = [];
      for (const group of record.groups) {
        for (const member of group.members) {
          allMembers.push({ did: member.did, addedAt: member.addedAt });
        }
      }
      await syncCommunityMembers(db, event.did, allMembers);
      console.info(`Community list indexed for ${event.did}: ${allMembers.length} members`);
    },

    [NSID.Allowlist]: async (event) => {
      const parsed = allowlistRecordSchema.safeParse(event.record);
      if (!parsed.success) {
        console.warn(
          `Invalid allowlist record from ${event.did} (${event.rkey}):`,
          parsed.error.message,
        );
        return;
      }
      const record = parsed.data;
      const roomId = extractRkey(record.room);
      await db`
        INSERT INTO room_allowlist (id, room_id, subject_did, uri, created_at)
        VALUES (${event.rkey}, ${roomId}, ${record.subject}, ${event.uri}, ${record.createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
      console.info(`Allowlist entry indexed: ${record.subject} in room ${roomId}`);
    },

    [NSID.Presence]: (event) => {
      // Log-only for MVP — in-memory tracker handles ephemeral presence state
      console.info(`Presence record from ${event.did} (rkey: ${event.rkey})`);
      return Promise.resolve();
    },
  };

  return handlers;
}

/** Extract the rkey from an AT-URI: at://did/collection/rkey → rkey */
function extractRkey(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] ?? uri;
}
