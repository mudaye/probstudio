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
