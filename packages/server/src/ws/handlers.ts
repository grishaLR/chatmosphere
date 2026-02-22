import type { WebSocket } from 'ws';
import { ERROR_CODES } from '@protoimsg/shared';
import type { ValidatedClientMessage } from './validation.js';
import type { RoomSubscriptions } from './rooms.js';
import type { DmSubscriptions } from '../dms/subscriptions.js';
import type { UserSockets } from './server.js';
import type { CommunityWatchers } from './buddy-watchers.js';
import type { PresenceService } from '../presence/service.js';
import type { DmService } from '../dms/service.js';
import type { ImRegistry } from '../dms/registry.js';
import type { PresenceVisibility } from '@protoimsg/shared';
import type { Sql } from '../db/client.js';
import type { RateLimiterStore } from '../moderation/rate-limiter-store.js';
import { checkUserAccess } from '../moderation/service.js';
import type { BlockService } from '../moderation/block-service.js';
import type { LabelerService } from '../moderation/labeler-service.js';
import { createLogger } from '../logger.js';
import { incDmsSent } from '../stats/queries.js';
import { getChannelsByRoom, ensureDefaultChannel } from '../channels/queries.js';
import { getRoomById } from '../rooms/queries.js';
import {
  syncCommunityMembers,
  upsertCommunityList,
  isCommunityMember,
  isInnerCircle,
} from '../community/queries.js';
import { computeConversationId, sortDids } from '../dms/queries.js';
import { resolveVisibleStatus } from '../presence/visibility.js';

/**
 * Per-user-per-room typing throttle. Prevents a single client from flooding
 * a room with typing indicators. Key: "roomId:did", value: last broadcast timestamp.
 */
const log = createLogger('ws');
const TYPING_THROTTLE_MS = 3000;
const typingThrottle = new Map<string, number>();

