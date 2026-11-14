import { describe, it, expect, beforeEach } from 'vitest';
import { LocalPersistenceService } from './persistence';

describe('LocalPersistenceService', () => {
  beforeEach(() => {
    LocalPersistenceService.clearAll();
  });

  it('records an attempt and retrieves it', () => {
    const attempt = LocalPersistenceService.recordAttempt({
      exercise_id: 'EX-000001',
      raw_response: '1/2',
      outcome: 'correct',
      calculation_id: 'CAL-EVENT-001',
      feedback_summary: 'Correct answer',
    });

    expect(attempt.attempt_id).toBeDefined();
    expect(attempt.schema_version).toBe('1.0.0');

    const list = LocalPersistenceService.getAttempts('EX-000001');
    expect(list.length).toBe(1);
    expect(list[0].raw_response).toBe('1/2');
    expect(list[0].outcome).toBe('correct');
  });

  it('records activities', () => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-01',
      activity_type: 'lab_interaction',
      description: 'Test interaction',
    });

    const acts = LocalPersistenceService.getActivities();
    expect(acts.length).toBeGreaterThan(0);
    expect(acts[0].target_id).toBe('PL-01');
  });

  it('saves and loads lab resume payload', () => {
    LocalPersistenceService.saveLabResume({
      lab_id: 'PL-01',
      sample_space: {
        outcomes: ['HH', 'HT', 'TH', 'TT'],
        masses: ['1/4', '1/4', '1/4', '1/4'],
      },
      event_a: ['HH', 'HT'],
      event_b: ['HH', 'TH'],
      operation: 'intersection',
    });

    const loaded = LocalPersistenceService.getLabResume('PL-01');
    expect(loaded).toBeDefined();
    expect(loaded?.lab_id).toBe('PL-01');
    expect(loaded?.operation).toBe('intersection');
    expect(loaded?.schema_version).toBe('1.0.0');
  });

  it('exports and imports full learner state JSON with merge and integrity checks', () => {
    // Record attempts and activities
    LocalPersistenceService.recordAttempt({
      exercise_id: 'EX-000001',
      raw_response: '1/2',
      outcome: 'correct',
      calculation_id: 'CAL-EVENT-001',
      feedback_summary: 'Correct',
    });
    LocalPersistenceService.recordAttempt({
      exercise_id: 'EX-000002',
      raw_response: '0.97',
      outcome: 'correct',
      calculation_id: 'CAL-EVENT-002',
      feedback_summary: 'Correct',
    });
    LocalPersistenceService.recordActivity({
      target_id: 'M01',
      activity_type: 'concept_view',
      description: 'Viewed M01 concept',
    });

    const exportedJson = LocalPersistenceService.exportLearnerStateJson();
    expect(exportedJson).toBeDefined();

    const parsed = JSON.parse(exportedJson);
    expect(parsed.export_version).toBe('1.0.0');
    expect(parsed.attempts.length).toBe(2);
    expect(parsed.statistics.totalAttempts).toBe(2);
    expect(parsed.statistics.correctAttempts).toBe(2);
    expect(parsed.statistics.accuracy).toBe(1.0);
    expect(parsed.statistics.uniqueExercisesAttempted).toBe(2);

    // Clear state
    LocalPersistenceService.clearAll();
    expect(LocalPersistenceService.getAttempts().length).toBe(0);

    // Import state back
    const importRes = LocalPersistenceService.importLearnerStateJson(exportedJson);
    expect(importRes.success).toBe(true);
    expect(importRes.importedAttempts).toBe(2);

    const reloadedAttempts = LocalPersistenceService.getAttempts();
    expect(reloadedAttempts.length).toBe(2);
  });
});
