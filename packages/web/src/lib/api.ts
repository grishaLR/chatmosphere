import type { RoomView, MessageView } from '../types';

export async function fetchRooms(opts?: {
  visibility?: string;
  limit?: number;
  offset?: number;
}): Promise<RoomView[]> {
  const params = new URLSearchParams();
  if (opts?.visibility) params.set('visibility', opts.visibility);
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.offset) params.set('offset', String(opts.offset));

  const qs = params.toString();
  const res = await fetch(`/api/rooms${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.status}`);

  const data = (await res.json()) as { rooms: RoomView[] };
  return data.rooms;
}

export async function fetchRoom(id: string): Promise<RoomView> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) throw new NotFoundError('Room not found');
    throw new Error(`Failed to fetch room: ${res.status}`);
  }

  const data = (await res.json()) as { room: RoomView };
  return data.room;
}

export async function fetchMessages(
  roomId: string,
  opts?: { limit?: number; before?: string },
): Promise<MessageView[]> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.before) params.set('before', opts.before);

  const qs = params.toString();
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/messages${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);

  const data = (await res.json()) as { messages: MessageView[] };
  return data.messages;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// -- Presence --

export interface PresenceInfo {
  did: string;
  status: string;
  awayMessage?: string;
}

export async function fetchPresence(dids: string[]): Promise<PresenceInfo[]> {
  if (dids.length === 0) return [];
  const res = await fetch(`/api/presence?dids=${encodeURIComponent(dids.join(','))}`);
  if (!res.ok) throw new Error(`Failed to fetch presence: ${res.status}`);
  const data = (await res.json()) as { presence: PresenceInfo[] };
  return data.presence;
}

// -- Buddy List --

export interface BuddyListResponse {
  groups: Array<{
    name: string;
    isCloseFriends?: boolean;
    members: Array<{ did: string; addedAt: string }>;
  }>;
}

export async function fetchBuddyList(did: string): Promise<BuddyListResponse> {
  const res = await fetch(`/api/buddylist/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error(`Failed to fetch buddy list: ${res.status}`);
  return (await res.json()) as BuddyListResponse;
}
