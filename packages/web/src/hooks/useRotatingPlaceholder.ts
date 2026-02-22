import { useEffect, useState } from 'react';

const LOGIN_HANDLES: readonly string[] & { 0: string } = [
  'you.selfhosted.social',
  'you.cryptoanarchy.network',
  'you.blacksky.app',
  'you.northsky.social',
  'you.myatproto.social',
  'you.bsky.social',
  'you.graysky.social',
];

const BUDDY_HANDLES: readonly string[] & { 0: string } = [
  'friend.bsky.social',
  'friend.blacksky.app',
  'friend.selfhosted.social',
  'friend.northsky.social',
  'friend.myatproto.social',
  'friend.graysky.social',
  'friend.cryptoanarchy.network',
];

export function useRotatingPlaceholder(variant: 'login' | 'buddy'): string {
  const handles = variant === 'login' ? LOGIN_HANDLES : BUDDY_HANDLES;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % handles.length);
    }, 3000);
    return () => {
      clearInterval(id);
    };
  }, [handles.length]);
  return (handles[idx] as string | undefined) ?? handles[0];
}
