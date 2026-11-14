import { describe, it, expect } from 'vitest';
import { classifyVennOutcomes } from './venn';

describe('Venn Classification (PL-01 Visualization Helper)', () => {
  const outcomes = ['HH', 'HT', 'TH', 'TT'];
  const eventA = ['HH', 'HT'];
  const eventB = ['HH', 'TH'];

  it('correctly partitions two-coin toss into 4 disjoint Venn regions', () => {
    const res = classifyVennOutcomes(outcomes, eventA, eventB);

    expect(res.bothAB).toEqual(['HH']);
    expect(res.onlyA).toEqual(['HT']);
    expect(res.onlyB).toEqual(['TH']);
    expect(res.neitherAB).toEqual(['TT']);
  });

  it('handles empty events correctly', () => {
    const res = classifyVennOutcomes(outcomes, [], []);
    expect(res.bothAB).toEqual([]);
    expect(res.onlyA).toEqual([]);
    expect(res.onlyB).toEqual([]);
    expect(res.neitherAB).toEqual(['HH', 'HT', 'TH', 'TT']);
  });

  it('handles identical events correctly', () => {
    const res = classifyVennOutcomes(outcomes, ['HH', 'HT'], ['HH', 'HT']);
    expect(res.bothAB).toEqual(['HH', 'HT']);
    expect(res.onlyA).toEqual([]);
    expect(res.onlyB).toEqual([]);
    expect(res.neitherAB).toEqual(['TH', 'TT']);
  });
});
