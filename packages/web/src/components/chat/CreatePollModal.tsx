import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LIMITS } from '@protoimsg/shared';
import styles from './CreatePollModal.module.css';

interface CreatePollModalProps {
  onClose: () => void;
  onSubmit: (input: {
    question: string;
    options: string[];
    allowMultiple?: boolean;
    expiresAt?: string;
  }) => void;
}

const EXPIRY_OPTIONS = [
  { value: '', labelKey: 'poll.expiry.none' as const },
  { value: '1h', labelKey: 'poll.expiry.1h' as const },
  { value: '6h', labelKey: 'poll.expiry.6h' as const },
  { value: '24h', labelKey: 'poll.expiry.24h' as const },
  { value: '3d', labelKey: 'poll.expiry.3d' as const },
  { value: '1w', labelKey: 'poll.expiry.1w' as const },
];

function expiryToISO(value: string): string | undefined {
  if (!value) return undefined;
  const now = Date.now();
  const durations: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
  };
  const ms = durations[value];
  return ms ? new Date(now + ms).toISOString() : undefined;
}

export function CreatePollModal({ onClose, onSubmit }: CreatePollModalProps) {
  const { t } = useTranslation('chat');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    el.showModal();
  }, []);

  const handleClose = useCallback(() => {
    previousActiveRef.current?.focus();
    onClose();
  }, [onClose]);

  function handleAddOption() {
    if (options.length >= LIMITS.maxPollOptions) return;
    setOptions((prev) => [...prev, '']);
  }

  function handleRemoveOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOptionChange(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value.slice(0, 100) : opt)));
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const trimmedQ = question.trim();
    const trimmedOpts = options.map((o) => o.trim()).filter(Boolean);

    if (!trimmedQ) return;
    if (trimmedOpts.length < 2) {
      setError(t('poll.error.minOptions'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      onSubmit({
        question: trimmedQ,
        options: trimmedOpts,
        allowMultiple: allowMultiple || undefined,
        expiresAt: expiryToISO(expiry),
      });
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('poll.error.default'));
      setSubmitting(false);
    }
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={handleClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>{t('poll.createPoll')}</h2>

        <label className={styles.label}>
          {t('poll.questionLabel')}
          <input
            className={styles.input}
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value.slice(0, LIMITS.maxPollQuestionLength));
            }}
            placeholder={t('poll.questionPlaceholder')}
            required
            autoFocus
          />
        </label>

        <div className={styles.label}>
          {t('poll.optionsLabel')}
          {options.map((opt, i) => (
            <div key={i} className={styles.optionRow}>
              <input
                className={styles.input}
                type="text"
                value={opt}
                onChange={(e) => {
                  handleOptionChange(i, e.target.value);
                }}
                placeholder={t('poll.optionPlaceholder', { n: i + 1 })}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    handleRemoveOption(i);
                  }}
                  aria-label={t('poll.removeOption')}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddOption}
            disabled={options.length >= LIMITS.maxPollOptions}
          >
            + {t('poll.addOption')}
          </button>
        </div>

        <div className={styles.toggleRow}>
          <span>{t('poll.allowMultiple')}</span>
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => {
              setAllowMultiple(e.target.checked);
            }}
          />
        </div>

        <label className={styles.label}>
          {t('poll.expires')}
          <select
            className={styles.select}
            value={expiry}
            onChange={(e) => {
              setExpiry(e.target.value);
            }}
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            {t('poll.cancel')}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !question.trim()}
          >
            {t('poll.create')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
