import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PollView } from '../../types';
import { UserIdentity } from './UserIdentity';
import styles from './PollCard.module.css';

interface PollCardProps {
  poll: PollView;
  onVote: (pollId: string, pollUri: string, selectedOptions: number[]) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export const PollCard = memo(function PollCard({ poll, onVote }: PollCardProps) {
  const { t } = useTranslation('chat');
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const hasVoted = poll.myVote !== null;
  const expired = isExpired(poll.expires_at);
  const showResults = hasVoted || expired;
  const maxCount = useMemo(() => {
    const counts = Object.values(poll.tallies);
    return counts.length > 0 ? Math.max(...counts) : 0;
  }, [poll.tallies]);

  const handleOptionClick = useCallback(
    (index: number) => {
      if (hasVoted || expired || poll.pending) return;

      if (poll.allow_multiple) {
        setSelectedOptions((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        });
      } else {
        // Single-select: vote immediately
        onVote(poll.id, poll.uri, [index]);
      }
    },
    [hasVoted, expired, poll.pending, poll.allow_multiple, poll.id, poll.uri, onVote],
  );

  const handleSubmitMultiple = useCallback(() => {
    if (selectedOptions.size === 0) return;
    onVote(poll.id, poll.uri, [...selectedOptions]);
  }, [poll.id, poll.uri, selectedOptions, onVote]);

  return (
    <div className={`${styles.card}${poll.pending ? ` ${styles.pending}` : ''}`}>
      <div className={styles.header}>
        <UserIdentity did={poll.did} size="sm" />
        <span className={styles.time}>{formatTime(poll.created_at)}</span>
        {poll.allow_multiple && <span className={styles.badge}>{t('poll.allowMultiple')}</span>}
      </div>

      <p className={styles.question}>{poll.question}</p>

      <div className={styles.options}>
        {poll.options.map((option, index) => {
          const count = poll.tallies[index] ?? 0;
          const pct = poll.totalVoters > 0 ? count / poll.totalVoters : 0;
          const isSelected = hasVoted ? poll.myVote?.includes(index) : selectedOptions.has(index);

          return (
            <button
              key={index}
              className={`${styles.option}${isSelected ? ` ${styles.optionSelected}` : ''}`}
              onClick={() => {
                handleOptionClick(index);
              }}
              disabled={hasVoted || expired}
              type="button"
            >
              {showResults && (
                <div
                  className={styles.progressBar}
                  style={{ transform: `scaleX(${maxCount > 0 ? count / maxCount : 0})` }}
                />
              )}
              <span className={styles.optionContent}>
                <span className={styles.optionLabel}>{option}</span>
                {showResults && (
                  <span className={styles.optionCount}>
                    {count} ({Math.round(pct * 100)}%)
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {poll.allow_multiple && !hasVoted && !expired && selectedOptions.size > 0 && (
        <div style={{ marginTop: 'var(--cm-space-2)' }}>
          <button
            className={styles.option}
            onClick={handleSubmitMultiple}
            type="button"
            style={{ fontWeight: 700 }}
          >
            {t('poll.vote')}
          </button>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.voters}>{t('poll.totalVotes', { count: poll.totalVoters })}</span>
        {poll.expires_at && !expired && (
          <span className={styles.expiry}>
            {t('poll.expiresIn', { time: formatExpiry(poll.expires_at) })}
          </span>
        )}
        {expired && <span className={styles.expiry}>{t('poll.expired')}</span>}
      </div>
    </div>
  );
});
