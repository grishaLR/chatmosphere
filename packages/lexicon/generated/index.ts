/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, FetchHandler, FetchHandlerOptions } from '@atproto/xrpc';
import { schemas } from './lexicons';
import { CID } from 'multiformats/cid';
import * as AppChatmosphereChatBan from './types/app/chatmosphere/chat/ban';
import * as AppChatmosphereChatBuddylist from './types/app/chatmosphere/chat/buddylist';
import * as AppChatmosphereChatMessage from './types/app/chatmosphere/chat/message';
import * as AppChatmosphereChatPoll from './types/app/chatmosphere/chat/poll';
import * as AppChatmosphereChatPresence from './types/app/chatmosphere/chat/presence';
import * as AppChatmosphereChatRole from './types/app/chatmosphere/chat/role';
import * as AppChatmosphereChatRoom from './types/app/chatmosphere/chat/room';
import * as AppChatmosphereChatVote from './types/app/chatmosphere/chat/vote';

export * as AppChatmosphereChatBan from './types/app/chatmosphere/chat/ban';
export * as AppChatmosphereChatBuddylist from './types/app/chatmosphere/chat/buddylist';
export * as AppChatmosphereChatMessage from './types/app/chatmosphere/chat/message';
export * as AppChatmosphereChatPoll from './types/app/chatmosphere/chat/poll';
export * as AppChatmosphereChatPresence from './types/app/chatmosphere/chat/presence';
export * as AppChatmosphereChatRole from './types/app/chatmosphere/chat/role';
export * as AppChatmosphereChatRoom from './types/app/chatmosphere/chat/room';
export * as AppChatmosphereChatVote from './types/app/chatmosphere/chat/vote';

export class AtpBaseClient extends XrpcClient {
  app: AppNS;

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas);
    this.app = new AppNS(this);
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this;
  }
}

export class AppNS {
  _client: XrpcClient;
  chatmosphere: AppChatmosphereNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.chatmosphere = new AppChatmosphereNS(client);
  }
}

export class AppChatmosphereNS {
  _client: XrpcClient;
  chat: AppChatmosphereChatNS;

  constructor(client: XrpcClient) {
    this._client = client;
    this.chat = new AppChatmosphereChatNS(client);
  }
}

export class AppChatmosphereChatNS {
  _client: XrpcClient;
  ban: BanRecord;
  buddylist: BuddylistRecord;
  message: MessageRecord;
  poll: PollRecord;
  presence: PresenceRecord;
  role: RoleRecord;
  room: RoomRecord;
  vote: VoteRecord;

  constructor(client: XrpcClient) {
    this._client = client;
    this.ban = new BanRecord(client);
    this.buddylist = new BuddylistRecord(client);
    this.message = new MessageRecord(client);
    this.poll = new PollRecord(client);
    this.presence = new PresenceRecord(client);
    this.role = new RoleRecord(client);
    this.room = new RoomRecord(client);
    this.vote = new VoteRecord(client);
  }
}

export class BanRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatBan.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.ban',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatBan.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.ban',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatBan.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.ban';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.ban', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.ban', ...params },
      { headers },
    );
  }
}

export class BuddylistRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatBuddylist.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.buddylist',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatBuddylist.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.buddylist',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatBuddylist.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.buddylist';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      {
        collection: 'app.chatmosphere.chat.buddylist',
        rkey: 'self',
        ...params,
        record,
      },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.buddylist', ...params },
      { headers },
    );
  }
}

export class MessageRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatMessage.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.message',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatMessage.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.message',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatMessage.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.message';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.message', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.message', ...params },
      { headers },
    );
  }
}

export class PollRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatPoll.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.poll',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatPoll.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.poll',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatPoll.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.poll';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.poll', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.poll', ...params },
      { headers },
    );
  }
}

export class PresenceRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatPresence.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.presence',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatPresence.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.presence',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatPresence.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.presence';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      {
        collection: 'app.chatmosphere.chat.presence',
        rkey: 'self',
        ...params,
        record,
      },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.presence', ...params },
      { headers },
    );
  }
}

export class RoleRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatRole.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.role',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatRole.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.role',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatRole.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.role';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.role', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.role', ...params },
      { headers },
    );
  }
}

export class RoomRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatRoom.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.room',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatRoom.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.room',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatRoom.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.room';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.room', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.room', ...params },
      { headers },
    );
  }
}

export class VoteRecord {
  _client: XrpcClient;

  constructor(client: XrpcClient) {
    this._client = client;
  }

  async list(params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>): Promise<{
    cursor?: string;
    records: { uri: string; value: AppChatmosphereChatVote.Record }[];
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'app.chatmosphere.chat.vote',
      ...params,
    });
    return res.data;
  }

  async get(params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>): Promise<{
    uri: string;
    cid: string;
    value: AppChatmosphereChatVote.Record;
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'app.chatmosphere.chat.vote',
      ...params,
    });
    return res.data;
  }

  async create(
    params: Omit<ComAtprotoRepoCreateRecord.InputSchema, 'collection' | 'record'>,
    record: AppChatmosphereChatVote.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'app.chatmosphere.chat.vote';
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.vote', ...params, record },
      { encoding: 'application/json', headers },
    );
    return res.data;
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'app.chatmosphere.chat.vote', ...params },
      { headers },
    );
  }
}
