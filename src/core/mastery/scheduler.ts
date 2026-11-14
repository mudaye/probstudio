/**
 * Adaptive Mastery & Spaced Revision Engine
 * Conforms to A-001 v0.4 §2.3, A-002 v0.4 §8.2, A-005 v0.2 §7, and A-006 v0.1 §9
 */

import { ConceptContent, ALL_CONCEPTS, ALL_EXERCISES } from '../content/fixtures';
import { getModuleById } from '../content/modules';
import { StoredAttempt, ActivityEvent } from '../storage/persistence';
import {
  ConceptMasteryRecord,
  MasteryStatus,
  MasterySummary,
  RevisionQueueItem,
  LEITNER_INTERVALS_DAYS,
} from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Extracts a calendar day string (YYYY-MM-DD) from an ISO timestamp.
 */
export function getCalendarDay(isoTimestamp: string): string {
  try {
    return new Date(isoTimestamp).toISOString().slice(0, 10);
  } catch {
    return isoTimestamp.slice(0, 10);
  }
}

/**
 * Computes deterministic mastery record for a single concept.
 */
export function computeConceptMastery(
  concept: ConceptContent,
  attempts: readonly StoredAttempt[],
  activities: readonly ActivityEvent[],
  isManualFlagged: boolean = false,
  nowMs: number = Date.now()
): ConceptMasteryRecord {
  // Find all exercises associated with this concept
  const conceptExercises = ALL_EXERCISES.filter((e) => e.linkedConceptIds.includes(concept.id));
  const conceptExerciseIds = new Set(conceptExercises.map((e) => e.id));

  // Filter attempts belonging to this concept
  const linkedAttempts = attempts.filter((a) => conceptExerciseIds.has(a.exercise_id));

  // Filter activities belonging to this concept
  const linkedActivities = activities.filter(
    (act) => act.target_id === concept.id || conceptExerciseIds.has(act.target_id)
  );

  const totalAttempts = linkedAttempts.length;
  const correctAttemptsList = linkedAttempts.filter((a) => a.outcome === 'correct');
  const correctAttempts = correctAttemptsList.length;

  // An attempt is unassisted if hints_used is 0 or undefined
  const unassistedCorrectList = correctAttemptsList.filter(
    (a) => (a as any).hints_used === undefined || (a as any).hints_used === 0
  );
  const unassistedCorrectAttempts = unassistedCorrectList.length;

  // Distinct calendar days of correct attempts
  const distinctDays = new Set(correctAttemptsList.map((a) => getCalendarDay(a.timestamp)));
  const distinctDaysCount = distinctDays.size;

  // Distinct exercise categories / formats attempted
  const attemptedExerciseIds = new Set(linkedAttempts.map((a) => a.exercise_id));
  const distinctFormats = new Set(
    conceptExercises.filter((e) => attemptedExerciseIds.has(e.id)).map((e) => e.category)
  );
  const distinctFormatsCount = distinctFormats.size;

  // Sort linked attempts by timestamp ascending
  const sortedAttempts = [...linkedAttempts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const lastAttempt = sortedAttempts.length > 0 ? sortedAttempts[sortedAttempts.length - 1] : null;
  const lastAttemptDate = lastAttempt ? lastAttempt.timestamp : null;

  // Criteria for Secure status:
  // 1. >= 3 unassisted correct attempts
  // 2. >= 2 distinct calendar days
  // 3. >= 2 distinct exercise formats (or all available formats if the concept only has 1 format)
  const availableFormatsCount = new Set(conceptExercises.map((e) => e.category)).size;
  const formatCriterionMet =
    availableFormatsCount > 1 ? distinctFormatsCount >= 2 : distinctFormatsCount >= 1;

  const isSecureEligible =
    unassistedCorrectAttempts >= 3 &&
    distinctDaysCount >= 2 &&
    formatCriterionMet;

  // Calculate review intervals and next review date
  let currentIntervalDays = 1;
  let nextReviewDate: string | null = null;
  let lastReviewedDate: string | null = null;
  const reasons: string[] = [];

  if (isManualFlagged) {
    reasons.push('Marked for review by learner');
  }

  if (lastAttempt && lastAttempt.outcome === 'incorrect') {
    reasons.push('Recent incorrect attempt requires reinforcement');
  }

  if (isSecureEligible) {
    // Calculate Leitner progression level based on consecutive correct attempts since last error
    let consecutiveCorrect = 0;
    for (let i = sortedAttempts.length - 1; i >= 0; i--) {
      if (sortedAttempts[i].outcome === 'correct') {
        consecutiveCorrect++;
      } else {
        break;
      }
    }

    const intervalIdx = Math.min(
      consecutiveCorrect > 0 ? consecutiveCorrect - 1 : 0,
      LEITNER_INTERVALS_DAYS.length - 1
    );
    currentIntervalDays = LEITNER_INTERVALS_DAYS[intervalIdx];

    const lastCorrectAttempt = correctAttemptsList[correctAttemptsList.length - 1];
    lastReviewedDate = lastCorrectAttempt ? lastCorrectAttempt.timestamp : lastAttemptDate;

    if (lastReviewedDate) {
      const nextMs = new Date(lastReviewedDate).getTime() + currentIntervalDays * MS_PER_DAY;
      nextReviewDate = new Date(nextMs).toISOString();

      if (nowMs >= nextMs) {
        reasons.push(`Spaced review due (${currentIntervalDays}-day interval elapsed)`);
      }
    }
  } else if (totalAttempts > 0) {
    // In Practising state
    currentIntervalDays = 1;
    if (lastAttemptDate) {
      const nextMs = new Date(lastAttemptDate).getTime() + 1 * MS_PER_DAY;
      nextReviewDate = new Date(nextMs).toISOString();
      if (nowMs >= nextMs && lastAttempt?.outcome === 'incorrect') {
        reasons.push('Next-day review due for practice reinforcement');
      }
    }
  }

  // Derive status
  let status: MasteryStatus = 'unseen';

  if (isManualFlagged) {
    status = 'review_due';
  } else if (isSecureEligible) {
    if (nextReviewDate && nowMs >= new Date(nextReviewDate).getTime()) {
      status = 'review_due';
    } else if (lastAttempt && lastAttempt.outcome === 'incorrect') {
      status = 'review_due';
    } else {
      status = 'secure';
    }
  } else if (totalAttempts > 0) {
    if (lastAttempt && lastAttempt.outcome === 'incorrect' && nextReviewDate && nowMs >= new Date(nextReviewDate).getTime()) {
      status = 'review_due';
    } else {
      status = 'practising';
    }
  } else if (linkedActivities.length > 0) {
    status = 'exploring';
  }

  return {
    conceptId: concept.id,
    status,
    totalAttempts,
    correctAttempts,
    unassistedCorrectAttempts,
    distinctDaysCount,
    distinctFormatsCount,
    lastAttemptDate,
    lastReviewedDate,
    nextReviewDate,
    currentIntervalDays,
    isManualReviewFlagged: isManualFlagged,
    reasonsForReview: reasons,
  };
}

/**
 * Builds the prioritized Spaced Revision Queue across the curriculum.
 */
export function buildRevisionQueue(
  allConcepts: readonly ConceptContent[] = ALL_CONCEPTS,
  attempts: readonly StoredAttempt[],
  activities: readonly ActivityEvent[],
  manualFlags: Readonly<Record<string, boolean>> = {},
  nowMs: number = Date.now()
): RevisionQueueItem[] {
  const queue: RevisionQueueItem[] = [];

  for (const concept of allConcepts) {
    const isFlagged = !!manualFlags[concept.id];
    const record = computeConceptMastery(concept, attempts, activities, isFlagged, nowMs);

    if (record.status === 'review_due') {
      const nextMs = record.nextReviewDate ? new Date(record.nextReviewDate).getTime() : nowMs;
      const daysOverdue = Math.max(0, Math.floor((nowMs - nextMs) / MS_PER_DAY));

      const mod = getModuleById(concept.moduleId);
      const linkedExercises = ALL_EXERCISES.filter((e) => e.linkedConceptIds.includes(concept.id));

      queue.push({
        conceptId: concept.id,
        conceptTitle: concept.title,
        moduleId: concept.moduleId,
        part: mod ? mod.partId : 'P1',
        status: record.status,
        daysOverdue,
        nextReviewDate: record.nextReviewDate || new Date(nowMs).toISOString(),
        reason: record.reasonsForReview[0] || 'Due for concept revision',
        primaryExerciseId: linkedExercises.length > 0 ? linkedExercises[0].id : undefined,
        linkedLabId: mod?.labAssociation,
      });
    }
  }

  // Sort queue: Manual flags first, then by days overdue descending
  return queue.sort((a, b) => {
    const aFlagged = !!manualFlags[a.conceptId];
    const bFlagged = !!manualFlags[b.conceptId];
    if (aFlagged && !bFlagged) return -1;
    if (!aFlagged && bFlagged) return 1;
    return b.daysOverdue - a.daysOverdue;
  });
}

/**
 * Computes high-level curriculum mastery summary metrics.
 */
export function computeMasterySummary(
  allConcepts: readonly ConceptContent[] = ALL_CONCEPTS,
  attempts: readonly StoredAttempt[],
  activities: readonly ActivityEvent[],
  manualFlags: Readonly<Record<string, boolean>> = {},
  nowMs: number = Date.now()
): MasterySummary {
  let unseenCount = 0;
  let exploringCount = 0;
  let practisingCount = 0;
  let secureCount = 0;
  let reviewDueCount = 0;

  for (const concept of allConcepts) {
    const isFlagged = !!manualFlags[concept.id];
    const record = computeConceptMastery(concept, attempts, activities, isFlagged, nowMs);
    switch (record.status) {
      case 'unseen':
        unseenCount++;
        break;
      case 'exploring':
        exploringCount++;
        break;
      case 'practising':
        practisingCount++;
        break;
      case 'secure':
        secureCount++;
        break;
      case 'review_due':
        reviewDueCount++;
        break;
    }
  }

  const total = allConcepts.length;
  const completionPercentage = total > 0 ? Math.round(((secureCount + (reviewDueCount * 0.5)) / total) * 100) : 0;

  return {
    totalConcepts: total,
    unseenCount,
    exploringCount,
    practisingCount,
    secureCount,
    reviewDueCount,
    completionPercentage,
  };
}
