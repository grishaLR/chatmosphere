import { LoadingBars } from './LoadingBars';
import styles from './AppLoader.module.css';

export function AppLoader() {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <h1 className={styles.title}>protoimsg</h1>
      </div>
      <div className={styles.body}>
        <LoadingBars />
      </div>
    </div>
  );
}
