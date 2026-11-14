/**
 * Local Persistence Adapter
 * Conforms to A-005 v0.2 §7 and A-007 v0.1 §5
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
  readonly sample_space: {
    readonly outcomes: readonly string[];
    readonly masses: readonly string[];
  };
  readonly event_a: readonly string[];
  readonly event_b: readonly string[];
  readonly operation: string;
  readonly snapshot_name?: string;
  readonly schema_version: string;
}

export interface LearnerStateExport {
  readonly export_version: string;
  readonly exported_at: string;
  readonly attempts: readonly StoredAttempt[];
  readonly activities: readonly ActivityEvent[];
  readonly labResumes: Readonly<Record<string, LabResumePayload>>;
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

  static exportLearnerState(): LearnerStateExport {
    const attempts = this.getAttempts();
    const activities = this.getActivities();

    const labResumes: Record<string, LabResumePayload> = {};
    for (const labId of ['PL-01', 'PL-02', 'PL-03', 'PL-04', 'PL-05', 'PL-06']) {
      const res = this.getLabResume(labId);
      if (res) {
        labResumes[labId] = res;
      }
    }

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
  ): { success: boolean; importedAttempts: number; importedActivities: number; error?: string } {
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

      return {
        success: true,
        importedAttempts: newAttempts.length,
        importedActivities: newActivities.length,
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
