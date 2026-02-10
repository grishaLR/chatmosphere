import type { PresenceStatus, PresenceVisibility } from '@protoimsg/shared';

export const STATUS_OPTIONS: Array<{ value: PresenceStatus; label: string }> = [
  { value: 'online', label: 'Online' },
  { value: 'away', label: 'Away' },
  { value: 'idle', label: 'Idle' },
];

export const VISIBILITY_OPTIONS: Array<{ value: PresenceVisibility; label: string }> = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'community', label: 'Community' },
  { value: 'inner-circle', label: 'Inner Circle' },
  { value: 'no-one', label: 'No One' },
];
