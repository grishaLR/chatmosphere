import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Agent } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { getOAuthClient } from '../lib/oauth';
import { createServerSession, deleteServerSession, setServerToken } from '../lib/api';

export type AuthPhase =
  | 'initializing'
  | 'authenticating'
  | 'resolving'
  | 'connecting'
  | 'ready'
  | 'idle';

export interface AuthContextValue {
  session: OAuthSession | null;
  agent: Agent | null;
  did: string | null;
  handle: string | null;
  serverToken: string | null;
  isLoading: boolean;
  authPhase: AuthPhase;
  authError: string | null;
  login: (handle: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OAuthSession | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [did, setDid] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [serverToken, setServerTokenState] = useState<string | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>('initializing');
  const [authError, setAuthError] = useState<string | null>(null);

  const isLoading = useMemo(() => authPhase !== 'ready' && authPhase !== 'idle', [authPhase]);

  const clearAuth = useCallback(() => {
    setSession(null);
    setAgent(null);
    setDid(null);
    setHandle(null);
    setServerTokenState(null);
    setServerToken(null);
    setAuthError(null);
    setAuthPhase('idle');
  }, []);

  // Guard against StrictMode double-mount: OAuth callback processing consumes
  // URL params on the first call, so a second init() would see no callback and
  // return null → brief flash of /login before the first call's session arrives.
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const oauthClient = getOAuthClient();

    oauthClient
      .init()
      .then(async (result) => {
        if (result) {
          sessionStorage.removeItem('chatmosphere:oauth_pending');
          const { session: restoredSession } = result;
          setAuthPhase('authenticating');
          setSession(restoredSession);
          const newAgent = new Agent(restoredSession);
          setAgent(newAgent);
          setDid(restoredSession.did);

          // Resolve real handle via profile
          try {
            setAuthPhase('resolving');
            const profile = await newAgent.getProfile({ actor: restoredSession.did });
            const resolvedHandle = profile.data.handle;
            setHandle(resolvedHandle);

            // Create server session for API auth
            setAuthPhase('connecting');
            const serverSession = await createServerSession(restoredSession.did, resolvedHandle);
            setServerToken(serverSession.token);
            setServerTokenState(serverSession.token);
            setAuthPhase('ready');
          } catch (err: unknown) {
            console.error('Failed to create server session:', err);
            setHandle(restoredSession.did);
            setAuthError('Failed to connect to server. Please try again.');
            setAuthPhase('ready');
          }
        } else {
          sessionStorage.removeItem('chatmosphere:oauth_pending');
          setAuthPhase('idle');
        }
      })
      .catch((err: unknown) => {
        console.error('OAuth init failed:', err);
        setAuthPhase('idle');
      });

    // Sync logout across tabs — fires when session is revoked anywhere
    const onDeleted = () => {
      void deleteServerSession();
      clearAuth();
    };
    oauthClient.addEventListener('deleted', onDeleted);
    return () => {
      oauthClient.removeEventListener('deleted', onDeleted);
    };
  }, [clearAuth]);

  const login = useCallback(async (inputHandle: string) => {
    // Flag that an OAuth redirect is in progress — checked on return to
    // decide whether to show the full ConnectingScreen or a quick restore.
    sessionStorage.setItem('chatmosphere:oauth_pending', '1');
    const oauthClient = getOAuthClient();
    await oauthClient.signIn(inputHandle, {
      scope: 'atproto transition:generic',
    });
    // This redirects to PDS — execution won't continue here.
    // On return, init() in the useEffect above catches the callback.
  }, []);

  const logout = useCallback(() => {
    const sub = did;
    void deleteServerSession();
    clearAuth();
    if (sub) {
      const oauthClient = getOAuthClient();
      void oauthClient.revoke(sub);
    }
  }, [did, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        session,
        agent,
        did,
        handle,
        serverToken,
        isLoading,
        authPhase,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
