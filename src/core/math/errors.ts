/**
 * Normative Error Codes and Helper Utilities
 * Conforms to A-004 v0.2 §3.3
 */

import { ErrorCode } from './types';

export interface ErrorCodeMeta {
  readonly code: ErrorCode;
  readonly title: string;
  readonly description: string;
  readonly severity: 'error' | 'warning' | 'info';
}

export const ERROR_CODE_METADATA: Record<ErrorCode, ErrorCodeMeta> = {
  'E-PROB-RANGE': {
    code: 'E-PROB-RANGE',
    title: 'Probability Out of Range',
    description: 'Probability or mass must lie within the closed interval [0, 1].',
    severity: 'error',
  },
  'E-PROB-SUM': {
    code: 'E-PROB-SUM',
    title: 'Mass Sum Mismatch',
    description: 'Total probability mass does not sum to 1 (normalization failure).',
    severity: 'warning',
  },
  'E-NONFINITE-INPUT': {
    code: 'E-NONFINITE-INPUT',
    title: 'Non-Finite Input',
    description: 'Input value is NaN, infinite, or not a parseable number.',
    severity: 'error',
  },
  'E-BOUNDS-ORDER': {
    code: 'E-BOUNDS-ORDER',
    title: 'Reversed Interval Bounds',
    description: 'Lower bound exceeds upper bound (a > b).',
    severity: 'error',
  },
  'E-BOUNDARY-CONVENTION': {
    code: 'E-BOUNDARY-CONVENTION',
    title: 'Undefined Boundary Convention',
    description: 'Boundary convention is undefined or unsupported for requested operation.',
    severity: 'error',
  },
  'E-SUPPORT-DUPLICATE': {
    code: 'E-SUPPORT-DUPLICATE',
    title: 'Duplicate Support Point',
    description: 'Duplicate or invalid outcome/support point detected.',
    severity: 'error',
  },
  'E-EVENT-OUTSIDE-SPACE': {
    code: 'E-EVENT-OUTSIDE-SPACE',
    title: 'Event Outside Sample Space',
    description: 'Specified event contains an outcome not present in sample space Ω.',
    severity: 'error',
  },
  'E-MAPPING-INCOMPLETE': {
    code: 'E-MAPPING-INCOMPLETE',
    title: 'Incomplete Random Variable Mapping',
    description: 'Random variable mapping is missing an outcome or assigns a non-finite value.',
    severity: 'error',
  },
  'E-PARAM-DOMAIN': {
    code: 'E-PARAM-DOMAIN',
    title: 'Parameter Outside Domain',
    description: 'Model or transformation parameter is outside its valid mathematical domain.',
    severity: 'error',
  },
  'E-RUN-COUNT': {
    code: 'E-RUN-COUNT',
    title: 'Invalid Simulation Run Count',
    description: 'Run count must be a positive integer within the supported ceiling.',
    severity: 'error',
  },
  'E-SEED-FORMAT': {
    code: 'E-SEED-FORMAT',
    title: 'Invalid Seed Format',
    description: 'PRNG seed cannot be parsed losslessly as a non-negative integer.',
    severity: 'error',
  },
  'E-COND-ZERO': {
    code: 'E-COND-ZERO',
    title: 'Conditioning on Zero-Probability Event',
    description: 'Conditional probability P(A|B) is undefined when conditioning event has probability P(B) = 0.',
    severity: 'error',
  },
  'E-UNSUPPORTED-MODEL': {
    code: 'E-UNSUPPORTED-MODEL',
    title: 'Unsupported Model',
    description: 'Operation and distribution model combination is not supported.',
    severity: 'warning',
  },
  'E-UNSUPPORTED-REGION': {
    code: 'E-UNSUPPORTED-REGION',
    title: 'Unsupported Region Shape',
    description: 'Integration region geometry is not supported by the analytical solver.',
    severity: 'warning',
  },
  'E-UNSUPPORTED-SCALE': {
    code: 'E-UNSUPPORTED-SCALE',
    title: 'Computation Scale Ceiling Exceeded',
    description: 'Parameter exceeds computational ceiling for exact arithmetic evaluation.',
    severity: 'warning',
  },
  'E-NUMERIC-CONVERGENCE': {
    code: 'E-NUMERIC-CONVERGENCE',
    title: 'Numerical Convergence Failure',
    description: 'Numerical integration or root-finding algorithm failed to achieve target error tolerance.',
    severity: 'error',
  },
  'E-REPAIR-INELIGIBLE': {
    code: 'E-REPAIR-INELIGIBLE',
    title: 'Repair Ineligible',
    description: 'Normalization repair requires all masses to be non-negative with a strictly positive total.',
    severity: 'error',
  },
  'E-SIM-CANCELLED': {
    code: 'E-SIM-CANCELLED',
    title: 'Simulation Cancelled',
    description: 'In-progress Monte Carlo simulation run was cancelled by the learner.',
    severity: 'info',
  },
};

export function getErrorMeta(code: ErrorCode): ErrorCodeMeta {
  return (
    ERROR_CODE_METADATA[code] || {
      code,
      title: 'Calculation Error',
      description: 'An unexpected mathematical error occurred.',
      severity: 'error',
    }
  );
}
