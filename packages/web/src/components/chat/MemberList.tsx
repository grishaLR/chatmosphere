import { StatusIndicator } from './StatusIndicator';
import { UserIdentity } from './UserIdentity';
import type { MemberPresence } from '../../types';
import styles from './MemberList.module.css';

interface MemberListProps {
  members: MemberPresence[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Members ({members.length})</h3>
      <ul className={styles.list}>
        {members.map((member) => (
          <li key={member.did} className={styles.member}>
            <StatusIndicator status={member.status} />
            <div className={styles.memberInfo}>
              <span className={styles.memberDid}>
                <UserIdentity did={member.did} showAvatar />
              </span>
              {member.awayMessage && <span className={styles.awayMsg}>{member.awayMessage}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
