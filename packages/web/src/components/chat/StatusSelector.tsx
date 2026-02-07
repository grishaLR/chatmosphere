import { useState } from 'react';
import { StatusIndicator } from './StatusIndicator';
import type { PresenceStatus } from '@chatmosphere/shared';
import styles from './StatusSelector.module.css';

interface StatusSelectorProps {
  status: PresenceStatus;
  awayMessage?: string;
  onChangeStatus: (status: PresenceStatus, awayMessage?: string) => void;
}

const STATUS_OPTIONS: Array<{ value: PresenceStatus; label: string }> = [
  { value: 'online', label: 'Online' },
  { value: 'away', label: 'Away' },
  { value: 'idle', label: 'Idle' },
];

export function StatusSelector({ status, awayMessage, onChangeStatus }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState(awayMessage ?? '');

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <StatusIndicator status={status} size="md" />
        <span className={styles.label}>{status}</span>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.option} ${status === opt.value ? styles.active : ''}`}
              onClick={() => {
                if (opt.value !== 'away') {
                  onChangeStatus(opt.value);
                  setOpen(false);
                } else {
                  onChangeStatus('away', draftMessage || undefined);
                  setOpen(false);
                }
              }}
            >
              <StatusIndicator status={opt.value} />
              {opt.label}
            </button>
          ))}
          <div className={styles.awaySection}>
            <label className={styles.awayLabel}>Away message</label>
            <input
              className={styles.awayInput}
              type="text"
              placeholder="e.g. BRB, grabbing coffee"
              maxLength={300}
              value={draftMessage}
              onChange={(e) => {
                setDraftMessage(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onChangeStatus('away', draftMessage || undefined);
                  setOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
