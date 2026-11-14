export type MasteryStatus = 'unseen' | 'exploring' | 'practising' | 'secure' | 'review_due';

export const LEITNER_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
export type LeitnerInterval = typeof LEITNER_INTERVALS_DAYS[number];

export interface ConceptMasteryRecord {
  conceptId: string;
  status: MasteryStatus;
  totalAttempts: number;
  correctAttempts: number;
  unassistedCorrectAttempts: number;
  distinctDaysCount: number;
  distinctFormatsCount: number;
  lastAttemptDate: string | null;
  lastReviewedDate: string | null;
  nextReviewDate: string | null;
  currentIntervalDays: number;
  isManualReviewFlagged: boolean;
  reasonsForReview: string[];
}

export interface RevisionQueueItem {
  conceptId: string;
  conceptTitle: string;
  moduleId: string;
  part: string;
  status: MasteryStatus;
  daysOverdue: number;
  nextReviewDate: string;
  reason: string;
  primaryExerciseId?: string;
  linkedLabId?: string;
}

export interface MasterySummary {
  totalConcepts: number;
  unseenCount: number;
  exploringCount: number;
  practisingCount: number;
  secureCount: number;
  reviewDueCount: number;
  completionPercentage: number;
}
