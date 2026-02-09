import styles from './UserChip.module.css';

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
    <span className={`${styles.chip} ${className}`.trim()}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          className={`${styles.avatar} ${
            size === 'md' ? styles.avatarMd : styles.avatarSm
          } ${blurred ? styles.avatarBlurred : ''}`.trim()}
        />
      )}
      <span className={styles.name}>{displayName}</span>
      {alertBadge && <span className={styles.alertBadge}>{alertBadge}</span>}
      {infoBadge && <span className={styles.infoBadge}>{infoBadge}</span>}
    </span>
  );
}
