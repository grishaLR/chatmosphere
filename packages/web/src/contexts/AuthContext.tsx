import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Agent } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { getOAuthClient } from '../lib/oauth';
import { createServerSession, deleteServerSession, setServerToken } from '../lib/api';

export interface AuthContextValue {
  session: OAuthSession | null;
  agent: Agent | null;
  did: string | null;
  handle: string | null;
  serverToken: string | null;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuth = useCallback(() => {
    setSession(null);
    setAgent(null);
    setDid(null);
    setHandle(null);
    setServerTokenState(null);
    setServerToken(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    const oauthClient = getOAuthClient();

    oauthClient
      .init()
      .then(async (result) => {
        if (result) {
          const { session: restoredSession } = result;
          setSession(restoredSession);
          const newAgent = new Agent(restoredSession);
          setAgent(newAgent);
          setDid(restoredSession.did);

          // Resolve real handle via profile
          try {
            const profile = await newAgent.getProfile({ actor: restoredSession.did });
            const resolvedHandle = profile.data.handle;
            setHandle(resolvedHandle);

            // Create server session for API auth
            const serverSession = await createServerSession(restoredSession.did, resolvedHandle);
            setServerToken(serverSession.token);
            setServerTokenState(serverSession.token);
          } catch (err: unknown) {
            console.error('Failed to create server session:', err);
            setHandle(restoredSession.did);
            setAuthError('Failed to connect to server. Please try again.');
          }
        }
      })
      .catch((err: unknown) => {
        console.error('OAuth init failed:', err);
      })
      .finally(() => {
        setIsLoading(false);
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
      value={{ session, agent, did, handle, serverToken, isLoading, authError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
