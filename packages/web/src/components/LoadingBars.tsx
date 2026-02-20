import styles from './LoadingBars.module.css';

export function LoadingBars() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} />
      <div className={styles.bar} />
      <div className={styles.bar} />
    </div>
  );
}
