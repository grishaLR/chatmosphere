/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon';
import { isObj, hasProp } from '../../../../util';
import { lexicons } from '../../../../lexicons';
import { CID } from 'multiformats/cid';

export interface Record {
  /** AT-URI of the channel record this message belongs to. */
  channel: string;
  /** Message text content. */
  text: string;
  /** Rich text annotations (mentions, links, tags, formatting). Extends the Bluesky facet convention with additional formatting features. */
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

/** Annotation of a sub-string within rich text. */
export interface RichTextFacet {
  index: ByteSlice;
  features: (
    | Mention
    | Link
    | Tag
    | Bold
    | Italic
    | Strikethrough
    | CodeInline
    | CodeBlock
    | Blockquote
    | { $type: string; [k: string]: unknown }
  )[];
  [k: string]: unknown;
}

export function isRichTextFacet(v: unknown): v is RichTextFacet {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#richTextFacet';
}

export function validateRichTextFacet(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#richTextFacet', v);
}

/** Specifies the sub-string range a facet feature applies to. Start index is inclusive, end index is exclusive. Indices are zero-indexed, counting bytes of the UTF-8 encoded text. */
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

/** Facet feature for mention of another account. The text is usually a handle, including a '@' prefix, but the facet reference is a DID. */
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

/** Facet feature for a URL. The text URL may have been simplified or truncated, but the facet reference should be a complete URL. */
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

/** Facet feature for a hashtag. The text usually includes a '#' prefix, but the facet reference should not. */
export interface Tag {
  tag: string;
  [k: string]: unknown;
}

export function isTag(v: unknown): v is Tag {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#tag';
}

export function validateTag(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#tag', v);
}

/** Facet feature for bold text. */
export interface Bold {
  [k: string]: unknown;
}

export function isBold(v: unknown): v is Bold {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#bold';
}

export function validateBold(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#bold', v);
}

/** Facet feature for italic text. */
export interface Italic {
  [k: string]: unknown;
}

export function isItalic(v: unknown): v is Italic {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#italic';
}

export function validateItalic(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#italic', v);
}

/** Facet feature for strikethrough text. */
export interface Strikethrough {
  [k: string]: unknown;
}

export function isStrikethrough(v: unknown): v is Strikethrough {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#strikethrough';
}

export function validateStrikethrough(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#strikethrough', v);
}

/** Facet feature for inline code. */
export interface CodeInline {
  [k: string]: unknown;
}

export function isCodeInline(v: unknown): v is CodeInline {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#codeInline';
}

export function validateCodeInline(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#codeInline', v);
}

/** Facet feature for a code block. The text contains the code content. */
export interface CodeBlock {
  /** Programming language for syntax highlighting. */
  lang?: string;
  [k: string]: unknown;
}

export function isCodeBlock(v: unknown): v is CodeBlock {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#codeBlock';
}

export function validateCodeBlock(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#codeBlock', v);
}

/** Facet feature for a block quotation. */
export interface Blockquote {
  [k: string]: unknown;
}

export function isBlockquote(v: unknown): v is Blockquote {
  return isObj(v) && hasProp(v, '$type') && v.$type === 'app.protoimsg.chat.message#blockquote';
}

export function validateBlockquote(v: unknown): ValidationResult {
  return lexicons.validate('app.protoimsg.chat.message#blockquote', v);
}
