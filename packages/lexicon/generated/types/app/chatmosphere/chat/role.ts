/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the room. */
  room: string;
  /** DID of the user being assigned the role. */
  subject: string;
  /** The role being assigned. */
  role: 'moderator' | 'owner' | (string & {});
  /** Timestamp of role assignment. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.chatmosphere.chat.role#main' || v.$type === 'app.chatmosphere.chat.role')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.role#main', v);
}
