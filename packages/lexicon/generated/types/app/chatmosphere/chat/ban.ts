/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the room the ban applies to. */
  room: string;
  /** DID of the banned user. */
  subject: string;
  /** Reason for the ban. */
  reason?: string;
  /** Timestamp of ban. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.chatmosphere.chat.ban#main' || v.$type === 'app.chatmosphere.chat.ban')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.ban#main', v);
}
