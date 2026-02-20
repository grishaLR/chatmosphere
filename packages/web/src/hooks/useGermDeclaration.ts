import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { isSafeUrl } from '../lib/sanitize';
import { GERM_DECLARATION_NSID, buildGermUrl, type GermDeclaration } from '../lib/germ';

interface GermResult {
  canMessage: boolean;
  germUrl: string | null;
  isLoading: boolean;
}

export function useGermDeclaration(targetDid: string | undefined): GermResult {
  const { agent, did: viewerDid } = useAuth();

  const isSelf = !!targetDid && targetDid === viewerDid;

  const { data: declaration, isLoading: declarationLoading } = useQuery({
    queryKey: ['germDeclaration', targetDid],
    queryFn: async () => {
      if (!agent || !targetDid) return null;
      try {
        const res = await agent.com.atproto.repo.getRecord({
          repo: targetDid,
          collection: GERM_DECLARATION_NSID,
          rkey: 'self',
        });
        return res.data.value as GermDeclaration;
      } catch {
        return null;
      }
    },
    enabled: !!agent && !!targetDid && !isSelf,
    staleTime: 10 * 60 * 1000,
  });

  const policy = declaration?.messageMe.showButtonTo;

  const { data: followsViewer, isLoading: followLoading } = useQuery({
    queryKey: ['germFollowCheck', targetDid, viewerDid],
    queryFn: async () => {
      if (!agent || !targetDid || !viewerDid) return false;
      try {
        const res = await agent.app.bsky.graph.getRelationships({
          actor: targetDid,
          others: [viewerDid],
        });
        const rel = res.data.relationships[0];
        if (!rel || rel.$type !== 'app.bsky.graph.defs#relationship') return false;
        return !!rel.following;
      } catch {
        return false;
      }
    },
    enabled: !!agent && !!targetDid && !!viewerDid && policy === 'usersIFollow',
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = declarationLoading || (policy === 'usersIFollow' && followLoading);

  if (isSelf || !declaration || !policy || policy === 'none') {
    return { canMessage: false, germUrl: null, isLoading };
  }

  const messageMeUrl = declaration.messageMe.messageMeUrl;
  if (!messageMeUrl || !isSafeUrl(messageMeUrl)) {
    return { canMessage: false, germUrl: null, isLoading };
  }

  if (policy === 'usersIFollow' && !followsViewer) {
    return { canMessage: false, germUrl: null, isLoading };
  }

  if (!targetDid || !viewerDid) {
    return { canMessage: false, germUrl: null, isLoading };
  }

  const germUrl = buildGermUrl(messageMeUrl, targetDid, viewerDid);

  return { canMessage: true, germUrl, isLoading };
}
