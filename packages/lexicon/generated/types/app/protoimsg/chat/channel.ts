/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the room this channel belongs to. */
  room: string;
  /** Display name for the channel. */
  name: string;
  /** What the channel is about. */
  description?: string;
  /** Sort position within the room. Lower numbers appear first. */
  position?: number;
  /** Who can post messages in this channel. */
  postPolicy?: 'everyone' | 'owner' | 'moderators' | (string & {});
  /** Timestamp of channel creation. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.protoimsg.chat.channel#main' || v.$type === 'app.protoimsg.chat.channel')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.channel#main', v);
}
