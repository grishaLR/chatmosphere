import type { Sql } from '../db/client.js';
import { filterText, type FilterResult } from './filter.js';
import { isUserBanned } from './queries.js';
import { getRoomById } from '../rooms/queries.js';

export function checkMessageContent(text: string): FilterResult {
  return filterText(text);
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
}

export async function checkUserAccess(
  sql: Sql,
  roomId: string,
  did: string,
): Promise<AccessResult> {
  const banned = await isUserBanned(sql, roomId, did);
  if (banned) {
    return { allowed: false, reason: 'User is banned from this room' };
  }

  // Fetch room settings for additional checks
  const room = await getRoomById(sql, roomId);
  if (!room) {
    return { allowed: false, reason: 'Room not found' };
  }

  // Account age check (alpha soft-gate)
  if (room.min_account_age_days > 0) {
    // For alpha: just check if the room requires account age
    // Full implementation would resolve DID creation date via ATProto
    // For now, log and allow (the infrastructure is in place)
  }

  return { allowed: true };
}
