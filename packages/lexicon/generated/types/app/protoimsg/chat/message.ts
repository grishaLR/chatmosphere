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
  reply?: ReplyRef;
  embed?: ImageEmbed | VideoEmbed | ExternalEmbed | { $type: string; [k: string]: unknown };
  /** Timestamp of message creation. */
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'app.protoimsg.chat.message#main' || v.$type === 'app.protoimsg.chat.message')
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#main', v);
}

/** Thread reply reference with root and parent for efficient deep thread traversal. */
export interface ReplyRef {
  /** AT-URI of the root message in the thread. */
  root: string;
  /** AT-URI of the direct parent message being replied to. */
  parent: string;
  [k: string]: unknown;
}

export function isReplyRef(v: unknown): v is ReplyRef {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#replyRef';
}

export function validateReplyRef(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#replyRef', v);
}

/** Embedded images. */
export interface ImageEmbed {
  images: ImageItem[];
  [k: string]: unknown;
}

export function isImageEmbed(v: unknown): v is ImageEmbed {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#imageEmbed';
}

export function validateImageEmbed(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#imageEmbed', v);
}

/** A single embedded image. */
export interface ImageItem {
  /** Image blob reference. */
  image: BlobRef;
  /** Alt text for accessibility. */
  alt: string;
  aspectRatio?: AspectRatio;
  [k: string]: unknown;
}

export function isImageItem(v: unknown): v is ImageItem {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#imageItem';
}

export function validateImageItem(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#imageItem', v);
}

/** Embedded video. */
export interface VideoEmbed {
  /** Video blob reference. */
  video: BlobRef;
  /** Alt text for accessibility. */
  alt?: string;
  /** Video thumbnail image. */
  thumbnail?: BlobRef;
  aspectRatio?: AspectRatio;
  [k: string]: unknown;
}

export function isVideoEmbed(v: unknown): v is VideoEmbed {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#videoEmbed';
}

export function validateVideoEmbed(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#videoEmbed', v);
}

/** External link card. */
export interface ExternalEmbed {
  /** URL of the external content. */
  uri: string;
  /** Title of the external content. */
  title: string;
  /** Description or summary. */
  description?: string;
  /** Thumbnail image for the link card. */
  thumb?: BlobRef;
  [k: string]: unknown;
}

export function isExternalEmbed(v: unknown): v is ExternalEmbed {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#externalEmbed';
}

export function validateExternalEmbed(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#externalEmbed', v);
}

/** Width and height for layout before media loads. */
export interface AspectRatio {
  width: number;
  height: number;
  [k: string]: unknown;
}

export function isAspectRatio(v: unknown): v is AspectRatio {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#aspectRatio';
}

export function validateAspectRatio(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#aspectRatio', v);
}

/** A rich text annotation on the message. */
export interface RichTextFacet {
  index: ByteSlice;
  features: (Mention | Link | { $type: string; [k: string]: unknown })[];
  [k: string]: unknown;
}

export function isRichTextFacet(v: unknown): v is RichTextFacet {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#richTextFacet';
}

export function validateRichTextFacet(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#richTextFacet', v);
}

/** Byte range within the text. */
export interface ByteSlice {
  byteStart: number;
  byteEnd: number;
  [k: string]: unknown;
}

export function isByteSlice(v: unknown): v is ByteSlice {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#byteSlice';
}

export function validateByteSlice(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#byteSlice', v);
}

/** A mention of another user. */
export interface Mention {
  did: string;
  [k: string]: unknown;
}

export function isMention(v: unknown): v is Mention {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#mention';
}

export function validateMention(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#mention', v);
}

/** A hyperlink. */
export interface Link {
  uri: string;
  [k: string]: unknown;
}

export function isLink(v: unknown): v is Link {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#link';
}

export function validateLink(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#link', v);
}
