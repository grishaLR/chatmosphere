/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the channel this poll belongs to. */
  channel: string;
  /** The poll question. */
  question: string;
  /** Poll answer options. */
  options: string[];
  /** Whether voters can select multiple options. */
  allowMultiple: boolean;
  /** When the poll closes. Omit for no expiry. */
  expiresAt?: string;
  /** Timestamp of poll creation. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.protoimsg.chat.poll#main' || v.$type === 'app.protoimsg.chat.poll')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.poll#main', v);
}
