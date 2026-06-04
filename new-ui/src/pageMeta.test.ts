import { describe, expect, it, beforeEach } from 'vitest';
import { applyPageMeta } from './pageMeta';

describe('applyPageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('sets title and description meta', () => {
    applyPageMeta({
      title: 'Merge PDF — PDFbolt',
      description: 'Combine PDFs.',
      path: '/bolt/merge',
    });
    expect(document.title).toBe('Merge PDF — PDFbolt');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Combine PDFs.',
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Merge PDF — PDFbolt',
    );
  });
});
