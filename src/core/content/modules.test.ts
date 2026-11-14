import { describe, it, expect } from 'vitest';
import { PARTS, MODULES, getModulesByPart, getModuleById } from './modules';

describe('Module Catalog (A-001 §4.1 Integrity)', () => {
  it('contains exactly 3 parts: P1, P2, P3', () => {
    expect(PARTS.length).toBe(3);
    expect(PARTS.map((p) => p.id)).toEqual(['P1', 'P2', 'P3']);
  });

  it('contains exactly 22 modules M01 through M22', () => {
    expect(MODULES.length).toBe(22);
    const expectedIds = Array.from({ length: 22 }, (_, i) => {
      const num = (i + 1).toString().padStart(2, '0');
      return `M${num}`;
    });
    expect(MODULES.map((m) => m.id)).toEqual(expectedIds);
  });

  it('correctly maps modules to Part 1 (8 modules), Part 2 (7 modules), Part 3 (7 modules)', () => {
    const p1Mods = getModulesByPart('P1');
    const p2Mods = getModulesByPart('P2');
    const p3Mods = getModulesByPart('P3');

    expect(p1Mods.length).toBe(8);
    expect(p2Mods.length).toBe(7);
    expect(p3Mods.length).toBe(7);

    expect(p1Mods[0].id).toBe('M01');
    expect(p1Mods[7].id).toBe('M08');
    expect(p2Mods[0].id).toBe('M09');
    expect(p2Mods[6].id).toBe('M15');
    expect(p3Mods[0].id).toBe('M16');
    expect(p3Mods[6].id).toBe('M22');
  });

  it('retrieves individual modules by ID', () => {
    const m01 = getModuleById('M01');
    expect(m01).toBeDefined();
    expect(m01?.title).toBe('Probability Foundations');
    expect(m01?.partId).toBe('P1');
    expect(m01?.status).toBe('active');

    const m02 = getModuleById('M02');
    expect(m02).toBeDefined();
    expect(m02?.title).toBe('Conditional Probability');
    expect(m02?.status).toBe('active');
    expect(m02?.conceptCount).toBe(2);
    expect(m02?.exerciseCount).toBe(1);
    expect(m02?.labAssociation).toBe('PL-02');

    const m03 = getModuleById('M03');
    expect(m03).toBeDefined();
    expect(m03?.title).toContain('Total Probability');
    expect(m03?.status).toBe('active');
    expect(m03?.conceptCount).toBe(2);
    expect(m03?.exerciseCount).toBe(2);
    expect(m03?.labAssociation).toBe('PL-02');

    const m04 = getModuleById('M04');
    expect(m04).toBeDefined();
    expect(m04?.title).toBe('Event Independence');
    expect(m04?.status).toBe('active');
    expect(m04?.conceptCount).toBe(2);
    expect(m04?.exerciseCount).toBe(2);
    expect(m04?.labAssociation).toBe('PL-03');

    const m05 = getModuleById('M05');
    expect(m05).toBeDefined();
    expect(m05?.title).toContain('Random Variables');
    expect(m05?.status).toBe('active');
    expect(m05?.conceptCount).toBe(2);
    expect(m05?.exerciseCount).toBe(2);
    expect(m05?.labAssociation).toBe('PL-04');

    const m06 = getModuleById('M06');
    expect(m06).toBeDefined();
    expect(m06?.title).toContain('Cumulative Distribution');
    expect(m06?.status).toBe('active');
    expect(m06?.conceptCount).toBe(2);
    expect(m06?.exerciseCount).toBe(2);
    expect(m06?.labAssociation).toBe('PL-05');

    const m07 = getModuleById('M07');
    expect(m07).toBeDefined();
    expect(m07?.title).toContain('Discrete Random Variables');
    expect(m07?.status).toBe('active');
    expect(m07?.conceptCount).toBe(2);
    expect(m07?.exerciseCount).toBe(2);
    expect(m07?.labAssociation).toBe('PL-05');

    const m08 = getModuleById('M08');
    expect(m08).toBeDefined();
    expect(m08?.title).toContain('Discrete Distributions');
    expect(m08?.status).toBe('active');
    expect(m08?.conceptCount).toBe(2);
    expect(m08?.exerciseCount).toBe(2);
    expect(m08?.labAssociation).toBe('PL-06');

    const m09 = getModuleById('M09');
    expect(m09).toBeDefined();
    expect(m09?.title).toContain('Continuous Random Variables');
    expect(m09?.status).toBe('active');
    expect(m09?.conceptCount).toBe(2);
    expect(m09?.exerciseCount).toBe(2);
    expect(m09?.labAssociation).toBe('PL-07');

    const m10 = getModuleById('M10');
    expect(m10).toBeDefined();
    expect(m10?.title).toContain('Common Continuous Distributions');
    expect(m10?.status).toBe('active');
    expect(m10?.conceptCount).toBe(2);
    expect(m10?.exerciseCount).toBe(1);
    expect(m10?.labAssociation).toBe('PL-07');

    const m11 = getModuleById('M11');
    expect(m11).toBeDefined();
    expect(m11?.title).toContain('Functions and Transformations');
    expect(m11?.status).toBe('active');
    expect(m11?.conceptCount).toBe(2);
    expect(m11?.exerciseCount).toBe(1);
    expect(m11?.labAssociation).toBe('PL-07');
  });
});
