import { useCallback, useState } from 'react';

const STORAGE_KEY = 'protoimsg:collapsed-groups';
const SEED_KEY = 'protoimsg:collapsed-groups-seeded';
const SEED_GROUPS = ['Blocked', 'Followers', 'Following'];

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // Ignore corrupt data
  }

  // Seed defaults for new users (no existing state)
  if (!localStorage.getItem(SEED_KEY)) {
    localStorage.setItem(SEED_KEY, '1');
    const seeded = new Set(SEED_GROUPS);
    saveCollapsed(seeded);
    return seeded;
  }

  return new Set();
}

function saveCollapsed(collapsed: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
}

export function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed);

  const toggle = useCallback((name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      saveCollapsed(next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
