/**
 * Local Persistence Adapter
 * Conforms to A-005 v0.2 §7, A-007 v0.1 §5, and A-003 v0.4 §2.2
 */

export interface StoredAttempt {
  readonly attempt_id: string;
  readonly exercise_id: string;
  readonly timestamp: string;
  readonly raw_response: string;
  readonly outcome: 'correct' | 'incorrect';
  readonly calculation_id: string;
  readonly feedback_summary: string;
  readonly schema_version: string;
}

export interface ActivityEvent {
  readonly event_id: string;
  readonly target_id: string;
  readonly activity_type: 'exercise_attempt' | 'concept_view' | 'lab_interaction';
  readonly timestamp: string;
  readonly description: string;
}

export interface LabResumePayload {
  readonly lab_id: string;
  readonly timestamp: string;
  readonly sample_space?: {
    readonly outcomes: readonly string[];
    readonly masses: readonly string[];
  };
  readonly event_a?: readonly string[];
  readonly event_b?: readonly string[];
  readonly operation?: string;
  readonly snapshot_name?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly schema_version: string;
}

export interface LabComparisonSnapshot<TSettings = any, TOutput = any, TSim = any> {
  readonly lab_id: string;
  readonly snapshot_id: string;
  readonly name: string;
  readonly timestamp: string;
  readonly settings: TSettings;
  readonly theoreticalOutputs?: TOutput;
  readonly simulationOutputs?: TSim;
  readonly metadata?: {
    readonly calculation_engine_version?: string;
    readonly schema_version?: string;
  };
}

export const ALL_SUPPORTED_LAB_IDS = [
  'PL-01',
  'PL-02',
  'PL-03',
  'PL-04',
  'PL-05',
  'PL-06',
  'PL-07',
  'PL-08',
  'PL-09',
  'PL-10',
  'PL-11',
  'EXP-BUILDER',
] as const;

export interface LearnerStateExport {
  readonly export_version: string;
  readonly exported_at: string;
  readonly attempts: readonly StoredAttempt[];
  readonly activities: readonly ActivityEvent[];
  readonly labResumes: Readonly<Record<string, LabResumePayload>>;
  readonly snapshots: Readonly<Record<string, LabComparisonSnapshot>>;
  readonly manualReviewFlags?: Readonly<Record<string, boolean>>;
  readonly statistics: {
    readonly totalAttempts: number;
    readonly correctAttempts: number;
    readonly accuracy: number;
    readonly uniqueExercisesAttempted: number;
  };
}

const STORAGE_PREFIX = 'prs_storage_v1_';
const ATTEMPTS_KEY = `${STORAGE_PREFIX}attempts`;
const ACTIVITIES_KEY = `${STORAGE_PREFIX}activities`;
const LAB_RESUME_KEY_PREFIX = `${STORAGE_PREFIX}lab_resume_`;
const LAB_SNAPSHOT_KEY_PREFIX = `${STORAGE_PREFIX}lab_snapshot_`;
const MANUAL_FLAGS_KEY = `${STORAGE_PREFIX}manual_review_flags`;

// In-memory fallback for environments without window.localStorage (e.g. Node/tests)
const memoryStore = new Map<string, string>();

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return memoryStore.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // fallback
    }
  }
  memoryStore.set(key, value);
}

function removeItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // fallback
    }
  }
  memoryStore.delete(key);
}

export { removeItem };

export class LocalPersistenceService {
  static recordAttempt(attempt: Omit<StoredAttempt, 'attempt_id' | 'timestamp' | 'schema_version'>): StoredAttempt {
    const fullAttempt: StoredAttempt = {
      ...attempt,
      attempt_id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      schema_version: '1.0.0',
    };

    try {
      const existing = this.getAttempts();
      const updated = [fullAttempt, ...existing];
      setItem(ATTEMPTS_KEY, JSON.stringify(updated));

      // Also record an activity event
      this.recordActivity({
        target_id: attempt.exercise_id,
        activity_type: 'exercise_attempt',
        description: `Completed attempt on ${attempt.exercise_id}: ${attempt.outcome.toUpperCase()}`,
      });
    } catch (err) {
      console.error('Storage write error for attempt:', err);
    }

    return fullAttempt;
  }

