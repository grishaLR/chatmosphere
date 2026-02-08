import { createContext, useContext, type ReactNode } from 'react';
import { useBlockSync } from '../hooks/useBlockSync';

interface BlockContextValue {
  blockedDids: Set<string>;
  resync: () => Promise<void>;
  toggleBlock: (did: string) => void;
}

const BlockContext = createContext<BlockContextValue | null>(null);

export function BlockProvider({ children }: { children: ReactNode }) {
  const { blockedDids, resync, toggleBlock } = useBlockSync();

  return (
    <BlockContext.Provider value={{ blockedDids, resync, toggleBlock }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlocks(): BlockContextValue {
  const ctx = useContext(BlockContext);
  if (!ctx) throw new Error('useBlocks must be used within BlockProvider');
  return ctx;
}
