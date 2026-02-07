import { useProfile } from '../../contexts/ProfileContext';
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
  const displayText = profile ? `@${profile.handle}` : truncateDid(did);
  const avatarSize = size === 'md' ? styles.avatarMd : styles.avatarSm;

  return (
    <span className={styles.identity}>
      {showAvatar && profile?.avatarUrl && isSafeUrl(profile.avatarUrl) && (
        <img className={`${styles.avatar} ${avatarSize}`} src={profile.avatarUrl} alt="" />
      )}
      <span className={styles.handle} title={did}>
        {displayText}
      </span>
    </span>
  );
}
