import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LIMITS } from '@protoimsg/shared';
import type { GifSource } from '../../lib/api';
import type { MessageView } from '../../types';
import { useGifCapabilities } from '../../hooks/useGifCapabilities';
import { FormattingToolbar } from './FormattingToolbar';
import { CreatePollModal } from './CreatePollModal';
import { GifSearchModal } from './GifSearchModal';
import { UserIdentity } from './UserIdentity';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
  /** When set, the input is in "reply to" mode */
  replyTo?: MessageView | null;
  /** Called when user cancels the reply */
  onCancelReply?: () => void;
  /** Placeholder override */
  placeholder?: string;
  /** Called when user creates a poll */
  onCreatePoll?: (input: {
    question: string;
    options: string[];
    allowMultiple?: boolean;
    expiresAt?: string;
  }) => void;
  /** Called when user sends a message with an embed (e.g. GIF) */
  onSendWithEmbed?: (text: string, embed: Record<string, unknown>) => void;
}

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  placeholder,
  onCreatePoll,
  onSendWithEmbed,
}: MessageInputProps) {
  const { t } = useTranslation('chat');
  const [text, setText] = useState('');
  const [showPollModal, setShowPollModal] = useState(false);
  const [gifQuery, setGifQuery] = useState<string | null>(null);
  const [gifSource, setGifSource] = useState<GifSource | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { capabilities, hasAnyGifService } = useGifCapabilities();

  // Focus the textarea when replyTo changes (user clicked Reply)
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === 'Escape' && replyTo) {
      onCancelReply?.();
    }
  }

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Slash command: /poll opens the poll creation modal
    if (trimmed.toLowerCase() === '/poll' && onCreatePoll) {
      setText('');
      setShowPollModal(true);
      return;
    }

    // Slash commands: /giphy <query> and /klipy <query> open the GIF search modal
    const lower = trimmed.toLowerCase();
    if (onSendWithEmbed && hasAnyGifService) {
      if (lower.startsWith('/giphy') && capabilities.giphy) {
        setText('');
        setGifQuery(trimmed.slice('/giphy'.length).trim());
        setGifSource('giphy');
        return;
      }
      if (lower.startsWith('/klipy') && capabilities.klipy) {
        setText('');
        setGifQuery(trimmed.slice('/klipy'.length).trim());
        setGifSource('klipy');
        return;
      }
    }

    onSend(trimmed);
    setText('');
  }

  function handleChange(value: string) {
    setText(value.slice(0, LIMITS.maxMessageLength));
    if (value.length > 0) onTyping?.();
  }

  return (
    <div className={styles.container}>
      {replyTo && (
        <div className={styles.replyBar}>
          <span className={styles.replyContext}>
            {t('messageInput.replyingTo')} <UserIdentity did={replyTo.did} size="sm" />
          </span>
          <button
            className={styles.replyCancelBtn}
            onClick={onCancelReply}
            type="button"
            aria-label={t('messageInput.cancelReply.ariaLabel')}
          >
            &times;
          </button>
        </div>
      )}
      <FormattingToolbar textareaRef={textareaRef} onTextChange={handleChange} />
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ??
            (replyTo ? t('messageInput.placeholder.reply') : t('messageInput.placeholder.default'))
          }
          rows={2}
          aria-label={
            replyTo ? t('messageInput.ariaLabel.reply') : t('messageInput.ariaLabel.default')
          }
        />
        {onCreatePoll && (
          <button
            className={styles.pollButton}
            onClick={() => {
              setShowPollModal(true);
            }}
            type="button"
            aria-label={t('poll.createPoll')}
            title={t('poll.createPoll')}
          >
            {'\u2630'}
          </button>
        )}
        <button className={styles.sendButton} onClick={send} disabled={!text.trim()}>
          {t('messageInput.send')}
        </button>
      </div>
      {showPollModal && onCreatePoll && (
        <CreatePollModal
          onClose={() => {
            setShowPollModal(false);
          }}
          onSubmit={(input) => {
            onCreatePoll(input);
            setShowPollModal(false);
          }}
        />
      )}
      {gifQuery !== null && onSendWithEmbed && (
        <GifSearchModal
          initialQuery={gifQuery}
          initialSource={gifSource}
          capabilities={capabilities}
          onClose={() => {
            setGifQuery(null);
            setGifSource(undefined);
          }}
          onSelect={(gif, altText) => {
            const description = altText || `via ${gif.source === 'klipy' ? 'Klipy' : 'GIPHY'}`;
            const embed: Record<string, unknown> = {
              $type: 'app.protoimsg.chat.message#externalEmbed',
              uri: gif.fullUrl,
              title: gif.title,
              description,
            };
            onSendWithEmbed(gif.fullUrl, embed);
            setGifQuery(null);
            setGifSource(undefined);
          }}
        />
      )}
    </div>
  );
}
