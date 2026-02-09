/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** Display name for the room. */
  name: string;
  /** What the room is about. */
  description?: string;
  /** Room purpose categorization. */
  purpose: 'discussion' | 'event' | 'community' | 'support' | (string & {});
  /** Timestamp of room creation. */
  createdAt: string;
  settings?: RoomSettings;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.chatmosphere.chat.room#main' || v.$type === 'app.chatmosphere.chat.room')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.room#main', v);
}

/** Configurable room settings. */
export interface RoomSettings {
  /** Room discoverability. public = listed in directory, unlisted = link only, private = invite only. */
  visibility: 'public' | 'unlisted' | 'private' | (string & {});
  /** Minimum atproto account age in days to participate. */
  minAccountAgeDays: number;
  /** Minimum seconds between messages per user. 0 = disabled. */
  slowModeSeconds: number;
  [k: string]: unknown;
}

export function isRoomSettings(v: unknown): v is RoomSettings {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.room#roomSettings';
}

export function validateRoomSettings(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.room#roomSettings', v);
}
