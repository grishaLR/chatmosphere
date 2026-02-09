/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the room record this message belongs to. */
  room: string;
  /** Message text content. */
  text: string;
  /** Rich text annotations (mentions, links). Same format as Bluesky post facets. */
  facets?: RichTextFacet[];
  /** AT-URI of the parent message for threading. */
  replyTo?: string;
  /** Timestamp of message creation. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.chatmosphere.chat.message#main' ||
      v.$type === 'app.chatmosphere.chat.message')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.message#main', v);
}

/** A rich text annotation on the message. */
export interface RichTextFacet {
  index: ByteSlice;
  features: (Mention | Link | { $type: string; [k: string]: unknown })[];
  [k: string]: unknown;
}

export function isRichTextFacet(v: unknown): v is RichTextFacet {
  return (
    isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.message#richTextFacet'
  );
}

export function validateRichTextFacet(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.message#richTextFacet', v);
}

/** Byte range within the text. */
export interface ByteSlice {
  byteStart: number;
  byteEnd: number;
  [k: string]: unknown;
}

export function isByteSlice(v: unknown): v is ByteSlice {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.message#byteSlice';
}

export function validateByteSlice(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.message#byteSlice', v);
}

/** A mention of another user. */
export interface Mention {
  did: string;
  [k: string]: unknown;
}

export function isMention(v: unknown): v is Mention {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.message#mention';
}

export function validateMention(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.message#mention', v);
}

/** A hyperlink. */
export interface Link {
  uri: string;
  [k: string]: unknown;
}

export function isLink(v: unknown): v is Link {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.chatmosphere.chat.message#link';
}

export function validateLink(v: unknown): ValidationResult {
  return lexicons.validate('app.chatmosphere.chat.message#link', v);
}
