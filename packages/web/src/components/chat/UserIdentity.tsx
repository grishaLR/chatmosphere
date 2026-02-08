import { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useModeration } from '../../hooks/useModeration';
import { isSafeUrl } from '../../lib/sanitize';
import styles from './UserIdentity.module.css';

interface UserIdentityProps {
  did: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md';
}

function truncateDid(did: string): string {
  if (did.length <= 20) return did;
  return did.slice(0, 14) + '...' + did.slice(-4);
}

export function UserIdentity({ did, showAvatar = false, size = 'sm' }: UserIdentityProps) {
  const profile = useProfile(did);
  const moderation = useModeration(did);
  const [avatarRevealed, setAvatarRevealed] = useState(false);

  if (moderation.shouldFilter) {
    return <span className={styles.identity}>[Hidden User]</span>;
  }

  const displayText = profile ? `@${profile.handle}` : truncateDid(did);
  const avatarSize = size === 'md' ? styles.avatarMd : styles.avatarSm;
  const avatarBlurred = moderation.shouldBlur && !avatarRevealed;

  return (
    <span className={styles.identity}>
      {showAvatar && profile?.avatarUrl && isSafeUrl(profile.avatarUrl) && (
        <img
          className={`${styles.avatar} ${avatarSize} ${avatarBlurred ? styles.blurred : ''}`}
          src={profile.avatarUrl}
          alt=""
          onClick={
            avatarBlurred
              ? () => {
                  setAvatarRevealed(true);
                }
              : undefined
          }
          title={avatarBlurred ? 'Click to reveal' : undefined}
        />
      )}
      <span className={styles.handle} title={did}>
        {displayText}
      </span>
      {moderation.shouldAlert && (
        <span className={styles.alertBadge} title="Warning">
          &#9888;
        </span>
      )}
      {moderation.shouldInform && (
        <span className={styles.infoBadge} title="Info">
          &#9432;
        </span>
      )}
    </span>
  );
}
