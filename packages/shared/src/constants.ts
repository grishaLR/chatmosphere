/** atproto Lexicon NSIDs for protoimsg collections */
export const NSID = {
  Room: 'app.protoimsg.chat.room',
  Message: 'app.protoimsg.chat.message',
  Community: 'app.protoimsg.chat.community',
  Presence: 'app.protoimsg.chat.presence',
  Poll: 'app.protoimsg.chat.poll',
  Vote: 'app.protoimsg.chat.vote',
  Ban: 'app.protoimsg.chat.ban',
  Role: 'app.protoimsg.chat.role',
  Allowlist: 'app.protoimsg.chat.allowlist',
} as const;

/** Namespace prefix for all protoimsg Lexicon records */
export const NSID_PREFIX = 'app.protoimsg.chat.';

/** Default room settings */
export const ROOM_DEFAULTS = {
  visibility: 'public' as const,
  purpose: 'discussion' as const,
  minAccountAgeDays: 0,
  slowModeSeconds: 0,
};

/** Server limits */
export const LIMITS = {
  /** Maximum message text length in characters */
  maxMessageLength: 3000,
  /** Maximum room name length */
  maxRoomNameLength: 100,
  /** Maximum room topic length */
  maxRoomTopicLength: 200,
  /** Maximum room description length */
  maxRoomDescriptionLength: 500,
  /** Maximum away message length */
  maxAwayMessageLength: 300,
  /** Maximum poll options */
  maxPollOptions: 10,
  /** Maximum poll question length */
  maxPollQuestionLength: 200,
  /** Maximum buddy list groups */
  maxBuddyGroups: 50,
  /** Maximum members per buddy group */
  maxGroupMembers: 500,
  /** Default message retention in days */
  defaultRetentionDays: 7,
  /** Maximum page size for paginated queries */
  maxPageSize: 200,
  /** Default page size for paginated queries */
  defaultPageSize: 50,
} as const;

/** DM-specific limits */
export const DM_LIMITS = {
  /** Maximum DM message text length in characters */
  maxMessageLength: 3000,
  /** Maximum preview text length for dm_incoming notifications */
  maxPreviewLength: 100,
} as const;
