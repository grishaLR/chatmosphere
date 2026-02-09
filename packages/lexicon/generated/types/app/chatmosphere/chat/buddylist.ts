/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** Named groups of buddies, like AIM's buddy list categories. */
  groups: BuddyGroup[];
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.chatmosphere.chat.buddylist#main' ||
      v.$type === 'app.chatmosphere.chat.buddylist')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.buddylist#main', v);
}

/** A named group of buddies. */
export interface BuddyGroup {
  /** Group label. */
  name: string;
  /** Whether this is a close friends group for presence visibility. */
  isCloseFriends: boolean;
  /** DIDs of group members. */
  members: BuddyMember[];
  [k: string]: unknown;
}

export function isBuddyGroup(v: unknown): v is BuddyGroup {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.buddylist#buddyGroup'
  );
}

export function validateBuddyGroup(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.buddylist#buddyGroup', v);
}

/** A buddy in a group. */
export interface BuddyMember {
  /** The buddy's DID. */
  did: string;
  /** When this buddy was added. */
  addedAt: string;
  [k: string]: unknown;
}

export function isBuddyMember(v: unknown): v is BuddyMember {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.buddylist#buddyMember'
  );
}

export function validateBuddyMember(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.buddylist#buddyMember', v);
}
