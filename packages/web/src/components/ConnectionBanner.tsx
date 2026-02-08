import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../hooks/useAuth';
import styles from './ConnectionBanner.module.css';

export function ConnectionBanner() {
  const { connected } = useWebSocket();
  const { did } = useAuth();

  // Only show if user is authenticated but WS is disconnected
  if (!did || connected) return null;

  return (
    <div className={styles.banner} role="alert">
      Connection lost — reconnecting...
    </div>
  );
}
