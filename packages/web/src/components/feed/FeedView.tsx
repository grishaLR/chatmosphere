import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppBskyFeedDefs } from '@atproto/api';
import { useVirtualList } from 'virtualized-ui';
import { useSavedFeeds, DISCOVER_FEED_URI } from '../../hooks/useSavedFeeds';
import { useFeed } from '../../hooks/useFeed';
import { useContentTranslation } from '../../hooks/useContentTranslation';
import { FeedTabBar } from './FeedTabBar';
import { FeedPost } from './FeedPost';
import { FeedComposer } from './FeedComposer';
import styles from './FeedView.module.css';

const SCROLL_BOTTOM_THRESHOLD = 200;
const SCROLL_DOWN_THRESHOLD = 300;
const IDLE_SHOW_DELAY_MS = 8000;
const TRANSLATE_DEBOUNCE_MS = 300;

/** Module-level cache: feed URI → scrollTop. Survives component unmount/remount. */
const scrollPositionCache = new Map<string, number>();

interface FeedViewProps {
  onNavigateToProfile?: (did: string) => void;
  onReply?: (post: AppBskyFeedDefs.PostView) => void;
  onOpenThread?: (post: AppBskyFeedDefs.PostView) => void;
  replyTo?: AppBskyFeedDefs.PostView | null;
  onClearReply?: () => void;
}

export function FeedView({
  onNavigateToProfile,
  onReply,
  onOpenThread,
  replyTo,
  onClearReply,
}: FeedViewProps) {
  const { t } = useTranslation('feed');
  const { feeds } = useSavedFeeds();
  const [activeUri, setActiveUri] = useState<string | undefined>(DISCOVER_FEED_URI);
  const { posts, loading, loadingMore, error, hasMore, loadMore, refresh } = useFeed(activeUri);
  const { autoTranslate, requestBatchTranslation, available } = useContentTranslation();
  const [showRefresh, setShowRefresh] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const translateBufferRef = useRef(new Set<string>());
  const translateTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const {
    virtualItems,
    totalSize,
    containerRef,
    measureElement,
    handleScroll: virtualizerScroll,
    data,
  } = useVirtualList({
    data: posts,
    getItemId: (item) => {
      const isRepost = item.reason?.$type === 'app.bsky.feed.defs#reasonRepost';
      const reposterDid = isRepost ? (item.reason as AppBskyFeedDefs.ReasonRepost).by.did : '';
      return `${item.post.cid}-${reposterDid || 'orig'}`;
    },
    estimatedItemHeight: 150,
  });

  // Start idle timer once posts load
  useEffect(() => {
    if (posts.length === 0) {
      setShowRefresh(false);
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      setShowRefresh(true);
    }, IDLE_SHOW_DELAY_MS);

    return () => {
      clearTimeout(idleTimerRef.current);
    };
  }, [posts.length]);

  // Debounced viewport translation — collect texts while scrolling, flush as one batch
  useEffect(() => {
    if (!autoTranslate || !available || virtualItems.length === 0) return;

    const first = virtualItems[0];
    const last = virtualItems[virtualItems.length - 1];
    if (!first || !last) return;

    // Collect visible + nearby texts into the buffer
    for (const vi of virtualItems) {
      const post = data[vi.index];
      if (!post) continue;
      const text = ((post.post.record as Record<string, unknown>).text as string) || '';
      if (text) translateBufferRef.current.add(text);
    }

    const firstVisible = first.index;
    const lastVisible = last.index;
    const prefetchStart = Math.max(0, firstVisible - 5);
    const prefetchEnd = Math.min(posts.length - 1, lastVisible + 5);
    for (let i = prefetchStart; i <= prefetchEnd; i++) {
      if (i < firstVisible || i > lastVisible) {
        const p = posts[i];
        if (!p) continue;
        const text = ((p.post.record as Record<string, unknown>).text as string) || '';
        if (text) translateBufferRef.current.add(text);
      }
    }

    // Debounce: reset timer on each scroll tick, flush after settling
    clearTimeout(translateTimerRef.current);
    translateTimerRef.current = setTimeout(() => {
      const texts = [...translateBufferRef.current];
      translateBufferRef.current.clear();
      if (texts.length > 0) requestBatchTranslation(texts);
    }, TRANSLATE_DEBOUNCE_MS);

    return () => {
      clearTimeout(translateTimerRef.current);
    };
  }, [virtualItems, autoTranslate, available, data, posts, requestBatchTranslation]);

  const onScroll = useCallback(() => {
    virtualizerScroll();
    const el = containerRef.current;

    // Show refresh footer when scrolled down
    if (el.scrollTop > SCROLL_DOWN_THRESHOLD) {
      setShowRefresh(true);
      clearTimeout(idleTimerRef.current);
    } else {
      setShowRefresh(false);
    }

    // Load more when near bottom
    if (
      hasMore &&
      !loadingMore &&
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_BOTTOM_THRESHOLD
    ) {
      loadMore();
    }
  }, [virtualizerScroll, containerRef, hasMore, loadingMore, loadMore]);

  // Restore scroll position when feed changes or component remounts
  useEffect(() => {
    if (!activeUri) return;
    const saved = scrollPositionCache.get(activeUri);
    if (saved) {
      containerRef.current.scrollTop = saved;
    }
  }, [activeUri, posts.length, containerRef]); // posts.length ensures DOM is populated before restore

  // Save scroll position on unmount or feed change
  useEffect(() => {
    const currentUri = activeUri;
    const ref = containerRef;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is null after unmount
      if (currentUri && ref.current) {
        scrollPositionCache.set(currentUri, ref.current.scrollTop);
      }
    };
  }, [activeUri, containerRef]);

  const handleRefreshClick = useCallback(() => {
    setShowRefresh(false);
    refresh();
    containerRef.current.scrollTo({ top: 0 });
    if (activeUri) scrollPositionCache.delete(activeUri);
  }, [refresh, activeUri, containerRef]);

  return (
    <div className={styles.feedView}>
      <FeedComposer replyTo={replyTo ?? null} onClearReply={onClearReply} onPostSuccess={refresh} />

      <FeedTabBar feeds={feeds} activeUri={activeUri} onSelect={setActiveUri} />

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>{t('feedView.loading')}</div>
      ) : posts.length === 0 ? (
        <div className={styles.empty}>{t('feedView.empty')}</div>
      ) : (
        <>
          <div className={styles.container} ref={containerRef} onScroll={onScroll}>
            <div className={styles.spacer} style={{ height: totalSize }}>
              {virtualItems.map((vi) => {
                const item = data[vi.index];
                if (!item) return null;
                const isRepost = item.reason?.$type === 'app.bsky.feed.defs#reasonRepost';
                const reposterDid = isRepost
                  ? (item.reason as AppBskyFeedDefs.ReasonRepost).by.did
                  : '';
                return (
                  <div
                    key={`${item.post.cid}-${reposterDid || 'orig'}`}
                    ref={measureElement}
                    data-index={vi.index}
                    className={styles.virtualItem}
                    style={{ transform: `translateY(${vi.start}px)` }}
                  >
                    <FeedPost
                      item={item}
                      onNavigateToProfile={onNavigateToProfile}
                      onReply={onReply}
                      onOpenThread={onOpenThread}
                    />
                  </div>
                );
              })}
            </div>
            {loadingMore && <div className={styles.loadingMore}>{t('feedView.loadingMore')}</div>}
          </div>

          {showRefresh && (
            <button className={styles.refreshFooter} onClick={handleRefreshClick}>
              &#x2191; {t('feedView.refresh')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
