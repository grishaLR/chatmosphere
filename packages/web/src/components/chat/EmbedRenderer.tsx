import styles from './EmbedRenderer.module.css';

interface EmbedRendererProps {
  embed: unknown;
}

interface ExternalEmbed {
  $type?: string;
  uri: string;
  title?: string;
  description?: string;
}

function isExternalEmbed(embed: unknown): embed is ExternalEmbed {
  if (!embed || typeof embed !== 'object') return false;
  const e = embed as Record<string, unknown>;
  return typeof e.uri === 'string';
}

function isGifServiceUrl(uri: string): boolean {
  try {
    const url = new URL(uri);
    return /^(media\d*\.giphy\.com|i\.giphy\.com|media\.tenor\.com|cdn\.klipy\.com)$/.test(
      url.hostname,
    );
  } catch {
    return false;
  }
}

function getDomain(uri: string): string {
  try {
    return new URL(uri).hostname;
  } catch {
    return uri;
  }
}

export function EmbedRenderer({ embed }: EmbedRendererProps) {
  if (!isExternalEmbed(embed)) return null;

  if (isGifServiceUrl(embed.uri)) {
    return (
      <div className={styles.gifEmbed}>
        <img
          src={embed.uri}
          alt={embed.description || embed.title || 'GIF'}
          className={styles.gif}
          loading="lazy"
        />
      </div>
    );
  }

  // Generic external link card
  return (
    <a href={embed.uri} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
      <span className={styles.linkTitle}>{embed.title ?? getDomain(embed.uri)}</span>
      <span className={styles.linkDomain}>{getDomain(embed.uri)}</span>
    </a>
  );
}
