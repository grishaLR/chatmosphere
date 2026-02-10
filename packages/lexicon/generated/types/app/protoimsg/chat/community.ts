/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** Named groups of community members, like AIM's buddy list categories. */
  groups: CommunityGroup[];
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.protoimsg.chat.community#main' || v.$type === 'app.protoimsg.chat.community')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.community#main', v);
}

/** A named group of community members. */
export interface CommunityGroup {
  /** Group label. */
  name: string;
  /** Whether this is an inner circle group for presence visibility. */
  isInnerCircle: boolean;
  /** DIDs of group members. */
  members: CommunityMember[];
  [k: string]: unknown;
}

export function isCommunityGroup(v: unknown): v is CommunityGroup {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.community#communityGroup'
  );
}

export function validateCommunityGroup(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.community#communityGroup', v);
}

/** A member in a community group. */
export interface CommunityMember {
  /** The member's DID. */
  did: string;
  /** When this member was added. */
  addedAt: string;
  [k: string]: unknown;
}

export function isCommunityMember(v: unknown): v is CommunityMember {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.community#communityMember'
  );
}

export function validateCommunityMember(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.community#communityMember', v);
}
