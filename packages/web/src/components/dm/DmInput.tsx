import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { RichText as RichTextAPI } from '@atproto/api';
import { DM_LIMITS } from '@protoimsg/shared';
import type { GifSource } from '../../lib/api';
import { parseMarkdownFacets } from '../../lib/markdown-facets';
import { useAuth } from '../../hooks/useAuth';
import { useGifCapabilities } from '../../hooks/useGifCapabilities';
import { FormattingToolbar } from '../chat/FormattingToolbar';
import { GifSearchModal } from '../chat/GifSearchModal';
import styles from './DmInput.module.css';

interface DmInputProps {
  onSend: (text: string, facets?: unknown[]) => void;
  onSendWithEmbed?: (text: string, embed: Record<string, unknown>) => void;
  onTyping: () => void;
}

export const DmInput = forwardRef<HTMLTextAreaElement, DmInputProps>(function DmInput(
  { onSend, onSendWithEmbed, onTyping },
  ref,
) {
  const { t } = useTranslation('dm');
  const { agent } = useAuth();
  const [text, setText] = useState('');
  const [gifQuery, setGifQuery] = useState<string | null>(null);
  const [gifSource, setGifSource] = useState<GifSource | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { capabilities, hasAnyGifService } = useGifCapabilities();

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // GIF slash commands
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

    // Parse markdown formatting
    const { text: cleaned, facets: mdFacets } = parseMarkdownFacets(trimmed);

    // Detect semantic facets (links, tags) on cleaned text
    let allFacets = mdFacets as unknown[];
    if (agent) {
      const rt = new RichTextAPI({ text: cleaned });
      await rt.detectFacets(agent);
      allFacets = [...mdFacets, ...(rt.facets ?? [])] as unknown[];
    }

    onSend(cleaned, allFacets.length > 0 ? allFacets : undefined);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleChange = (value: string) => {
    if (value.length > DM_LIMITS.maxMessageLength) return;
    setText(value);
    // M12: Only fire typing when there's actual text
    if (value.length > 0) {
      onTyping();
    }
  };

  // Auto-resize textarea via effect (L6: after React commits the new value)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${String(textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  return (
    <div className={styles.inputArea}>
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
          placeholder={t('input.placeholder')}
          rows={1}
          aria-label={t('input.ariaLabel')}
        />
        <button
          className={styles.sendBtn}
          onClick={() => void handleSend()}
          disabled={!text.trim()}
          type="button"
        >
          {t('input.send')}
        </button>
      </div>
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
            onSendWithEmbed('', embed);
            setGifQuery(null);
            setGifSource(undefined);
          }}
        />
      )}
    </div>
  );
});
