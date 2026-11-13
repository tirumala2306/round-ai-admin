import { describe, expect, it } from 'vitest';
import { optionLetters, pubmedUrl } from './pubmed';

describe('pubmedUrl', () => {
  it('builds PubMed links', () => {
    expect(pubmedUrl('12345678')).toBe('https://pubmed.ncbi.nlm.nih.gov/12345678/');
    expect(pubmedUrl('')).toBeNull();
  });
});

describe('optionLetters', () => {
  it('maps A-E', () => {
    expect(optionLetters({ A: 'one', B: 'two', C: 'three', D: 'four', E: 'five' })).toEqual([
      { letter: 'A', text: 'one' },
      { letter: 'B', text: 'two' },
      { letter: 'C', text: 'three' },
      { letter: 'D', text: 'four' },
      { letter: 'E', text: 'five' },
    ]);
  });
});
