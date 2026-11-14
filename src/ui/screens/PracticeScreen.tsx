import React, { useState, useEffect } from 'react';
import { EXERCISE_EX000001 } from '../../core/content/fixtures';
import { getModuleById } from '../../core/content/modules';
import { checkExactRationalAnswer, AssessmentCheckResult } from '../../core/assessment/checker';
import { LocalPersistenceService, StoredAttempt } from '../../core/storage/persistence';
import { MathView } from '../components/MathView';
import { ModuleNavDrawer } from '../components/ModuleNavDrawer';

interface PracticeScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  savedInput?: string;
  onSaveInput?: (input: string) => void;
  initialModuleId?: string | null;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  onNavigate,
  savedInput = '',
  onSaveInput,
  initialModuleId = null,
}) => {
  const [inputVal, setInputVal] = useState<string>(savedInput);
  const [result, setResult] = useState<AssessmentCheckResult | null>(null);
  const [history, setHistory] = useState<StoredAttempt[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Collapsed by default in practice to maximize problem workspace
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId);

  useEffect(() => {
    setHistory(LocalPersistenceService.getAttempts(EXERCISE_EX000001.id));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (onSaveInput) {
      onSaveInput(val);
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const checkResult = checkExactRationalAnswer(
      inputVal,
      EXERCISE_EX000001.expectedRational,
      EXERCISE_EX000001.explanationLatex
    );
    setResult(checkResult);

    if (checkResult.status === 'correct' || checkResult.status === 'incorrect') {
      LocalPersistenceService.recordAttempt({
        exercise_id: EXERCISE_EX000001.id,
        raw_response: inputVal,
        outcome: checkResult.status,
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: checkResult.message,
      });
      setHistory(LocalPersistenceService.getAttempts(EXERCISE_EX000001.id));
    }
  };

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) : null;
  const isMatch = !selectedModuleId || selectedModuleId === 'M01';

  return (
    <div className="practice-view">
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn-secondary btn-sm"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span>{isDrawerOpen ? '✕ Hide Filter Panel' : '☰ Filter by Module'}</span>
          {selectedModuleId && <span className="mod-id-badge active">{selectedModuleId}</span>}
        </button>

        {selectedModuleId && (
          <button
            className="btn-secondary btn-sm"
            onClick={() => setSelectedModuleId(null)}
          >
            Clear Filter (Browse All)
          </button>
        )}
      </div>

      <div className="drawer-layout">
        {/* Scoped Module Filter Drawer */}
        <ModuleNavDrawer
          isOpen={isDrawerOpen}
          onToggle={() => setIsDrawerOpen((prev) => !prev)}
          selectedModuleId={selectedModuleId}
          onSelectModule={(id) => setSelectedModuleId(id)}
          title="Exercise Filters"
          subtitle="Filter by curriculum module"
        />

        {/* Practice Problem Workspace */}
        <div className="drawer-layout-content">
          {/* Active filter notification if filtered */}
          {selectedModuleId && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.9rem' }}>
                Showing exercises for <strong>{selectedModule?.id}: {selectedModule?.title}</strong>
              </div>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setSelectedModuleId(null)}
              >
                ✕ Clear
              </button>
            </div>
          )}

          {isMatch ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span className="tag-label">Practice Gym &bull; Module M01</span>
                  <h1 className="card-title" style={{ marginTop: '0.25rem' }}>{EXERCISE_EX000001.title}</h1>
                </div>
                <span className="badge badge-supplementary">
                  Supplementary (Illustrative setup)
                </span>
              </div>

              {/* Exercise Prompt Card */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  PROBLEM STATEMENT
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {EXERCISE_EX000001.prompt}
                </p>
                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
                  <MathView math={EXERCISE_EX000001.promptLatex} block />
                </div>

                {/* Input Form */}
                <form onSubmit={handleCheck} style={{ marginTop: '1.5rem' }}>
                  <label
                    htmlFor="answer-input"
                    style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}
                  >
                    Your exact answer: (e.g. <code>1/2</code> or <code>0.5</code>)
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      id="answer-input"
                      type="text"
                      value={inputVal}
                      onChange={handleInputChange}
                      placeholder="e.g. 1/2"
                      style={{
                        padding: '0.6rem 0.9rem',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '1.05rem',
                        minWidth: '180px',
                        maxWidth: '240px',
                      }}
                      autoFocus
                    />
                    <button type="submit" className="btn-primary">
                      Check Answer
                    </button>
                  </div>
                </form>

                {/* Feedback / Result Banner */}
                {result && (
                  <div
                    className={`alert ${
                      result.status === 'correct'
                        ? 'alert-success'
                        : result.status === 'incorrect'
                        ? 'alert-error'
                        : 'alert-warning'
                    }`}
                    style={{ marginTop: '1.5rem' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                      {result.status === 'correct' && '✓ Correct!'}
                      {result.status === 'incorrect' && '✗ Incorrect'}
                      {result.status === 'invalid_input' && '⚠ Invalid Input'}
                    </div>
                    <p>{result.message}</p>
                    {result.explanationLatex && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.75rem' }}>
                        <strong>Mathematical Derivation:</strong>
                        <MathView math={result.explanationLatex} block />
                      </div>
                    )}
                  </div>
                )}

                {/* Concept Link (Preserving Context) */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Need to refresh the theory first?
                  </div>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => onNavigate('atlas', { conceptId: 'C-000001', returnTo: 'practice' })}
                  >
                    📖 Review Concept in Atlas (Sample Spaces & Events) &rarr;
                  </button>
                </div>
              </div>

              {/* History of Attempts */}
              {history.length > 0 && (
                <div className="card">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    PREVIOUS ATTEMPTS FOR THIS EXERCISE ({history.length})
                  </h4>
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Response</th>
                        <th>Outcome</th>
                        <th>Deterministic Engine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((att) => (
                        <tr key={att.attempt_id}>
                          <td style={{ fontSize: '0.85rem' }}>{new Date(att.timestamp).toLocaleTimeString()}</td>
                          <td><code>{att.raw_response}</code></td>
                          <td>
                            <span className={`badge ${att.outcome === 'correct' ? 'alert-success' : 'alert-error'}`}>
                              {att.outcome.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{att.calculation_id} (Exact Rational)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Selected module has no exercises yet */
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <span className="badge badge-source" style={{ marginBottom: '1rem' }}>
                {selectedModule?.id} &bull; {selectedModule?.partId}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Exercises Authored Yet for {selectedModule?.id}
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                {selectedModule?.title} exercises will be added in upcoming curriculum increments.
              </p>
              <button
                className="btn-primary btn-sm"
                onClick={() => setSelectedModuleId(null)}
              >
                Clear Filters & Browse Available Exercises
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
