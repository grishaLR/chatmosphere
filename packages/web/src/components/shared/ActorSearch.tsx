import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useVirtualSelect, type UseVirtualSelectReturn } from 'virtualized-ui/select';
import { searchActorsTypeahead, type ActorSearchResult } from '../../lib/search-actors';
import { isSafeUrl } from '../../lib/sanitize';
import styles from './ActorSearch.module.css';

export type { ActorSearchResult } from '../../lib/search-actors';

interface ActorSearchProps {
  /** Called when user selects an actor from the dropdown */
  onSelect: (actor: ActorSearchResult) => void;
  /** Controlled input value (login mode) */
  value?: string;
  /** Called when input text changes (login mode) */
  onInputChange?: (value: string) => void;
  /** Clear input after selection (default: true) */
  clearOnSelect?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Check if an option should be disabled */
  isOptionDisabled?: (actor: ActorSearchResult) => boolean;
  /** Disable the entire input */
  disabled?: boolean;
  /** CSS class for the wrapper */
  className?: string;
  /** Size variant: compact for panels, default for forms */
  variant?: 'compact' | 'default';
  /** Auto-focus the input */
  autoFocus?: boolean;
  /** HTML id for the input element */
  id?: string;
}

const MIN_QUERY_LENGTH = 2;

export function ActorSearch({
  onSelect,
  value,
  onInputChange,
  clearOnSelect = true,
  placeholder = 'Search...',
  isOptionDisabled: isOptionDisabledProp,
  disabled = false,
  className,
  variant = 'compact',
  autoFocus = false,
  id,
}: ActorSearchProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<UseVirtualSelectReturn<ActorSearchResult>>(null) as RefObject<
    UseVirtualSelectReturn<ActorSearchResult>
  >;
  const isControlled = value !== undefined;

  const loadOptions = useCallback(
    async (query: string): Promise<ActorSearchResult[]> => searchActorsTypeahead(query),
    [],
  );

  const handleSelect = useCallback(
    (values: string[]) => {
      const did = values[0];
      if (!did) return;
      const actor = searchRef.current.getOptionByValue(did);
      if (!actor) return;
      onSelect(actor);
      if (isControlled && !clearOnSelect) {
        onInputChange?.(actor.handle);
      }
    },
    [onSelect, isControlled, clearOnSelect, onInputChange],
  );

  const search = useVirtualSelect<ActorSearchResult>({
    getOptionValue: (o) => o.did,
    getOptionLabel: (o) => o.handle,
    searchable: true,
    value: [],
    onValueChange: handleSelect,
    isOptionDisabled: isOptionDisabledProp,
    ...(isControlled ? { searchValue: value, onSearchChange: onInputChange } : {}),
    async: {
      loadOptions,
      debounceMs: 250,
      cacheTtlMs: 30_000,
      loadOnOpen: false,
    },
    clearSearchOnSelect: clearOnSelect,
    closeOnSelect: true,
    estimatedOptionHeight: variant === 'compact' ? 32 : 40,
    placeholder,
    disabled,
  });
  searchRef.current = search;

  // Close dropdown on click outside
  useEffect(() => {
    if (!search.isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        search.close();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [search.isOpen, search.close]);

  const inputClass = variant === 'compact' ? styles.inputCompact : styles.inputDefault;

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${className ?? ''}`}
      onKeyDown={search.handleKeyDown}
    >
      <input
        id={id}
        ref={search.inputRef}
        className={inputClass}
        type="text"
        placeholder={placeholder}
        value={search.searchValue}
        onChange={(e) => {
          search.handleSearchInput(e.target.value);
          if (e.target.value.length >= MIN_QUERY_LENGTH && !search.isOpen) {
            search.open();
          } else if (e.target.value.length < MIN_QUERY_LENGTH && search.isOpen) {
            search.close();
          }
        }}
        onFocus={() => {
          if (search.searchValue.length >= MIN_QUERY_LENGTH) {
            search.open();
          }
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        {...search.getInputProps()}
      />

      {search.isOpen && (
        <div className={styles.dropdown}>
          {search.isLoading ? (
            <div className={styles.status}>Searching...</div>
          ) : search.flattenedItems.length === 0 ? (
            <div className={styles.status}>
              {search.searchValue.length < MIN_QUERY_LENGTH ? 'Type to search...' : 'No results'}
            </div>
          ) : (
            <div
              ref={search.menuRef}
              className={styles.menu}
              onKeyDown={search.handleMenuKeyDown}
              {...search.getMenuProps()}
            >
              <div style={{ height: search.totalSize, position: 'relative' }}>
                {search.virtualItems.map((vi) => {
                  const item = search.flattenedItems[vi.index] as
                    | (typeof search.flattenedItems)[number]
                    | undefined;
                  if (!item || item.type !== 'option' || !item.option) return null;
                  const actor = item.option;
                  const isFocused = vi.index === search.focusedIndex;
                  const isDisabled = isOptionDisabledProp?.(actor) ?? false;
                  const optionClass =
                    variant === 'compact' ? styles.optionCompact : styles.optionDefault;

                  return (
                    <div
                      key={vi.key}
                      ref={search.measureElement}
                      data-index={vi.index}
                      className={`${optionClass} ${isFocused ? styles.optionFocused : ''} ${isDisabled ? styles.optionDisabled : ''}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        transform: `translateY(${vi.start}px)`,
                      }}
                      onClick={() => {
                        if (!isDisabled) search.selectValue(actor.did);
                      }}
                      {...search.getOptionProps(vi.index)}
                    >
                      {actor.avatar && isSafeUrl(actor.avatar) && (
                        <img
                          className={
                            variant === 'compact' ? styles.avatarCompact : styles.avatarDefault
                          }
                          src={actor.avatar}
                          alt=""
                        />
                      )}
                      <div className={styles.actorInfo}>
                        <span className={styles.handle}>@{actor.handle}</span>
                        {actor.displayName && (
                          <span className={styles.displayName}>{actor.displayName}</span>
                        )}
                      </div>
                      {isDisabled && <span className={styles.disabledBadge}>Added</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
