import { describe, it, expect } from 'vitest';
import { isSafeUrl } from './sanitize';

describe('isSafeUrl', () => {
  it('allows http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('allows https URLs', () => {
    expect(isSafeUrl('https://example.com/path')).toBe(true);
  });

  it('blocks javascript: URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('blocks data: URLs', () => {
    expect(isSafeUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });

  it('blocks ftp: URLs', () => {
    expect(isSafeUrl('ftp://example.com')).toBe(false);
  });

  it('returns false for invalid URLs', () => {
    expect(isSafeUrl('not a url')).toBe(false);
  });
});
