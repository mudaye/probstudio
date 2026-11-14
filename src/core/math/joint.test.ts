import { describe, it, expect } from 'vitest';
import {
  createDiscreteJointTable,
  queryDiscreteRectangleProbability,
  getContinuousTriangularModel,
  queryContinuousBoundaryEvent,
  queryContinuousTriangularRectangle,
  checkJointIndependence,
  simulateJointDistribution,
} from './joint';

describe('Deterministic Joint Distribution Engine (A-004 compliance)', () => {
  describe('CAL-JOINT-001: Discrete 2D Joint Table & Marginals', () => {
    it('verifies default 2x2 equal mass table is valid, normalized, and independent (A-004 golden vector)', () => {
      const res = createDiscreteJointTable(
        [0, 1],
        [0, 1],
        [
          ['1/4', '1/4'],
          ['1/4', '1/4'],
        ]
      );

      expect(res.status).toBe('valid');
      expect(res.value?.isNormalized).toBe(true);
      expect(res.value?.totalMass.num).toBe(1n);
      expect(res.value?.totalMass.den).toBe(1n);

      // Marginals should each be 1/2
      expect(res.value?.xMarginals[0].num).toBe(1n);
      expect(res.value?.xMarginals[0].den).toBe(2n);
      expect(res.value?.xMarginals[1].num).toBe(1n);
      expect(res.value?.xMarginals[1].den).toBe(2n);

      expect(res.value?.yMarginals[0].num).toBe(1n);
      expect(res.value?.yMarginals[0].den).toBe(2n);
      expect(res.value?.yMarginals[1].num).toBe(1n);
      expect(res.value?.yMarginals[1].den).toBe(2n);

      // Check independence
      const indepRes = checkJointIndependence({ type: 'discrete', data: res.value! });
      expect(indepRes.status).toBe('valid');
      expect(indepRes.value?.isIndependent).toBe(true);
      expect(indepRes.value?.maxDiscrepancy).toBe(0);
    });

    it('identifies dependent discrete joint table', () => {
      // Dependent table: X=0,Y=0 has mass 0.4, X=0,Y=1 has 0.1, X=1,Y=0 has 0.1, X=1,Y=1 has 0.4
      const res = createDiscreteJointTable(
        [0, 1],
        [0, 1],
        [
          ['4/10', '1/10'],
          ['1/10', '4/10'],
        ]
      );
      expect(res.status).toBe('valid');
      const indepRes = checkJointIndependence({ type: 'discrete', data: res.value! });
      expect(indepRes.value?.isIndependent).toBe(false);
      expect(indepRes.value?.maxDiscrepancy).toBeGreaterThan(0);
    });

    it('rejects unnormalized discrete tables with E-PROB-SUM', () => {
      const res = createDiscreteJointTable(
        [0, 1],
        [0, 1],
        [
          ['1/4', '1/4'],
          ['1/4', '1/2'], // sums to 5/4
        ]
      );
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PROB-SUM');
    });

    it('rejects negative masses with E-PROB-RANGE', () => {
      const res = createDiscreteJointTable(
        [0, 1],
        [0, 1],
        [
          ['-1/4', '1/2'],
          ['1/2', '1/4'],
        ]
      );
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PROB-RANGE');
    });
  });

  describe('CAL-JOINT-002: Rectangle Query', () => {
    it('computes discrete rectangle probability', () => {
      const tableRes = createDiscreteJointTable(
        [0, 1, 2],
        [0, 1, 2],
        [
          ['1/9', '1/9', '1/9'],
          ['1/9', '1/9', '1/9'],
          ['1/9', '1/9', '1/9'],
        ]
      );
      expect(tableRes.status).toBe('valid');

      const rectRes = queryDiscreteRectangleProbability(tableRes.value!.table, {
        xMin: 0,
        xMax: 1,
        yMin: 0,
        yMax: 1,
      });

      expect(rectRes.status).toBe('valid');
      expect(rectRes.value?.probability).toBeCloseTo(4 / 9);
      expect(rectRes.value?.exactRational?.num).toBe(4n);
      expect(rectRes.value?.exactRational?.den).toBe(9n);
    });

    it('rejects inverted rectangle bounds with E-BOUNDS-ORDER', () => {
      const tableRes = createDiscreteJointTable(
        [0, 1],
        [0, 1],
        [
          ['1/4', '1/4'],
          ['1/4', '1/4'],
        ]
      );
      const rectRes = queryDiscreteRectangleProbability(tableRes.value!.table, {
        xMin: 2,
        xMax: 1,
        yMin: 0,
        yMax: 1,
      });
      expect(rectRes.status).toBe('invalid_configuration');
      expect(rectRes.error_code).toBe('E-BOUNDS-ORDER');
    });
  });

  describe('CAL-JOINT-003 & CAL-JOINT-004: Continuous Triangular Model (A-004 golden vectors)', () => {
    it('verifies triangular continuous model and boundary event P(Y > X + c) = (1 - c)^2', () => {
      const model = getContinuousTriangularModel();
      expect(model.status).toBe('valid');
      expect(model.value?.densityValue).toBe(2.0);

      // Golden Vector from A-004 §5.1: c = 0.5 gives 0.25
      const queryHalf = queryContinuousBoundaryEvent(0.5);
      expect(queryHalf.status).toBe('valid');
      expect(queryHalf.value?.probability).toBe(0.25);

      // Boundary c <= 0 gives 1
      const queryZero = queryContinuousBoundaryEvent(0);
      expect(queryZero.value?.probability).toBe(1.0);
      const queryNeg = queryContinuousBoundaryEvent(-0.5);
      expect(queryNeg.value?.probability).toBe(1.0);

      // Boundary c >= 1 gives 0
      const queryOne = queryContinuousBoundaryEvent(1.0);
      expect(queryOne.value?.probability).toBe(0.0);
      const queryTwo = queryContinuousBoundaryEvent(1.5);
      expect(queryTwo.value?.probability).toBe(0.0);

      // Verify independence check detects dependence
      const indepRes = checkJointIndependence({ type: 'continuous_triangular' });
      expect(indepRes.status).toBe('valid');
      expect(indepRes.value?.isIndependent).toBe(false);
      expect(indepRes.value?.explanation).toContain('X and Y are dependent');
    });

    it('computes continuous triangular rectangle probability', () => {
      // Rectangle [0, 1] x [0, 1] covers entire unit square, intersecting support gives probability 1.0
      const full = queryContinuousTriangularRectangle({
        xMin: 0,
        xMax: 1,
        yMin: 0,
        yMax: 1,
      });
      expect(full.status).toBe('valid');
      expect(full.value?.probability).toBe(1.0);

      // Non-overlapping region (lower triangle x >= y): x in [0.5, 1], y in [0, 0.4] has 0 probability
      const empty = queryContinuousTriangularRectangle({
        xMin: 0.5,
        xMax: 1.0,
        yMin: 0,
        yMax: 0.4,
      });
      expect(empty.value?.probability).toBe(0);
    });
  });

  describe('CAL-JOINT-006: Bivariate PRNG Simulation', () => {
    it('reproduces bivariate continuous simulation deterministically and converges to theoretical probability', () => {
      const sim1 = simulateJointDistribution(
        { type: 'continuous_triangular' },
        2000,
        12345,
        undefined,
        0.5 // P(Y > X + 0.5) theoretical is 0.25
      );
      const sim2 = simulateJointDistribution(
        { type: 'continuous_triangular' },
        2000,
        12345,
        undefined,
        0.5
      );

      expect(sim1.empiricalBoundaryProb).toBe(sim2.empiricalBoundaryProb);
      expect(sim1.empiricalBoundaryProb).toBeGreaterThan(0.22);
      expect(sim1.empiricalBoundaryProb).toBeLessThan(0.28);
    });
  });
});
