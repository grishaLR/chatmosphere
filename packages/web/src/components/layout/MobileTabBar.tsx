import styles from './MobileTabBar.module.css';

export type MobileTab = 'buddies' | 'rooms' | 'feed';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string }[] = [
  { id: 'buddies', label: 'Buddies' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'feed', label: 'Feed' },
];

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          onClick={() => {
            onTabChange(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
