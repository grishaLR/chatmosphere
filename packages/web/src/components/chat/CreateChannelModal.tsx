import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LIMITS } from '@protoimsg/shared';
import { createChannelRecord } from '../../lib/atproto';
import { useAuth } from '../../hooks/useAuth';
import styles from './CreateChannelModal.module.css';

interface CreateChannelModalProps {
  roomUri: string;
  onClose: () => void;
}

export function CreateChannelModal({ roomUri, onClose }: CreateChannelModalProps) {
  const { t } = useTranslation('chat');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { agent } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [postPolicy, setPostPolicy] = useState('everyone');
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

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!agent || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    void createChannelRecord(agent, {
      roomUri,
      name: name.trim(),
      description: description.trim() || undefined,
      postPolicy,
    })
      .then(() => {
        onClose();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : t('channel.error.default'));
        setSubmitting(false);
      });
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={handleClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>{t('channel.createTitle')}</h2>

        <label className={styles.label}>
          {t('channel.nameLabel')}
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value.slice(0, LIMITS.maxChannelNameLength));
            }}
            placeholder={t('channel.namePlaceholder')}
            required
            autoFocus
          />
        </label>

        <label className={styles.label}>
          {t('channel.descriptionLabel')}
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value.slice(0, LIMITS.maxChannelDescriptionLength));
            }}
            placeholder={t('channel.descriptionPlaceholder')}
            rows={2}
          />
        </label>

        <label className={styles.label}>
          {t('channel.postPolicyLabel')}
          <select
            className={styles.select}
            value={postPolicy}
            onChange={(e) => {
              setPostPolicy(e.target.value);
            }}
          >
            <option value="everyone">{t('channel.postPolicy.everyone')}</option>
            <option value="moderators">{t('channel.postPolicy.moderators')}</option>
            <option value="owner">{t('channel.postPolicy.owner')}</option>
          </select>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => dialogRef.current?.close()}
          >
            {t('channel.cancel')}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !name.trim()}
          >
            {submitting ? t('channel.creating') : t('channel.createSubmit')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
