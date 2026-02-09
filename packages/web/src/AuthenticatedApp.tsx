import type { ReactNode } from 'react';
import { ModerationProvider } from './contexts/ModerationContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { DmProvider } from './contexts/DmContext';
import { DmPopoverContainer } from './components/dm/DmPopoverContainer';
import { BlockProvider } from './contexts/BlockContext';
import { ConnectionBanner } from './components/ConnectionBanner';

/** Wraps authenticated content with providers that require auth */
export function AuthenticatedApp({ children }: { children: ReactNode }) {
  return (
    <ModerationProvider>
      <ProfileProvider>
        <WebSocketProvider>
          <ConnectionBanner />
          <BlockProvider>
            <DmProvider>
              {children}
              <DmPopoverContainer />
            </DmProvider>
          </BlockProvider>
        </WebSocketProvider>
      </ProfileProvider>
    </ModerationProvider>
  );
}