  static getAttempts(exerciseId?: string): StoredAttempt[] {
    try {
      const raw = getItem(ATTEMPTS_KEY);
      if (!raw) return [];
      const list: StoredAttempt[] = JSON.parse(raw);
      if (exerciseId) {
        return list.filter((a) => a.exercise_id === exerciseId);
      }
      return list;
    } catch {
      return [];
    }
  }

  static recordActivity(event: Omit<ActivityEvent, 'event_id' | 'timestamp'>): ActivityEvent {
    const fullEvent: ActivityEvent = {
      ...event,
      event_id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = this.getActivities();
      const updated = [fullEvent, ...existing].slice(0, 100);
      setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Storage write error for activity:', err);
    }

    return fullEvent;
  }

  static getActivities(): ActivityEvent[] {
    try {
      const raw = getItem(ACTIVITIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveLabResume(payload: Omit<LabResumePayload, 'timestamp' | 'schema_version'>): void {
    const full: LabResumePayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      schema_version: '1.0.0',
    };
    try {
      setItem(`${LAB_RESUME_KEY_PREFIX}${payload.lab_id}`, JSON.stringify(full));
    } catch (err) {
      console.error('Storage write error for lab resume:', err);
    }
  }

  static getLabResume(labId: string): LabResumePayload | null {
    try {
      const raw = getItem(`${LAB_RESUME_KEY_PREFIX}${labId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Saves comparison snapshot for a given laboratory conforming to A-003 §2.2
   */
  static saveLabSnapshot(snapshot: LabComparisonSnapshot): void {
    try {
      setItem(`${LAB_SNAPSHOT_KEY_PREFIX}${snapshot.lab_id}`, JSON.stringify(snapshot));
    } catch (err) {
      console.error('Storage write error for lab snapshot:', err);
    }
  }

  /**
   * Retrieves saved comparison snapshot for a lab
   */
  static getLabSnapshot(labId: string): LabComparisonSnapshot | null {
    try {
      const raw = getItem(`${LAB_SNAPSHOT_KEY_PREFIX}${labId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Removes saved comparison snapshot for a lab
   */
  static deleteLabSnapshot(labId: string): void {
    removeItem(`${LAB_SNAPSHOT_KEY_PREFIX}${labId}`);
  }

  /**
   * Retrieves all saved comparison snapshots across all labs
   */
  static getAllLabSnapshots(): Record<string, LabComparisonSnapshot> {
    const snapshots: Record<string, LabComparisonSnapshot> = {};
    for (const labId of ALL_SUPPORTED_LAB_IDS) {
      const snap = this.getLabSnapshot(labId);
      if (snap) {
        snapshots[labId] = snap;
      }
    }
    return snapshots;
  }

  /**
   * Retrieves all manual review flags conforming to A-002 §8.1 and A-005 §7
   */
  static getManualReviewFlags(): Record<string, boolean> {
    try {
      const raw = getItem(MANUAL_FLAGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Sets or clears a manual review flag for a concept
   */
  static setManualReviewFlag(conceptId: string, flagged: boolean): void {
    try {
      const flags = this.getManualReviewFlags();
      if (flagged) {
        flags[conceptId] = true;
      } else {
        delete flags[conceptId];
      }
      setItem(MANUAL_FLAGS_KEY, JSON.stringify(flags));
    } catch (err) {
      console.error('Storage write error for manual review flag:', err);
    }
  }

  /**
   * Toggles a manual review flag for a concept
   */
  static toggleManualReviewFlag(conceptId: string): boolean {
    const flags = this.getManualReviewFlags();
    const newState = !flags[conceptId];
    this.setManualReviewFlag(conceptId, newState);
    return newState;
  }

  static exportLearnerState(): LearnerStateExport {
    const attempts = this.getAttempts();
    const activities = this.getActivities();
    const manualReviewFlags = this.getManualReviewFlags();

    const labResumes: Record<string, LabResumePayload> = {};
    for (const labId of ALL_SUPPORTED_LAB_IDS) {
      const res = this.getLabResume(labId);
      if (res) {
        labResumes[labId] = res;
      }
    }

    const snapshots = this.getAllLabSnapshots();

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.outcome === 'correct').length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
    const uniqueExercises = new Set(attempts.map((a) => a.exercise_id)).size;

    return {
      export_version: '1.0.0',
      exported_at: new Date().toISOString(),
      attempts,
      activities,
      labResumes,
      snapshots,
      manualReviewFlags,
      statistics: {
        totalAttempts,
        correctAttempts,
        accuracy,
        uniqueExercisesAttempted: uniqueExercises,
      },
    };
  }

  static exportLearnerStateJson(): string {
    return JSON.stringify(this.exportLearnerState(), null, 2);
  }

  static importLearnerStateJson(
    jsonString: string
  ): { success: boolean; importedAttempts: number; importedActivities: number; importedSnapshots?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, importedAttempts: 0, importedActivities: 0, error: 'Invalid JSON payload.' };
      }

      if (!Array.isArray(parsed.attempts) || !Array.isArray(parsed.activities)) {
        return { success: false, importedAttempts: 0, importedActivities: 0, error: 'Malformed export format: missing attempts or activities array.' };
      }

      // Merge attempts
      const currentAttempts = this.getAttempts();
      const existingIds = new Set(currentAttempts.map((a) => a.attempt_id));
      const newAttempts: StoredAttempt[] = [];
      for (const att of parsed.attempts) {
        if (att && att.attempt_id && !existingIds.has(att.attempt_id)) {
          newAttempts.push(att);
          existingIds.add(att.attempt_id);
        }
      }
      const mergedAttempts = [...newAttempts, ...currentAttempts];
      setItem(ATTEMPTS_KEY, JSON.stringify(mergedAttempts));

      // Merge activities
      const currentActivities = this.getActivities();
      const existingActIds = new Set(currentActivities.map((a) => a.event_id));
      const newActivities: ActivityEvent[] = [];
      for (const act of parsed.activities) {
        if (act && act.event_id && !existingActIds.has(act.event_id)) {
          newActivities.push(act);
          existingActIds.add(act.event_id);
        }
      }
      const mergedActivities = [...newActivities, ...currentActivities].slice(0, 100);
      setItem(ACTIVITIES_KEY, JSON.stringify(mergedActivities));

      // Restore lab resumes
      if (parsed.labResumes && typeof parsed.labResumes === 'object') {
        for (const [labId, resumePayload] of Object.entries(parsed.labResumes)) {
          if (resumePayload && typeof resumePayload === 'object') {
            setItem(`${LAB_RESUME_KEY_PREFIX}${labId}`, JSON.stringify(resumePayload));
          }
        }
      }

      // Restore snapshots
      let importedSnapshots = 0;
      if (parsed.snapshots && typeof parsed.snapshots === 'object') {
        for (const snap of Object.values(parsed.snapshots)) {
          if (snap && typeof snap === 'object') {
            this.saveLabSnapshot(snap as LabComparisonSnapshot);
            importedSnapshots++;
          }
        }
      }

      // Restore manual review flags
      if (parsed.manualReviewFlags && typeof parsed.manualReviewFlags === 'object') {
        setItem(MANUAL_FLAGS_KEY, JSON.stringify(parsed.manualReviewFlags));
      }

      return {
        success: true,
        importedAttempts: newAttempts.length,
        importedActivities: newActivities.length,
        importedSnapshots,
      };
    } catch (err) {
      return {
        success: false,
        importedAttempts: 0,
        importedActivities: 0,
        error: err instanceof Error ? err.message : 'Unknown parsing error.',
      };
    }
  }

  static clearAll(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
      memoryStore.clear();
    } catch (err) {
      console.error('Clear storage error:', err);
    }
  }
}
