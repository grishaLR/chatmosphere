import { describe, it, expect } from 'vitest';
import { filterText } from './filter.js';

describe('filterText', () => {
  it('passes normal text', () => {
    const result = filterText('Hello, world!');
    expect(result.passed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('passes empty text', () => {
    const result = filterText('');
    expect(result.passed).toBe(true);
  });

  it('passes whitespace-only text', () => {
    const result = filterText('   \n\t  ');
    expect(result.passed).toBe(true);
  });

  it('blocks character spam', () => {
    const result = filterText('aaaaaaaaaaaaaaaa'); // 16 a's
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Character spam');
  });

  it('allows moderate repetition', () => {
    const result = filterText('aaaaaaaaa'); // 9 a's — under threshold
    expect(result.passed).toBe(true);
  });

  it('blocks newline spam', () => {
    const result = filterText('hello\n\n\n\n\n\n\n\n\n\nworld');
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Newline spam');
  });

  it('blocks messages exceeding max length', () => {
    const result = filterText('x'.repeat(3001));
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('3000');
  });

  it('passes messages at max length', () => {
    // Use varied text to avoid triggering character spam filter
    const text = Array.from({ length: 300 }, (_, i) => `message ${String(i)} `)
      .join('')
      .slice(0, 3000);
    const result = filterText(text);
    expect(result.passed).toBe(true);
  });
});
