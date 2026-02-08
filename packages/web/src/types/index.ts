/** Client view models — mirror server DB rows for display */

export interface RoomView {
  id: string;
  uri: string;
  did: string;
  name: string;
  description: string | null;
  purpose: string;
  visibility: string;
  min_account_age_days: number;
  slow_mode_seconds: number;
  created_at: string;
  indexed_at: string;
}

export interface MessageView {
  id: string;
  uri: string;
  did: string;
  room_id: string;
  text: string;
  reply_to: string | null;
  created_at: string;
  indexed_at: string;
  /** Client-only: true while waiting for WS confirmation */
  pending?: boolean;
}

export interface MemberPresence {
  did: string;
  status: string;
  awayMessage?: string;
}

export interface BuddyWithPresence {
  did: string;
  status: string;
  awayMessage?: string;
  addedAt: string;
  isCloseFriend?: boolean;
  isBlocked?: boolean;
}

export interface DmConversationView {
  id: string;
  did1: string;
  did2: string;
  persist: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DmMessageView {
  id: string;
  conversationId: string;
  senderDid: string;
  text: string;
  createdAt: string;
  pending?: boolean;
}
