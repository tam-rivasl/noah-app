import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('deduplicates tailwind classes', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });
});
