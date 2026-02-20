import { useTranslation } from 'react-i18next';
import { PanelLeftClose } from 'lucide-react';
import type { ChannelView } from '../../types';
import styles from './ChannelList.module.css';

const collapseIcon = <PanelLeftClose size={14} />;

interface ChannelListProps {
  channels: ChannelView[];
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
  canCreate: boolean;
  onCreateChannel: () => void;
  onCollapse?: () => void;
}

export function ChannelList({
  channels,
  activeChannelId,
  onSelect,
  canCreate,
  onCreateChannel,
  onCollapse,
}: ChannelListProps) {
  const { t } = useTranslation('chat');

  return (
    <nav className={styles.list} aria-label={t('channel.listAriaLabel')}>
      <div className={styles.headingRow}>
        <h3 className={styles.heading}>{t('channel.heading')}</h3>
        {onCollapse && (
          <button className={styles.collapseBtn} type="button" onClick={onCollapse}>
            {collapseIcon}
          </button>
        )}
      </div>
      {channels.map((ch) => (
        <button
          key={ch.id}
          className={`${styles.item} ${ch.id === activeChannelId ? styles.active : ''}`}
          onClick={() => {
            onSelect(ch.id);
          }}
          type="button"
          aria-current={ch.id === activeChannelId ? 'page' : undefined}
        >
          <span className={styles.hash}>#</span>
          <span className={styles.name}>{ch.name}</span>
        </button>
      ))}
      {canCreate && (
        <button className={styles.createBtn} onClick={onCreateChannel} type="button">
          + {t('channel.create')}
        </button>
      )}
    </nav>
  );
}
