// Re-export WS types from shared package — canonical source is @chatmosphere/shared
export type {
  WsMessageBase,
  JoinRoomMessage,
  LeaveRoomMessage,
  StatusChangeMessage,
  PingMessage,
  RequestBuddyPresenceMessage,
  ClientMessage,
  NewMessageEvent,
  PresenceUpdateEvent,
  BuddyPresenceEvent,
  RoomJoinedEvent,
  PongEvent,
  ErrorEvent,
  ServerMessage,
} from '@chatmosphere/shared';
