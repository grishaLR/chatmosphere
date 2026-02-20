import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import type { ChannelView } from '../../types';
import styles from './ChannelSwitcher.module.css';

interface ChannelSwitcherProps {
  channels: ChannelView[];
  activeChannel: ChannelView | null;
  onSelect: (channelId: string) => void;
  onCreateChannel?: () => void;
}

export function ChannelSwitcher({
  channels,
  activeChannel,
  onSelect,
  onCreateChannel,
}: ChannelSwitcherProps) {
  const { t } = useTranslation('rooms');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (channelId: string) => {
      onSelect(channelId);
      setOpen(false);
    },
    [onSelect],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  if (channels.length <= 1) {
    // Single channel — no switcher needed, but show create button for owner
    return activeChannel ? (
      <span className={styles.singleChannel}>
        <span className={styles.hash}>#</span> {activeChannel.name}
        {onCreateChannel && (
          <button
            className={styles.addBtn}
            type="button"
            onClick={onCreateChannel}
            aria-label={t('chatRoom.createChannel')}
            title={t('chatRoom.createChannel')}
          >
            <Plus size={14} />
          </button>
        )}
      </span>
    ) : null;
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => {
          setOpen((v) => !v);
        }}
        type="button"
      >
        <span className={styles.hash}>#</span>{' '}
        {activeChannel?.name ?? t('chatRoom.channelSwitcher')}
        <span className={styles.chevron}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {channels.map((ch) => (
            <button
              key={ch.id}
              className={`${styles.option} ${ch.id === activeChannel?.id ? styles.active : ''}`}
              onClick={() => {
                handleSelect(ch.id);
              }}
              type="button"
            >
              <span className={styles.hash}>#</span> {ch.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
