/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** Server-issued challenge nonce to prove write access. */
  nonce: string;
  /** When this verification record was created. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.protoimsg.chat.authVerify#main' ||
      v.$type === 'app.protoimsg.chat.authVerify')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.authVerify#main', v);
}
