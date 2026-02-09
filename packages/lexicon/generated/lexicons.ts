/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon';

export const schemaDict = {
  AppChatmosphereChatBan: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.ban',
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
  AppChatmosphereChatBuddylist: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.buddylist',
    defs: {
      main: {
        type: 'record',
        description: "The user's buddy list. Portable across any app implementing the Lexicon.",
        key: 'literal:self',
        record: {
          type: 'object',
          required: ['groups'],
          properties: {
            groups: {
              type: 'array',
              description: "Named groups of buddies, like AIM's buddy list categories.",
              maxLength: 50,
              items: {
                type: 'ref',
                ref: 'lex:app.chatmosphere.chat.buddylist#buddyGroup',
              },
            },
          },
        },
      },
      buddyGroup: {
        type: 'object',
        description: 'A named group of buddies.',
        required: ['name', 'members'],
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Group label.',
          },
          isCloseFriends: {
            type: 'boolean',
            default: false,
            description: 'Whether this is a close friends group for presence visibility.',
          },
          members: {
            type: 'array',
            maxLength: 500,
            description: 'DIDs of group members.',
            items: {
              type: 'ref',
              ref: 'lex:app.chatmosphere.chat.buddylist#buddyMember',
            },
          },
        },
      },
      buddyMember: {
        type: 'object',
        description: 'A buddy in a group.',
        required: ['did', 'addedAt'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
            description: "The buddy's DID.",
          },
          addedAt: {
            type: 'string',
            format: 'datetime',
            description: 'When this buddy was added.',
          },
        },
      },
    },
  },
  AppChatmosphereChatMessage: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.message',
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
                ref: 'lex:app.chatmosphere.chat.message#richTextFacet',
              },
            },
            replyTo: {
              type: 'string',
              format: 'at-uri',
              description: 'AT-URI of the parent message for threading.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp of message creation.',
            },
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
            ref: 'lex:app.chatmosphere.chat.message#byteSlice',
          },
          features: {
            type: 'array',
            items: {
              type: 'union',
              refs: [
                'lex:app.chatmosphere.chat.message#mention',
                'lex:app.chatmosphere.chat.message#link',
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
  AppChatmosphereChatPoll: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.poll',
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
  AppChatmosphereChatPresence: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.presence',
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
              knownValues: ['everyone', 'close-friends', 'nobody'],
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
  AppChatmosphereChatRole: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.role',
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
  AppChatmosphereChatRoom: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.room',
    defs: {
      main: {
        type: 'record',
        description: 'Declares a chat room. Created by whoever starts the room.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'purpose', 'createdAt'],
          properties: {
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Display name for the room.',
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
              ref: 'lex:app.chatmosphere.chat.room#roomSettings',
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
        },
      },
    },
  },
  AppChatmosphereChatVote: {
    lexicon: 1,
    id: 'app.chatmosphere.chat.vote',
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
  AppChatmosphereChatBan: 'app.chatmosphere.chat.ban',
  AppChatmosphereChatBuddylist: 'app.chatmosphere.chat.buddylist',
  AppChatmosphereChatMessage: 'app.chatmosphere.chat.message',
  AppChatmosphereChatPoll: 'app.chatmosphere.chat.poll',
  AppChatmosphereChatPresence: 'app.chatmosphere.chat.presence',
  AppChatmosphereChatRole: 'app.chatmosphere.chat.role',
  AppChatmosphereChatRoom: 'app.chatmosphere.chat.room',
  AppChatmosphereChatVote: 'app.chatmosphere.chat.vote',
};
