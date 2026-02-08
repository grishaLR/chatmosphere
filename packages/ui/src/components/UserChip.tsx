interface UserChipProps {
  handle?: string;
  did: string;
  avatarUrl?: string;
  size?: 'sm' | 'md';
  blurred?: boolean;
  alertBadge?: string;
  infoBadge?: string;
  className?: string;
}

const avatarSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
} as const;

export function UserChip({
  handle,
  did,
  avatarUrl,
  size = 'sm',
  blurred = false,
  alertBadge,
  infoBadge,
  className = '',
}: UserChipProps) {
  const displayName = handle ?? `${did.slice(0, 16)}…`;

  return (
    <span className={`inline-flex items-center gap-1 min-w-0 ${className}`}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className={`rounded-full shrink-0 object-cover ${avatarSizes[size]} ${blurred ? 'blur-[4px] hover:blur-[2px] cursor-pointer transition-[filter]' : ''}`}
        />
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{displayName}</span>
      {alertBadge && <span className="text-warning text-xs shrink-0">{alertBadge}</span>}
      {infoBadge && <span className="text-base-content/45 text-xs shrink-0">{infoBadge}</span>}
    </span>
  );
}
