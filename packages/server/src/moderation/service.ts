import type { Sql } from '../db/client.js';
import { filterText, type FilterResult } from './filter.js';
import { isUserBanned } from './queries.js';
import { getRoomById } from '../rooms/queries.js';
import { getDidCreationDate, getAccountAgeDays } from './account-age.js';

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

  const room = await getRoomById(sql, roomId);
  if (!room) {
    return { allowed: false, reason: 'Room not found' };
  }

  // Account age gate
  if (room.min_account_age_days > 0) {
    const creationDate = await getDidCreationDate(did);
    if (creationDate) {
      const ageDays = getAccountAgeDays(creationDate);
      if (ageDays < room.min_account_age_days) {
        return {
          allowed: false,
          reason: `Account must be at least ${String(room.min_account_age_days)} days old to join this room`,
        };
      }
    }
    // If we can't resolve creation date (e.g. did:web), allow access
  }

  return { allowed: true };
}
