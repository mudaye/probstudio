import React, { useState, useEffect } from 'react';
import {
  ALL_EXERCISES,
  getExerciseById,
  getExercisesByModule,
  getConceptById,
} from '../../core/content/fixtures';
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
  initialExerciseId?: string | null;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  onNavigate,
  savedInput = '',
  onSaveInput,
  initialModuleId = null,
  initialExerciseId = null,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(initialExerciseId || 'EX-000001');

  // Input state dictionary per exercise
  const [inputMap, setInputMap] = useState<Record<string, string>>({
    'EX-000001': savedInput,
  });

  const [resultsMap, setResultsMap] = useState<Record<string, AssessmentCheckResult | null>>({});
  const [history, setHistory] = useState<StoredAttempt[]>([]);

  // Filter exercises
  const visibleExercises = selectedModuleId
    ? getExercisesByModule(selectedModuleId)
    : ALL_EXERCISES;

  const activeExercise =
    getExerciseById(selectedExerciseId) || visibleExercises[0] || ALL_EXERCISES[0];

  const currentInput = inputMap[activeExercise.id] ?? '';
  const currentResult = resultsMap[activeExercise.id] ?? null;

  useEffect(() => {
    setHistory(LocalPersistenceService.getAttempts(activeExercise.id));
  }, [activeExercise.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMap((prev) => ({
      ...prev,
      [activeExercise.id]: val,
    }));
    if (activeExercise.id === 'EX-000001' && onSaveInput) {
      onSaveInput(val);
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const checkResult = checkExactRationalAnswer(
      currentInput,
      activeExercise.expectedRational,
      activeExercise.explanationLatex
    );

    setResultsMap((prev) => ({
      ...prev,
      [activeExercise.id]: checkResult,
    }));

    if (checkResult.status === 'correct' || checkResult.status === 'incorrect') {
      LocalPersistenceService.recordAttempt({
        exercise_id: activeExercise.id,
        raw_response: currentInput,
        outcome: checkResult.status,
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: checkResult.message,
      });
      setHistory(LocalPersistenceService.getAttempts(activeExercise.id));
    }
  };

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) : null;

  const handleSelectModule = (modId: string | null) => {
    setSelectedModuleId(modId);
    if (modId) {
      const modExercises = getExercisesByModule(modId);
      if (modExercises.length > 0) {
        setSelectedExerciseId(modExercises[0].id);
      }
    }
  };

  return (
    <div className="practice-view">
      {/* Top Filter and Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>{isDrawerOpen ? '✕ Hide Filter Panel' : '☰ Filter by Module'}</span>
            {selectedModuleId && <span className="mod-id-badge active">{selectedModuleId}</span>}
          </button>

          {selectedModuleId && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Filtering: <strong>{selectedModule?.id}: {selectedModule?.title}</strong>
            </span>
          )}
        </div>

        {selectedModuleId && (
          <button
            className="btn-secondary btn-sm"
            onClick={() => handleSelectModule(null)}
          >
            Clear Filter (Browse All Exercises)
          </button>
        )}
      </div>

      <div className="drawer-layout">
        {/* Scoped Module Filter Drawer */}
        <ModuleNavDrawer
          isOpen={isDrawerOpen}
          onToggle={() => setIsDrawerOpen((prev) => !prev)}
          selectedModuleId={selectedModuleId}
          onSelectModule={handleSelectModule}
          title="Exercise Filters"
          subtitle="Filter by curriculum module"
        />

        {/* Practice Problem Workspace */}
        <div className="drawer-layout-content">
          {visibleExercises.length > 0 ? (
            <div>
              {/* Exercise Selector Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem',
                }}
                role="tablist"
                aria-label="Available exercises"
              >
                {visibleExercises.map((ex) => {
                  const isSelected = ex.id === activeExercise.id;
                  return (
                    <button
                      key={ex.id}
                      role="tab"
                      aria-selected={isSelected}
                      className={`pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedExerciseId(ex.id)}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{ex.id}</span>
                      <span>{ex.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Exercise Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="tag-label">
                    Practice Gym &bull; {activeExercise.moduleId} &bull; {activeExercise.id}
                  </span>
                  <h1 className="card-title" style={{ marginTop: '0.25rem' }}>{activeExercise.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-source" style={{ textTransform: 'capitalize' }}>
                    {activeExercise.category}
                  </span>
                  <span className="badge badge-supplementary">
                    Supplementary (Illustrative setup)
                  </span>
                </div>
              </div>

              {/* Exercise Prompt Card */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  PROBLEM STATEMENT
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {activeExercise.prompt}
                </p>
                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
                  <MathView math={activeExercise.promptLatex} block />
                </div>

                {/* Input Form */}
                <form onSubmit={handleCheck} style={{ marginTop: '1.5rem' }}>
                  <label
                    htmlFor={`answer-input-${activeExercise.id}`}
                    style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}
                  >
                    Your exact answer: (e.g. <code>1/2</code>, <code>0.97</code>, or <code>2/3</code>)
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      id={`answer-input-${activeExercise.id}`}
                      type="text"
                      value={currentInput}
                      onChange={handleInputChange}
                      placeholder="e.g. 1/2 or 0.97"
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
                {currentResult && (
                  <div
                    className={`alert ${
                      currentResult.status === 'correct'
                        ? 'alert-success'
                        : currentResult.status === 'incorrect'
                        ? 'alert-error'
                        : 'alert-warning'
                    }`}
                    style={{ marginTop: '1.5rem' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                      {currentResult.status === 'correct' && '✓ Correct!'}
                      {currentResult.status === 'incorrect' && '✗ Incorrect'}
                      {currentResult.status === 'invalid_input' && '⚠ Invalid Input'}
                    </div>
                    <p>{currentResult.message}</p>
                    {currentResult.explanationLatex && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.75rem' }}>
                        <strong>Mathematical Derivation:</strong>
                        <MathView math={currentResult.explanationLatex} block />
                      </div>
                    )}
                  </div>
                )}

                {/* Linked Concept Cross-Links (Preserving Context) */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Need to review theory for this problem?
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {activeExercise.linkedConceptIds.map((cid) => {
                      const concept = getConceptById(cid);
                      return (
                        <button
                          key={cid}
                          className="btn-secondary btn-sm"
                          onClick={() => onNavigate('atlas', { conceptId: cid, returnTo: 'practice' })}
                        >
                          📖 {concept ? concept.title : cid} &rarr;
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* History of Attempts */}
              {history.length > 0 && (
                <div className="card">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    PREVIOUS ATTEMPTS FOR {activeExercise.id} ({history.length})
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
                onClick={() => handleSelectModule(null)}
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