export async function handleClientMessage(
  ws: WebSocket,
  did: string,
  data: ValidatedClientMessage,
  roomSubs: RoomSubscriptions,
  communityWatchers: CommunityWatchers,
  service: PresenceService,
  sql: Sql,
  rateLimiter: RateLimiterStore,
  dmSubs: DmSubscriptions,
  userSockets: UserSockets,
  dmService: DmService,
  blockService: BlockService,
  imRegistry: ImRegistry,
  labelerService: LabelerService,
  callSubs: DmSubscriptions,
): Promise<void> {
  // Rate limit per-socket so multi-tab users get separate quotas
  const socketId = (ws as WebSocket & { socketId?: string }).socketId ?? did;
  if (!(await rateLimiter.check(`ws:socket:${socketId}`))) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Rate limited',
        errorCode: ERROR_CODES.RATE_LIMITED,
      }),
    );
    return;
  }

  switch (data.type) {
    case 'join_room': {
      const access = await checkUserAccess(sql, data.roomId, did, labelerService);
      if (!access.allowed) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: access.reason ?? 'Access denied',
            errorCode: ERROR_CODES.ACCESS_DENIED,
          }),
        );
        break;
      }

      roomSubs.subscribe(data.roomId, ws);
      await service.handleJoinRoom(did, data.roomId);
      const [members, initialChannelRows] = await Promise.all([
        service.getRoomPresence(data.roomId),
        getChannelsByRoom(sql, data.roomId),
      ]);

      // Self-healing: create default channel for rooms that predate the channels feature
      let channelRows = initialChannelRows;
      if (channelRows.length === 0) {
        const roomRow = await getRoomById(sql, data.roomId);
        if (roomRow) {
          const created = await ensureDefaultChannel(
            sql,
            data.roomId,
            roomRow.uri,
            roomRow.did,
            roomRow.created_at.toISOString(),
          );
          channelRows = [created];
        }
      }

      const channels = channelRows.map((ch) => ({
        id: ch.id,
        uri: ch.uri,
        did: ch.did,
        roomId: ch.room_id,
        name: ch.name,
        description: ch.description,
        position: ch.position,
        postPolicy: ch.post_policy,
        isDefault: ch.is_default,
        createdAt: ch.created_at.toISOString(),
      }));
      ws.send(
        JSON.stringify({
          type: 'room_joined',
          roomId: data.roomId,
          members,
          channels,
        }),
      );
      // Notify room of new member (include awayMessage if present).
      // Visibility is NOT applied here — rooms are public spaces. If you join,
      // you're visible. The visibleTo setting only governs buddy-list presence.
      const presence = await service.getPresence(did);
      roomSubs.broadcast(data.roomId, {
        type: 'presence',
        data: { did, status: presence.status, awayMessage: presence.awayMessage },
      });
      break;
    }

    case 'leave_room': {
      roomSubs.unsubscribe(data.roomId, ws);
      await service.handleLeaveRoom(did, data.roomId);
      roomSubs.broadcast(data.roomId, {
        type: 'presence',
        data: { did, status: 'offline' },
      });
      break;
    }

    case 'status_change': {
      const visibleTo = data.visibleTo as PresenceVisibility | undefined;
      await service.handleStatusChange(did, data.status, data.awayMessage, visibleTo);
      // Broadcast real status to all rooms — rooms are public spaces (like going
      // outside). Visibility only controls buddy-list presence, not room presence.
      const rooms = await service.getUserRooms(did);
      for (const roomId of rooms) {
        roomSubs.broadcast(roomId, {
          type: 'presence',
          data: { did, status: data.status, awayMessage: data.awayMessage },
        });
      }
      // Notify community watchers (visibility-aware)
      await communityWatchers.notify(did, data.status, data.awayMessage, visibleTo);
      break;
    }

    case 'request_community_presence': {
      const rawPresence = await service.getBulkPresence(data.dids);
      const presenceList = await Promise.all(
        rawPresence.map(async (p) => {
          if (blockService.doesBlock(p.did, did)) {
            return { did: p.did, status: 'offline' as const };
          }
          const visibility = await service.getVisibleTo(p.did);
          if (visibility === 'everyone') return p;

          const member =
            visibility === 'community' || visibility === 'inner-circle'
              ? await isCommunityMember(sql, p.did, did)
              : false;
          const friend =
            visibility === 'inner-circle' ? await isInnerCircle(sql, p.did, did) : false;

          const effectiveStatus = resolveVisibleStatus(
            visibility,
            p.status as 'online' | 'away' | 'idle' | 'offline',
            member,
            friend,
          );
          return {
            did: p.did,
            status: effectiveStatus,
            awayMessage: effectiveStatus === 'offline' ? undefined : p.awayMessage,
          };
        }),
      );
      ws.send(
        JSON.stringify({
          type: 'community_presence',
          data: presenceList,
        }),
      );
      // Register this socket as watching these DIDs for live updates
      communityWatchers.watch(ws, did, data.dids);
      break;
    }

    case 'channel_typing': {
      // Only broadcast if the user is actually in the room
      const roomMembers = roomSubs.getSubscribers(data.roomId);
      if (roomMembers.has(ws)) {
        // Per-user-per-channel throttle: one typing broadcast per TYPING_THROTTLE_MS
        const throttleKey = `${data.channelId}:${did}`;
        const now = Date.now();
        const lastTyping = typingThrottle.get(throttleKey);
        if (lastTyping && now - lastTyping < TYPING_THROTTLE_MS) break;
        typingThrottle.set(throttleKey, now);

        roomSubs.broadcast(
          data.roomId,
          {
            type: 'channel_typing',
            data: { roomId: data.roomId, channelId: data.channelId, did },
          },
          ws,
        );
      }
      break;
    }

    case 'sync_blocks': {
      log.info({ did, count: data.blockedDids.length }, 'sync_blocks');
      blockService.sync(did, data.blockedDids);
      // Re-notify all watchers with block-filtered presence
      // (newly blocked get offline, newly unblocked get real status)
      const blockPresence = await service.getPresence(did);
      const blockVisibleTo = await service.getVisibleTo(did);
      await communityWatchers.notify(
        did,
        blockPresence.status,
        blockPresence.awayMessage,
        blockVisibleTo,
      );
      break;
    }

    case 'sync_community': {
      const allMembers = data.groups.flatMap((g) => g.members);
      await syncCommunityMembers(sql, did, allMembers);
      await upsertCommunityList(sql, { did, groups: data.groups });
      // Re-notify watchers: inner circle changes affect who can see us
      const syncPresence = await service.getPresence(did);
      const syncVisibleTo = await service.getVisibleTo(did);
      await communityWatchers.notify(
        did,
        syncPresence.status,
        syncPresence.awayMessage,
        syncVisibleTo,
      );
      break;
    }

    case 'ping': {
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    }

    case 'dm_open': {
      if (data.recipientDid === did) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Cannot open DM with yourself',
            errorCode: ERROR_CODES.SELF_DM,
          }),
        );
        break;
      }

      if (blockService.isBlocked(did, data.recipientDid)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Cannot message this user',
            errorCode: ERROR_CODES.BLOCKED_USER,
          }),
        );
        break;
      }

      {
        const recipientPresence = await service.getPresence(data.recipientDid);
        if (recipientPresence.status === 'offline') {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'User is offline',
              errorCode: ERROR_CODES.RECIPIENT_OFFLINE,
            }),
          );
          break;
        }
      }

      {
        const [did1, did2] = sortDids(did, data.recipientDid);
        const conversationId = computeConversationId(did, data.recipientDid);
        imRegistry.register(conversationId, did1, did2);
        dmSubs.subscribe(conversationId, ws);

        ws.send(
          JSON.stringify({
            type: 'dm_opened',
            data: {
              conversationId,
              recipientDid: data.recipientDid,
            },
          }),
        );
        void incDmsSent(sql);
      }
      break;
    }

    case 'dm_close': {
      // Check both ImRegistry (IM conversations) and DmService (video call conversations)
      const isImParticipant = imRegistry.isParticipant(data.conversationId, did);
      const isDmParticipant = !isImParticipant
        ? await dmService.isParticipant(data.conversationId, did)
        : false;

      if (!isImParticipant && !isDmParticipant) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not a participant',
            errorCode: ERROR_CODES.NOT_PARTICIPANT,
          }),
        );
        break;
      }

      // Notify remaining subscribers before unsubscribing
      dmSubs.broadcast(
        data.conversationId,
        { type: 'dm_partner_left', data: { conversationId: data.conversationId } },
        ws,
      );

      dmSubs.unsubscribe(data.conversationId, ws);

      if (!dmSubs.hasSubscribers(data.conversationId)) {
        if (isImParticipant) {
          imRegistry.unregister(data.conversationId);
        } else {
          void dmService.cleanupIfEmpty(data.conversationId);
        }
      }
      break;
    }

    case 'dm_reject': {
      const isImParticipantReject = imRegistry.isParticipant(data.conversationId, did);
      if (!isImParticipantReject) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not a participant',
            errorCode: ERROR_CODES.NOT_PARTICIPANT,
          }),
        );
        break;
      }

      // Notify the initiator that the IM was rejected
      dmSubs.broadcast(
        data.conversationId,
        { type: 'dm_rejected', data: { conversationId: data.conversationId } },
        ws,
      );

      dmSubs.unsubscribe(data.conversationId, ws);

      if (!dmSubs.hasSubscribers(data.conversationId)) {
        imRegistry.unregister(data.conversationId);
      }
      break;
    }

    case 'im_offer': {
      if (!imRegistry.isParticipant(data.conversationId, did)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not a participant',
            errorCode: ERROR_CODES.NOT_PARTICIPANT,
          }),
        );
        break;
      }

      // Subscribe unsubscribed recipient sockets (same race condition fix as make_call)
      const recipientDid = imRegistry.getRecipientDid(data.conversationId, did);
      if (recipientDid) {
        const recipientSockets = userSockets.get(recipientDid);
        const convoSubscribers = dmSubs.getSubscribers(data.conversationId);
        for (const recipientWs of recipientSockets) {
          if (!convoSubscribers.has(recipientWs) && recipientWs.readyState === recipientWs.OPEN) {
            dmSubs.subscribe(data.conversationId, recipientWs);
          }
        }
      }

      dmSubs.broadcast(
        data.conversationId,
        {
          type: 'im_offer',
          data: {
            conversationId: data.conversationId,
            senderDid: did,
            offer: data.offer,
          },
        },
        ws,
      );
      break;
    }

    case 'im_answer': {
      if (!imRegistry.isParticipant(data.conversationId, did)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not a participant',
            errorCode: ERROR_CODES.NOT_PARTICIPANT,
          }),
        );
        break;
      }

      dmSubs.broadcast(
        data.conversationId,
        {
          type: 'im_answer',
          data: {
            conversationId: data.conversationId,
            answer: data.answer,
          },
        },
        ws,
      );
      break;
    }

    case 'im_ice_candidate': {
      if (!imRegistry.isParticipant(data.conversationId, did)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not a participant',
            errorCode: ERROR_CODES.NOT_PARTICIPANT,
          }),
        );
        break;
      }

      dmSubs.broadcast(
        data.conversationId,
        {
          type: 'im_ice_candidate',
          data: {
            conversationId: data.conversationId,
            candidate: data.candidate,
          },
        },
        ws,
      );
      break;
    }

    case 'call_init': {
      // Same as dm_open but responds with call_ready instead of dm_opened.
      // VideoCallContext uses this to get a conversationId for signaling
      // without triggering a DM popover on the client.
      if (data.recipientDid === did) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Cannot call yourself',
            errorCode: ERROR_CODES.SELF_DM,
          }),
        );
        break;
      }

      if (blockService.isBlocked(did, data.recipientDid)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Cannot call this user',
            errorCode: ERROR_CODES.BLOCKED_USER,
          }),
        );
        break;
      }

      {
        const recipientPresence = await service.getPresence(data.recipientDid);
        if (recipientPresence.status === 'offline') {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'User is offline',
              errorCode: ERROR_CODES.RECIPIENT_OFFLINE,
            }),
          );
          break;
        }
      }

      try {
        const { conversation } = await dmService.openConversation(did, data.recipientDid);
        callSubs.subscribe(conversation.id, ws);

        ws.send(
          JSON.stringify({
            type: 'call_ready',
            data: {
              conversationId: conversation.id,
              recipientDid: data.recipientDid,
            },
          }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to init call';
        ws.send(
          JSON.stringify({ type: 'error', message: msg, errorCode: ERROR_CODES.SERVER_ERROR }),
        );
      }
      break;
    }

    case 'make_call': {
      const { conversationId, offer } = data;
      const isParticipant = await dmService.isParticipant(conversationId, did);
      if (!isParticipant) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not a participant' }));
        break;
      }

      try {
        // Broadcast to sockets subscribed to this conversation
        callSubs.broadcast(
          data.conversationId,
          {
            type: 'incoming_call',
            data: { conversationId: conversationId, senderDid: did, offer: offer },
          },
          ws, // exclude sender
        );

        // Also notify recipient's sockets that don't have this convo open
        const recipientDid = await dmService.getRecipientDid(conversationId, did);
        if (recipientDid) {
          const recipientSockets = userSockets.get(recipientDid);
          const convoSubscribers = callSubs.getSubscribers(data.conversationId);

          for (const recipientWs of recipientSockets) {
            if (!convoSubscribers.has(recipientWs) && recipientWs.readyState === recipientWs.OPEN) {
              // Subscribe so subsequent signaling (ICE candidates, accept/reject)
              // reaches this socket without waiting for the client's call_init round-trip
              callSubs.subscribe(data.conversationId, recipientWs);
              recipientWs.send(
                JSON.stringify({
                  type: 'incoming_call',
                  data: { conversationId: conversationId, senderDid: did, offer: offer },
                }),
              );
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to notify user of incoming call';
        ws.send(JSON.stringify({ type: 'error', message: msg }));
      }
      break;
    }

    case 'reject_call': {
      const { conversationId } = data;
      const isParticipant = await dmService.isParticipant(conversationId, did);
      if (!isParticipant) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not a participant' }));
        break;
      }
      try {
        callSubs.broadcast(
          conversationId,
          {
            type: 'reject_call',
            data: { conversationId: conversationId },
          },
          ws, // exclude sender
        );
        callSubs.unsubscribe(conversationId, ws);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to notify user of rejected call';
        ws.send(JSON.stringify({ type: 'error', message: msg }));
      }
      break;
    }

    case 'accept_call': {
      const { conversationId, answer } = data;
      const isParticipant = await dmService.isParticipant(conversationId, did);
      if (!isParticipant) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not a participant' }));
        break;
      }
      try {
        callSubs.broadcast(
          conversationId,
          {
            type: 'accept_call',
            data: { conversationId: conversationId, answer: answer },
          },
          ws, // exclude sender
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to notify user of accepted call';
        ws.send(JSON.stringify({ type: 'error', message: msg }));
      }
      break;
    }

    case 'new_ice_candidate': {
      const { conversationId, candidate } = data;
      const isParticipant = await dmService.isParticipant(conversationId, did);
      if (!isParticipant) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not a participant' }));
        break;
      }

      log.debug({ conversationId }, 'Relaying ICE candidate');
      try {
        callSubs.broadcast(
          conversationId,
          {
            type: 'new_ice_candidate',
            data: { conversationId: conversationId, candidate: candidate },
          },
          ws, // exclude sender
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to relay ICE candidate';
        ws.send(JSON.stringify({ type: 'error', message: msg }));
      }
      break;
    }
  }
}
