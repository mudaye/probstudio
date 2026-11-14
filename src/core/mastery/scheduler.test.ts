import { describe, it, expect } from 'vitest';
import {
  computeConceptMastery,
  buildRevisionQueue,
  computeMasterySummary,
} from './scheduler';
import { CONCEPT_C000001, CONCEPT_C000002, ALL_CONCEPTS } from '../content/fixtures';
import { StoredAttempt, ActivityEvent } from '../storage/persistence';

describe('Adaptive Mastery & Spaced Revision Engine (scheduler.ts)', () => {
  const baseConcept = CONCEPT_C000001; // C-000001 (Probability Foundations, M01)

  it('marks concept as unseen when no attempts or activities exist', () => {
    const record = computeConceptMastery(baseConcept, [], [], false, Date.now());
    expect(record.status).toBe('unseen');
    expect(record.totalAttempts).toBe(0);
    expect(record.correctAttempts).toBe(0);
    expect(record.isManualReviewFlagged).toBe(false);
  });

  it('marks concept as exploring when viewed in Atlas or Lab without attempts', () => {
    const activities: ActivityEvent[] = [
      {
        event_id: 'ev-1',
        target_id: baseConcept.id,
        activity_type: 'concept_view',
        timestamp: '2026-11-10T10:00:00Z',
        description: 'Viewed concept in Atlas',
      },
    ];

    const record = computeConceptMastery(baseConcept, [], activities, false, Date.now());
    expect(record.status).toBe('exploring');
    expect(record.totalAttempts).toBe(0);
  });

  it('marks concept as practising when attempts exist but do not meet Secure criteria', () => {
    const attempts: StoredAttempt[] = [
      {
        attempt_id: 'att-1',
        exercise_id: 'EX-000001',
        timestamp: '2026-11-10T10:00:00Z',
        raw_response: '1/2',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
    ];

    const record = computeConceptMastery(baseConcept, attempts, [], false, Date.now());
    expect(record.status).toBe('practising');
    expect(record.totalAttempts).toBe(1);
    expect(record.correctAttempts).toBe(1);
  });

  it('enforces multi-day requirement for Secure status (3 correct on SAME day remains practising)', () => {
    const sameDay = '2026-11-10';
    const attempts: StoredAttempt[] = [
      {
        attempt_id: 'att-1',
        exercise_id: 'EX-000001',
        timestamp: `${sameDay}T10:00:00Z`,
        raw_response: '1/2',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-2',
        exercise_id: 'EX-000002',
        timestamp: `${sameDay}T11:00:00Z`,
        raw_response: '3/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-3',
        exercise_id: 'EX-000003',
        timestamp: `${sameDay}T12:00:00Z`,
        raw_response: '1/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
    ];

    const record = computeConceptMastery(CONCEPT_C000002, attempts, [], false, new Date(`${sameDay}T14:00:00Z`).getTime());
    expect(record.distinctDaysCount).toBe(1);
    expect(record.status).toBe('practising'); // Gated by multi-day rule
  });

  it('grants Secure status when >=3 correct attempts span >=2 calendar days', () => {
    const day1 = '2026-11-10';
    const day2 = '2026-11-11';
    const attempts: StoredAttempt[] = [
      {
        attempt_id: 'att-1',
        exercise_id: 'EX-000001',
        timestamp: `${day1}T10:00:00Z`,
        raw_response: '1/2',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-2',
        exercise_id: 'EX-000002',
        timestamp: `${day1}T11:00:00Z`,
        raw_response: '3/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-3',
        exercise_id: 'EX-000003',
        timestamp: `${day2}T12:00:00Z`,
        raw_response: '1/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
    ];

    // Current time is just 2 hours after the third attempt (interval is 1 day, so not due yet)
    const nowMs = new Date(`${day2}T14:00:00Z`).getTime();
    const record = computeConceptMastery(CONCEPT_C000002, attempts, [], false, nowMs);

    expect(record.distinctDaysCount).toBe(2);
    expect(record.correctAttempts).toBe(3);
    expect(record.status).toBe('secure');
  });

  it('transitions Secure concept to review_due when Leitner interval elapses', () => {
    const day1 = '2026-11-10';
    const day2 = '2026-11-11';
    const attempts: StoredAttempt[] = [
      {
        attempt_id: 'att-1',
        exercise_id: 'EX-000001',
        timestamp: `${day1}T10:00:00Z`,
        raw_response: '1/2',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-2',
        exercise_id: 'EX-000002',
        timestamp: `${day1}T11:00:00Z`,
        raw_response: '3/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-3',
        exercise_id: 'EX-000003',
        timestamp: `${day2}T12:00:00Z`,
        raw_response: '1/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
    ];

    // Check after 8 days (3 consecutive correct = 7-day Leitner interval; 8 days later -> review due!)
    const laterMs = new Date(`${day2}T12:00:00Z`).getTime() + 8 * 24 * 3600 * 1000;
    const record = computeConceptMastery(CONCEPT_C000002, attempts, [], false, laterMs);

    expect(record.status).toBe('review_due');
    expect(record.reasonsForReview.length).toBeGreaterThan(0);
  });

  it('drops to review_due on recent error even if previously eligible for secure', () => {
    const day1 = '2026-11-10';
    const day2 = '2026-11-11';
    const attempts: StoredAttempt[] = [
      {
        attempt_id: 'att-1',
        exercise_id: 'EX-000001',
        timestamp: `${day1}T10:00:00Z`,
        raw_response: '1/2',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-2',
        exercise_id: 'EX-000002',
        timestamp: `${day1}T11:00:00Z`,
        raw_response: '3/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-3',
        exercise_id: 'EX-000003',
        timestamp: `${day2}T12:00:00Z`,
        raw_response: '1/4',
        outcome: 'correct',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Correct',
        schema_version: '1.0',
      },
      {
        attempt_id: 'att-4',
        exercise_id: 'EX-000001',
        timestamp: `${day2}T13:00:00Z`,
        raw_response: '0',
        outcome: 'incorrect',
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: 'Incorrect',
        schema_version: '1.0',
      },
    ];

    const nowMs = new Date(`${day2}T14:00:00Z`).getTime();
    const record = computeConceptMastery(CONCEPT_C000002, attempts, [], false, nowMs);

    expect(record.status).toBe('review_due');
    expect(record.reasonsForReview).toContain('Recent incorrect attempt requires reinforcement');
  });

  it('respects manual review flag and marks review_due immediately', () => {
    const record = computeConceptMastery(baseConcept, [], [], true, Date.now());
    expect(record.status).toBe('review_due');
    expect(record.isManualReviewFlagged).toBe(true);
    expect(record.reasonsForReview).toContain('Marked for review by learner');
  });

  it('buildRevisionQueue prioritizes manual flags first and computes days overdue', () => {
    const queue = buildRevisionQueue(
      ALL_CONCEPTS,
      [],
      [],
      { [baseConcept.id]: true },
      Date.now()
    );

    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].conceptId).toBe(baseConcept.id);
    expect(queue[0].reason).toContain('Marked for review');
  });

  it('computeMasterySummary aggregates curriculum metrics across all 44 concepts', () => {
    const summary = computeMasterySummary(ALL_CONCEPTS, [], []);
    expect(summary.totalConcepts).toBe(44);
    expect(summary.unseenCount).toBe(44);
    expect(summary.secureCount).toBe(0);
    expect(summary.completionPercentage).toBe(0);
  });
});
