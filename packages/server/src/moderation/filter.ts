import { LIMITS } from '@protoimsg/shared';

const BLOCKED_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /(.)\1{15,}/, reason: 'Character spam detected' },
  { pattern: /(?:\n\s*){10,}/, reason: 'Newline spam detected' },
];

export interface FilterResult {
  passed: boolean;
  reason?: string;
}

export function filterText(text: string): FilterResult {
  if (text.length > LIMITS.maxMessageLength) {
    return {
      passed: false,
      reason: `Message exceeds ${String(LIMITS.maxMessageLength)} characters`,
    };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { passed: false, reason };
    }
  }

  return { passed: true };
}
