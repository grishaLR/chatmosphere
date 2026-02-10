/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon';

export const schemaDict = {
  AppProtoimsgChatAllowlist: {
    lexicon: 1,
    id: 'app.protoimsg.chat.allowlist',
    defs: {
      main: {
        type: 'record',
        description:
          "An allowlist entry for a room. When the room has allowlistEnabled, only allowlisted users can send messages. Lives in the room owner/mod's repo.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['room', 'subject', 'createdAt'],
          properties: {
            room: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the room the allowlist entry applies to.',
            },
            subject: {
              type: 'string',
              format: 'did',
              description: 'DID of the allowlisted user.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of allowlist entry creation.',
            },
          },
        },
      },
    },
  },
  AppProtoimsgChatBan: {
    lexicon: 1,
    id: 'app.protoimsg.chat.ban',
    defs: {
      main: {
        type: 'record',
        description: "A ban issued by a room owner or moderator. Lives in the issuer's repo.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['room', 'subject', 'createdAt'],
          properties: {
            room: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the room the ban applies to.',
            },
            subject: {
              type: 'string',
              format: 'did',
              description: 'DID of the banned user.',
            },
            reason: {
              type: 'string',
              maxLength: 300,
              description: 'Reason for the ban.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of ban.',
            },
          },
        },
      },
    },
  },
  AppProtoimsgChatCommunity: {
    lexicon: 1,
    id: 'app.protoimsg.chat.community',
    defs: {
      main: {
        type: 'record',
        description: "The user's community list. Portable across any app implementing the Lexicon.",
        key: 'literal:self',
        record: {
          type: 'object',
          required: ['groups'],
          properties: {
            groups: {
              type: 'array',
              description: "Named groups of community members, like AIM's buddy list categories.",
              maxLength: 50,
              items: {
                type: 'ref',
                ref: 'lex:app.protoimsg.chat.community#communityGroup',
              },
            },
          },
        },
      },
      communityGroup: {
        type: 'object',
        description: 'A named group of community members.',
        required: ['name', 'members'],
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Group label.',
          },
          isInnerCircle: {
            type: 'boolean',
            default: false,
            description: 'Whether this is an inner circle group for presence visibility.',
          },
          members: {
            type: 'array',
            maxLength: 500,
            description: 'DIDs of group members.',
            items: {
              type: 'ref',
              ref: 'lex:app.protoimsg.chat.community#communityMember',
            },
          },
        },
      },
      communityMember: {
        type: 'object',
        description: 'A member in a community group.',
        required: ['did', 'addedAt'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
            description: "The member's DID.",
          },
          addedAt: {
            type: 'string',
            format: 'datetime',
            description: 'When this member was added.',
          },
        },
      },
    },
  },
  AppProtoimsgChatMessage: {
    lexicon: 1,
    id: 'app.protoimsg.chat.message',
    defs: {
      main: {
        type: 'record',
        description: "A chat message. Lives in the sender's repo, points to a room.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['room', 'text', 'createdAt'],
          properties: {
            room: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the room record this message belongs to.',
            },
            text: {
              type: 'string',
              maxLength: 3000,
              maxGraphemes: 1000,
              description: 'Message text content.',
            },
            facets: {
              type: 'array',
              description:
                'Rich text annotations (mentions, links). Same format as Bluesky post facets.',
              items: {
                type: 'ref',
                ref: 'lex:app.protoimsg.chat.message#richTextFacet',
              },
            },
            reply: {
              type: 'ref',
              ref: 'lex:app.protoimsg.chat.message#replyRef',
              description: 'Structured reply reference for threading.',
            },
            embed: {
              type: 'union',
              refs: [
                'lex:app.protoimsg.chat.message#imageEmbed',
                'lex:app.protoimsg.chat.message#videoEmbed',
                'lex:app.protoimsg.chat.message#externalEmbed',
              ],
              description: 'Embedded media or link card.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of message creation.',
            },
          },
        },
      },
      replyRef: {
        type: 'object',
        description:
          'Thread reply reference with root and parent for efficient deep thread traversal.',
        required: ['root', 'parent'],
        properties: {
          root: {
            type: 'string',
            format: 'at-uri',
            description: 'AT-URI of the root message in the thread.',
          },
          parent: {
            type: 'string',
            format: 'at-uri',
            description: 'AT-URI of the direct parent message being replied to.',
          },
        },
      },
      imageEmbed: {
        type: 'object',
        description: 'Embedded images.',
        required: ['images'],
        properties: {
          images: {
            type: 'array',
            maxLength: 4,
            items: {
              type: 'ref',
              ref: 'lex:app.protoimsg.chat.message#imageItem',
            },
          },
        },
      },
      imageItem: {
        type: 'object',
        description: 'A single embedded image.',
        required: ['image', 'alt'],
        properties: {
          image: {
            type: 'blob',
            accept: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            maxSize: 1000000,
            description: 'Image blob reference.',
          },
          alt: {
            type: 'string',
            maxLength: 2000,
            description: 'Alt text for accessibility.',
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.protoimsg.chat.message#aspectRatio',
          },
        },
      },
      videoEmbed: {
        type: 'object',
        description: 'Embedded video.',
        required: ['video'],
        properties: {
          video: {
            type: 'blob',
            accept: ['video/mp4', 'video/webm'],
            maxSize: 50000000,
            description: 'Video blob reference.',
          },
          alt: {
            type: 'string',
            maxLength: 2000,
            description: 'Alt text for accessibility.',
          },
          thumbnail: {
            type: 'blob',
            accept: ['image/png', 'image/jpeg'],
            maxSize: 1000000,
            description: 'Video thumbnail image.',
          },
          aspectRatio: {
            type: 'ref',
            ref: 'lex:app.protoimsg.chat.message#aspectRatio',
          },
        },
      },
      externalEmbed: {
        type: 'object',
        description: 'External link card.',
        required: ['uri', 'title'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
            description: 'URL of the external content.',
          },
          title: {
            type: 'string',
            maxLength: 300,
            description: 'Title of the external content.',
          },
          description: {
            type: 'string',
            maxLength: 1000,
            description: 'Description or summary.',
          },
          thumb: {
            type: 'blob',
            accept: ['image/png', 'image/jpeg'],
            maxSize: 1000000,
            description: 'Thumbnail image for the link card.',
          },
        },
      },
      aspectRatio: {
        type: 'object',
        description: 'Width and height for layout before media loads.',
        required: ['width', 'height'],
        properties: {
          width: {
            type: 'integer',
            minimum: 1,
          },
          height: {
            type: 'integer',
            minimum: 1,
          },
        },
      },
      richTextFacet: {
        type: 'object',
        description: 'A rich text annotation on the message.',
        required: ['index', 'features'],
        properties: {
          index: {
            type: 'ref',
            ref: 'lex:app.protoimsg.chat.message#byteSlice',
          },
          features: {
            type: 'array',
            items: {
              type: 'union',
              refs: [
                'lex:app.protoimsg.chat.message#mention',
                'lex:app.protoimsg.chat.message#link',
              ],
            },
          },
        },
      },
      byteSlice: {
        type: 'object',
        description: 'Byte range within the text.',
        required: ['byteStart', 'byteEnd'],
        properties: {
          byteStart: {
            type: 'integer',
            minimum: 0,
          },
          byteEnd: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
      mention: {
        type: 'object',
        description: 'A mention of another user.',
        required: ['did'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
        },
      },
      link: {
        type: 'object',
        description: 'A hyperlink.',
        required: ['uri'],
        properties: {
          uri: {
            type: 'string',
            format: 'uri',
          },
        },
      },
    },
  },
  AppProtoimsgChatPoll: {
    lexicon: 1,
    id: 'app.protoimsg.chat.poll',
    defs: {
      main: {
        type: 'record',
        description: "A poll within a chat room. Lives in the creator's repo.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['room', 'question', 'options', 'createdAt'],
          properties: {
            room: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the room this poll belongs to.',
            },
            question: {
              type: 'string',
              maxLength: 200,
              description: 'The poll question.',
            },
            options: {
              type: 'array',
              minLength: 2,
              maxLength: 10,
              description: 'Poll answer options.',
              items: {
                type: 'string',
                maxLength: 100,
              },
            },
            allowMultiple: {
              type: 'boolean',
              default: false,
              description: 'Whether voters can select multiple options.',
            },
            expiresAt: {
              type: 'string',
              format: 'datetime',
              description: 'When the poll closes. Omit for no expiry.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of poll creation.',
            },
          },
        },
      },
    },
  },
  AppProtoimsgChatPresence: {
    lexicon: 1,
    id: 'app.protoimsg.chat.presence',
    defs: {
      main: {
        type: 'record',
        description: "User's current status. Lives in their repo, updated by their client.",
        key: 'literal:self',
        record: {
          type: 'object',
          required: ['status', 'visibleTo', 'updatedAt'],
          properties: {
            status: {
              type: 'string',
              knownValues: ['online', 'away', 'idle', 'offline', 'invisible'],
              description: 'Current presence status.',
            },
            visibleTo: {
              type: 'string',
              knownValues: ['everyone', 'community', 'inner-circle', 'no-one'],
              description: 'Who can see your real presence status.',
            },
            awayMessage: {
              type: 'string',
              maxLength: 300,
              description: 'Custom away message / status text.',
            },
            updatedAt: {
              type: 'string',
              format: 'datetime',
              description: 'When presence was last updated.',
            },
          },
        },
      },
    },
  },
  AppProtoimsgChatRole: {
    lexicon: 1,
    id: 'app.protoimsg.chat.role',
    defs: {
      main: {
        type: 'record',
        description: 'Assign a moderator role to a user for a specific room.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['room', 'subject', 'role', 'createdAt'],
          properties: {
            room: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the room.',
            },
            subject: {
              type: 'string',
              format: 'did',
              description: 'DID of the user being assigned the role.',
            },
            role: {
              type: 'string',
              knownValues: ['moderator', 'owner'],
              description: 'The role being assigned.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of role assignment.',
            },
          },
        },
      },
    },
  },
  AppProtoimsgChatRoom: {
    lexicon: 1,
    id: 'app.protoimsg.chat.room',
    defs: {
      main: {
        type: 'record',
        description: 'Declares a chat room. Created by whoever starts the room.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'topic', 'purpose', 'createdAt'],
          properties: {
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Display name for the room.',
            },
            topic: {
              type: 'string',
              maxLength: 200,
              description: 'Room topic for sorting, filtering, and discovery.',
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'What the room is about.',
            },
            purpose: {
              type: 'string',
              knownValues: ['discussion', 'event', 'community', 'support'],
              description: 'Room purpose categorization.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of room creation.',
            },
            settings: {
              type: 'ref',
              ref: 'lex:app.protoimsg.chat.room#roomSettings',
            },
          },
        },
      },
      roomSettings: {
        type: 'object',
        description: 'Configurable room settings.',
        properties: {
          visibility: {
            type: 'string',
            knownValues: ['public', 'unlisted', 'private'],
            default: 'public',
            description:
              'Room discoverability. public = listed in directory, unlisted = link only, private = invite only.',
          },
          minAccountAgeDays: {
            type: 'integer',
            minimum: 0,
            default: 0,
            description: 'Minimum atproto account age in days to participate.',
          },
          slowModeSeconds: {
            type: 'integer',
            minimum: 0,
            default: 0,
            description: 'Minimum seconds between messages per user. 0 = disabled.',
          },
          allowlistEnabled: {
            type: 'boolean',
            default: false,
            description: 'When true, only users on the room allowlist can send messages.',
          },
        },
      },
    },
  },
  AppProtoimsgChatVote: {
    lexicon: 1,
    id: 'app.protoimsg.chat.vote',
    defs: {
      main: {
        type: 'record',
        description: "A vote on a poll. Lives in the voter's repo.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['poll', 'selectedOptions', 'createdAt'],
          properties: {
            poll: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the poll being voted on.',
            },
            selectedOptions: {
              type: 'array',
              description: 'Indices of selected options (0-based).',
              items: {
                type: 'integer',
                minimum: 0,
              },
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of vote.',
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;

export const schemas = Object.values(schemaDict);
export const lexicons: Lexicons = new Lexicons(schemas);
export const ids = {
  AppProtoimsgChatAllowlist: 'app.protoimsg.chat.allowlist',
  AppProtoimsgChatBan: 'app.protoimsg.chat.ban',
  AppProtoimsgChatCommunity: 'app.protoimsg.chat.community',
  AppProtoimsgChatMessage: 'app.protoimsg.chat.message',
  AppProtoimsgChatPoll: 'app.protoimsg.chat.poll',
  AppProtoimsgChatPresence: 'app.protoimsg.chat.presence',
  AppProtoimsgChatRole: 'app.protoimsg.chat.role',
  AppProtoimsgChatRoom: 'app.protoimsg.chat.room',
  AppProtoimsgChatVote: 'app.protoimsg.chat.vote',
};
