import { describe, it, expect } from 'vitest';
import { createRational } from './rational';
import { FiniteSampleSpace } from './types';
import { calculateInducedDistribution } from './randomVariable';

describe('Deterministic Random Variable Engine: CAL-RV-001', () => {
  const e = createRational(1n, 8n);
  const space3Coins: FiniteSampleSpace = {
    outcomes: ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'],
    masses: [e, e, e, e, e, e, e, e],
  };

  const headsCountMapping: Record<string, number> = {
    HHH: 3,
    HHT: 2,
    HTH: 2,
    HTT: 1,
    THH: 2,
    THT: 1,
    TTH: 1,
    TTT: 0,
  };

  it('evaluates PL-04 three fair toss head count golden vector (A-004 §5.1)', () => {
    const res = calculateInducedDistribution(space3Coins, headsCountMapping);
    expect(res.status).toBe('valid');
    expect(res.value).toBeDefined();

    const dist = res.value!;
    expect(dist.distinctValues).toEqual([0, 1, 2, 3]);
    expect(dist.pmf.length).toBe(4);

    // X = 0: mass 1/8
    expect(dist.pmf[0].value).toBe(0);
    expect(dist.pmf[0].preimages).toEqual(['TTT']);
    expect(dist.pmf[0].mass).toEqual(createRational(1n, 8n));

    // X = 1: mass 3/8
    expect(dist.pmf[1].value).toBe(1);
    expect(dist.pmf[1].preimages).toEqual(['HTT', 'THT', 'TTH']);
    expect(dist.pmf[1].mass).toEqual(createRational(3n, 8n));

    // X = 2: mass 3/8
    expect(dist.pmf[2].value).toBe(2);
    expect(dist.pmf[2].preimages).toEqual(['HHT', 'HTH', 'THH']);
    expect(dist.pmf[2].mass).toEqual(createRational(3n, 8n));

    // X = 3: mass 1/8
    expect(dist.pmf[3].value).toBe(3);
    expect(dist.pmf[3].preimages).toEqual(['HHH']);
    expect(dist.pmf[3].mass).toEqual(createRational(1n, 8n));

    // Total mass must equal 1 exactly
    expect(dist.totalMass).toEqual(createRational(1n, 1n));
    expect(dist.isComplete).toBe(true);
  });

  it('evaluates net payoff game with negative mapped values', () => {
    const q = createRational(1n, 4n);
    const space2Coins: FiniteSampleSpace = {
      outcomes: ['HH', 'HT', 'TH', 'TT'],
      masses: [q, q, q, q],
    };

    const payoffMapping: Record<string, number> = {
      HH: 2,
      HT: 0,
      TH: 0,
      TT: -3,
    };

    const res = calculateInducedDistribution(space2Coins, payoffMapping);
    expect(res.status).toBe('valid');
    const dist = res.value!;

    expect(dist.distinctValues).toEqual([-3, 0, 2]);
    expect(dist.pmf[0].value).toBe(-3);
    expect(dist.pmf[0].mass).toEqual(createRational(1n, 4n));

    expect(dist.pmf[1].value).toBe(0);
    expect(dist.pmf[1].preimages).toEqual(['HT', 'TH']);
    expect(dist.pmf[1].mass).toEqual(createRational(1n, 2n)); // 2/4 = 1/2

    expect(dist.pmf[2].value).toBe(2);
    expect(dist.pmf[2].mass).toEqual(createRational(1n, 4n));
  });

  it('rejects incomplete mapping with E-MAPPING-INCOMPLETE', () => {
    const incompleteMapping: Record<string, number> = {
      HHH: 3,
      HHT: 2,
      // missing HTH, HTT, THH, THT, TTH, TTT
    };

    const res = calculateInducedDistribution(space3Coins, incompleteMapping);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-MAPPING-INCOMPLETE');
    expect(res.message).toContain('Mapping is incomplete');
  });

  it('rejects non-numeric mapping values with E-MAPPING-INCOMPLETE', () => {
    const badMapping = {
      ...headsCountMapping,
      TTT: 'invalid_number',
    };

    const res = calculateInducedDistribution(space3Coins, badMapping);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-MAPPING-INCOMPLETE');
  });
});
