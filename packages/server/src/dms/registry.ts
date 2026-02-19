/** In-memory conversation registry for IM signaling (P2P data channels).
 *  Maps conversationId → { did1, did2 } for authorization checks on
 *  im_offer / im_answer / im_ice_candidate relay.
 *  Video call signaling still uses DmService + DB. */
export interface ImConversation {
  did1: string;
  did2: string;
}

export interface ImRegistry {
  register(id: string, did1: string, did2: string): void;
  unregister(id: string): void;
  isParticipant(id: string, did: string): boolean;
  getRecipientDid(id: string, senderDid: string): string | null;
  has(id: string): boolean;
}

export function createImRegistry(): ImRegistry {
  const conversations = new Map<string, ImConversation>();

  return {
    register(id, did1, did2) {
      conversations.set(id, { did1, did2 });
    },

    unregister(id) {
      conversations.delete(id);
    },

    isParticipant(id, did) {
      const convo = conversations.get(id);
      if (!convo) return false;
      return convo.did1 === did || convo.did2 === did;
    },

    getRecipientDid(id, senderDid) {
      const convo = conversations.get(id);
      if (!convo) return null;
      if (convo.did1 === senderDid) return convo.did2;
      if (convo.did2 === senderDid) return convo.did1;
      return null;
    },

    has(id) {
      return conversations.has(id);
    },
  };
}
