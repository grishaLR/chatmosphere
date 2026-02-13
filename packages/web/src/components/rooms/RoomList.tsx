import { RoomCard } from './RoomCard';
import { useMentionNotifications } from '../../contexts/MentionNotificationContext';
import type { RoomView } from '../../types';
import styles from './RoomList.module.css';

interface RoomListProps {
  rooms: RoomView[];
}

export function RoomList({ rooms }: RoomListProps) {
  const { unreadMentions } = useMentionNotifications();

  if (rooms.length === 0) {
    return <p className={styles.empty}>No rooms found. Create one to get started!</p>;
  }

  return (
    <div className={styles.list}>
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} mentionCount={unreadMentions[room.id]} />
      ))}
    </div>
  );
}
