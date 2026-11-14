import { describe, it, expect } from 'vitest';
import {
  calculateTriangularConditionalDensity,
  calculateCommunicationChannel,
  simulateCommunicationChannel,
  calculateJacobianLinearTransform,
} from './multivariate';

describe('Multivariate, Conditioning & Transformations Engine (A-004 & Part 3 Transcript Compliance)', () => {
  describe('CAL-COND-DIST-001: Triangular Conditional Density Slicing', () => {
    it('calculates continuous conditional density slice for Y | X = 0.5', () => {
      const res = calculateTriangularConditionalDensity('X', 0.5, 0.75, 'greater');
      expect(res.status).toBe('valid');
      if (res.status === 'valid' && res.value) {
        expect(res.value.conditionalSupport).toEqual([0.5, 1]);
        expect(res.value.conditionalDensityValue).toBeCloseTo(2.0, 5); // 1 / (1 - 0.5) = 2.0
        // P(Y > 0.75 | X = 0.5) = (1 - 0.75) / (1 - 0.5) = 0.25 / 0.5 = 0.5
        expect(res.value.theoreticalProbability).toBeCloseTo(0.5, 5);
      }
    });

    it('calculates continuous conditional density slice for X | Y = 0.8', () => {
      const res = calculateTriangularConditionalDensity('Y', 0.8, 0.4, 'less');
      expect(res.status).toBe('valid');
      if (res.status === 'valid' && res.value) {
        expect(res.value.conditionalSupport).toEqual([0, 0.8]);
        expect(res.value.conditionalDensityValue).toBeCloseTo(1.25, 5); // 1 / 0.8 = 1.25
        // P(X <= 0.4 | Y = 0.8) = 0.4 / 0.8 = 0.5
        expect(res.value.theoreticalProbability).toBeCloseTo(0.5, 5);
      }
    });

    it('enforces E-COND-ZERO when conditioning on event outside marginal support', () => {
      const res1 = calculateTriangularConditionalDensity('X', 0, 0.5);
      expect(res1.status).toBe('undefined');
      expect(res1.error_code).toBe('E-COND-ZERO');

      const res2 = calculateTriangularConditionalDensity('Y', 1.2, 0.5);
      expect(res2.status).toBe('undefined');
      expect(res2.error_code).toBe('E-COND-ZERO');
    });
  });

  describe('CAL-COMM-001: Binary Communication Channel & Mixture Densities', () => {
    it('evaluates optimal midpoint threshold and symmetric error rates under Gaussian noise', () => {
      const res = calculateCommunicationChannel({
        bit0Voltage: 0,
        bit1Voltage: 5,
        priorBit1: 0.5,
        noiseType: 'gaussian',
        noiseParam: 1.0, // sigma = 1.0
        threshold: 2.5,
      });

      expect(res.status).toBe('valid');
      if (res.status === 'valid' && res.value) {
        expect(res.value.optimalThreshold).toBe(2.5);
        // Under tau = 2.5, (2.5 - 0)/1 = 2.5, (2.5 - 5)/1 = -2.5
        // P_FA = 1 - Phi(2.5) ~ 0.0062
        // P_Miss = Phi(-2.5) ~ 0.0062
        expect(res.value.theoreticalFalseAlarm).toBeCloseTo(res.value.theoreticalMiss, 4);
        expect(res.value.theoreticalBitErrorRate).toBeCloseTo(res.value.theoreticalFalseAlarm, 4);
        expect(res.value.theoreticalDetection).toBeCloseTo(1 - res.value.theoreticalMiss, 4);
      }
    });

    it('evaluates zero error rate when uniform noise does not overlap decision boundary', () => {
      const res = calculateCommunicationChannel({
        bit0Voltage: 0,
        bit1Voltage: 5,
        priorBit1: 0.5,
        noiseType: 'uniform',
        noiseParam: 1.0, // noise in [-1, +1], bit0 receives in [-1, 1], bit1 in [4, 6]
        threshold: 2.5,
      });

      expect(res.status).toBe('valid');
      if (res.status === 'valid' && res.value) {
        expect(res.value.theoreticalFalseAlarm).toBe(0);
        expect(res.value.theoreticalMiss).toBe(0);
        expect(res.value.theoreticalBitErrorRate).toBe(0);
      }
    });

    it('validates invalid prior probability with E-PROB-RANGE', () => {
      const res = calculateCommunicationChannel({
        bit0Voltage: 0,
        bit1Voltage: 5,
        priorBit1: 1.5,
        noiseType: 'gaussian',
        noiseParam: 1.0,
        threshold: 2.5,
      });
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PROB-RANGE');
    });
  });

  describe('CAL-COMM-002: Deterministic Channel Simulation', () => {
    it('simulates channel bitstream deterministically with empirical rates close to theoretical', () => {
      const config = {
        bit0Voltage: 0,
        bit1Voltage: 5,
        priorBit1: 0.5,
        noiseType: 'gaussian' as const,
        noiseParam: 1.5,
        threshold: 2.5,
      };

      const theoretical = calculateCommunicationChannel(config);
      const sim = simulateCommunicationChannel(config, 5000, 12345);

      expect(sim.status).toBe('valid');
      if (sim.status === 'valid' && sim.value && theoretical.status === 'valid' && theoretical.value) {
        expect(sim.value.empiricalBitErrorRate).toBeCloseTo(
          theoretical.value.theoreticalBitErrorRate,
          1 // within 0.05
        );
        expect(sim.value.transmittedBits.length).toBe(50);
        expect(sim.value.receivedVoltages.length).toBe(50);
      }
    });
  });

  describe('CAL-JACOBIAN-001: 2D Linear Transformation & Jacobian', () => {
    it('computes exact Jacobian determinant for transcript sum-difference example', () => {
      // Y1 = X1 + X2, Y2 = X1 - X2
      // A = [[1, 1], [1, -1]]
      const res = calculateJacobianLinearTransform(1, 1, 1, -1);
      expect(res.status).toBe('valid');
      if (res.status === 'valid' && res.value) {
        expect(res.value.determinantA).toBe(-2);
        expect(res.value.areaScalingFactor).toBe(2);
        expect(res.value.jacobianDeterminant).toBe(-0.5);
        expect(res.value.absJacobianDeterminant).toBe(0.5);
        // Inverse matrix entries
        expect(res.value.inverseMatrix[0][0]).toBe(0.5);
        expect(res.value.inverseMatrix[0][1]).toBe(0.5);
        expect(res.value.inverseMatrix[1][0]).toBe(0.5);
        expect(res.value.inverseMatrix[1][1]).toBe(-0.5);
      }
    });

    it('rejects singular transformation with E-NONFINITE-INPUT', () => {
      // A = [[1, 2], [2, 4]], det = 0
      const res = calculateJacobianLinearTransform(1, 2, 2, 4);
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-NONFINITE-INPUT');
    });
  });
});
