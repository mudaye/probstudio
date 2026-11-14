/**
 * Core Mathematical and Result Status Types
 * Conforms to A-004 v0.2 and A-004/A-005 Shared Contracts v0.2
 */

import { Rational } from './rational';

export type ResultStatus =
  | 'valid'
  | 'invalid_configuration'
  | 'undefined'
  | 'unsupported'
  | 'calculation_error'
  | 'cancelled';

export type PrecisionType = 'exact' | 'approximate' | 'empirical';

export type CalculationId =
  | 'CAL-EVENT-001'
  | 'CAL-EVENT-002'
  | 'CAL-COND-001'
  | 'CAL-COND-002'
  | 'CAL-INDEP-001'
  | 'CAL-INDEP-002'
  | 'CAL-INDEP-003'
  | 'CAL-RV-001'
  | 'CAL-PMF-001'
  | 'CAL-CDF-001'
  | 'CAL-CDF-002'
  | 'CAL-DIST-001'
  | 'CAL-DIST-002'
  | 'CAL-DIST-003'
  | 'CAL-DIST-004'
  | 'CAL-CONT-001'
  | 'CAL-CONT-002'
  | 'CAL-CONT-003'
  | 'CAL-CONT-004';

export type ErrorCode =
  | 'E-PROB-RANGE'
  | 'E-PROB-SUM'
  | 'E-NONFINITE-INPUT'
  | 'E-BOUNDS-ORDER'
  | 'E-BOUNDARY-CONVENTION'
  | 'E-SUPPORT-DUPLICATE'
  | 'E-EVENT-OUTSIDE-SPACE'
  | 'E-MAPPING-INCOMPLETE'
  | 'E-PARAM-DOMAIN'
  | 'E-RUN-COUNT'
  | 'E-SEED-FORMAT'
  | 'E-COND-ZERO'
  | 'E-UNSUPPORTED-MODEL'
  | 'E-UNSUPPORTED-REGION'
  | 'E-UNSUPPORTED-SCALE'
  | 'E-NUMERIC-CONVERGENCE'
  | 'E-REPAIR-INELIGIBLE'
  | 'E-SIM-CANCELLED';

export interface CalculationResult<T = unknown> {
  readonly calculation_id: CalculationId;
  readonly status: ResultStatus;
  readonly precision: PrecisionType;
  readonly value: T | null;
  readonly exact_rational?: Rational | null;
  readonly display_value?: string;
  readonly latex_value?: string;
  readonly error_code?: ErrorCode;
  readonly message?: string;
  readonly calculation_engine_version: string;
}

export interface FiniteSampleSpace {
  readonly outcomes: readonly string[];
  readonly masses: readonly Rational[];
}

export type SetOperation = 'union' | 'intersection' | 'complement' | 'difference';
