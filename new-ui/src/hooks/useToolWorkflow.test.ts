import { describe, expect, it } from 'vitest';
import { autoRunInputKey } from './useToolWorkflow';

describe('autoRunInputKey', () => {
  it('changes when the primary file changes', () => {
    const base = { extraFiles: [], compareFile2: null, toolText: '', htmlInputMode: 'file' as const };
    const a = new File(['a'], 'doc.pdf', { type: 'application/pdf', lastModified: 1 });
    const b = new File(['b'], 'doc.pdf', { type: 'application/pdf', lastModified: 2 });
    expect(autoRunInputKey('compress', { ...base, file: a })).not.toBe(
      autoRunInputKey('compress', { ...base, file: b }),
    );
  });

  it('is stable for the same inputs', () => {
    const file = new File(['a'], 'doc.pdf', { type: 'application/pdf', lastModified: 1 });
    const ctx = {
      file,
      extraFiles: [],
      compareFile2: null,
      toolText: '',
      htmlInputMode: 'file' as const,
    };
    expect(autoRunInputKey('repair-pdf', ctx)).toBe(autoRunInputKey('repair-pdf', ctx));
  });

  it('changes when formsFlatten toggles for pdf-forms', () => {
    const file = new File(['a'], 'doc.pdf', { type: 'application/pdf', lastModified: 1 });
    const base = {
      file,
      extraFiles: [],
      compareFile2: null,
      toolText: '',
      htmlInputMode: 'file' as const,
    };
    expect(autoRunInputKey('pdf-forms', { ...base, formsFlatten: true })).not.toBe(
      autoRunInputKey('pdf-forms', { ...base, formsFlatten: false }),
    );
  });
});
