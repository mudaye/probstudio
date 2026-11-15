import React, { useState, useEffect, useMemo } from 'react';
import {
  ALL_EXERCISES,
  ALL_CONCEPTS,
  getExerciseById,
  getExercisesByModule,
  getConceptById,
} from '../../core/content/fixtures';
import { PARTS, MODULES, getModuleById } from '../../core/content/modules';
import { checkExactRationalAnswer, AssessmentCheckResult } from '../../core/assessment/checker';
import { LocalPersistenceService, StoredAttempt } from '../../core/storage/persistence';
import { MathView } from '../components/MathView';
import { ModuleNavDrawer } from '../components/ModuleNavDrawer';
import { ContextualHelpBar } from '../components/ContextualHelpBar';
import { buildRevisionQueue } from '../../core/mastery/scheduler';

const MODULE_TO_LAB: Record<string, { labId: string; labTitle: string }> = {
  M01: { labId: 'PL-01', labTitle: 'PL-01 Event & Probability Builder' },
  M02: { labId: 'PL-02', labTitle: 'PL-02 Conditional & Bayes Lab' },
  M03: { labId: 'PL-02', labTitle: 'PL-02 Conditional & Bayes Lab' },
  M04: { labId: 'PL-03', labTitle: 'PL-03 Independence Laboratory' },
  M05: { labId: 'PL-04', labTitle: 'PL-04 Random Variable Mapper' },
  M06: { labId: 'PL-05', labTitle: 'PL-05 CDF & PMF Explorer' },
  M07: { labId: 'PL-05', labTitle: 'PL-05 CDF & PMF Explorer' },
  M08: { labId: 'PL-06', labTitle: 'PL-06 Distribution Explorer' },
  M09: { labId: 'PL-07', labTitle: 'PL-07 Continuous Explorer' },
  M10: { labId: 'PL-07', labTitle: 'PL-07 Continuous Explorer' },
  M11: { labId: 'PL-08', labTitle: 'PL-08 Transform & Moments' },
  M12: { labId: 'PL-08', labTitle: 'PL-08 Transform & Moments' },
  M13: { labId: 'PL-08', labTitle: 'PL-08 Transform & Moments' },
  M14: { labId: 'PL-08', labTitle: 'PL-08 Transform & Moments' },
  M15: { labId: 'PL-11', labTitle: 'PL-11 Central Limit Theorem & IID Sums' },
  M16: { labId: 'PL-09', labTitle: 'PL-09 Joint & Marginals' },
  M17: { labId: 'PL-09', labTitle: 'PL-09 Joint & Marginals' },
  M18: { labId: 'PL-09', labTitle: 'PL-09 Joint & Marginals' },
  M19: { labId: 'PL-10', labTitle: 'PL-10 Conditionals, Channel & Transforms' },
  M20: { labId: 'PL-10', labTitle: 'PL-10 Conditionals, Channel & Transforms' },
  M21: { labId: 'PL-11', labTitle: 'PL-11 Central Limit Theorem & IID Sums' },
  M22: { labId: 'PL-10', labTitle: 'PL-10 Conditionals, Channel & Transforms' },
};

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
  const [reviewOnly, setReviewOnly] = useState<boolean>(false);
  const [isGridViewOpen, setIsGridViewOpen] = useState<boolean>(false);
  const [selfAssessment, setSelfAssessment] = useState<'can_explain' | 'partly' | 'need_help' | null>(null);
  const [latestAttemptId, setLatestAttemptId] = useState<string | null>(null);
  const [manualFlags, setManualFlags] = useState<Record<string, boolean>>(() =>
    LocalPersistenceService.getManualReviewFlags()
  );

  const reviewDueConcepts = useMemo(() => {
    const attempts = LocalPersistenceService.getAttempts();
    const activities = LocalPersistenceService.getActivities();
    const flags = LocalPersistenceService.getManualReviewFlags();
    const queue = buildRevisionQueue(ALL_CONCEPTS, attempts, activities, flags);
    return new Set(queue.map((q) => q.conceptId));
  }, [history, manualFlags]);

  // Filter exercises
  const visibleExercises = useMemo(() => {
    let list = selectedModuleId
      ? getExercisesByModule(selectedModuleId)
      : ALL_EXERCISES;

    if (reviewOnly) {
      list = list.filter((ex) =>
        ex.linkedConceptIds.some((cid) => reviewDueConcepts.has(cid))
      );
    }
    return list;
  }, [selectedModuleId, reviewOnly, reviewDueConcepts]);

  const activeExercise =
    getExerciseById(selectedExerciseId) || visibleExercises[0] || ALL_EXERCISES[0];

  const currentIndex = visibleExercises.findIndex((ex) => ex.id === activeExercise.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < visibleExercises.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setSelectedExerciseId(visibleExercises[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedExerciseId(visibleExercises[currentIndex + 1].id);
    }
  };

  const currentInput = inputMap[activeExercise.id] ?? '';
  const currentResult = resultsMap[activeExercise.id] ?? null;

  useEffect(() => {
    setHistory(LocalPersistenceService.getAttempts(activeExercise.id));
    setSelfAssessment(null);
    setLatestAttemptId(null);
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
      const att = LocalPersistenceService.recordAttempt({
        exercise_id: activeExercise.id,
        raw_response: currentInput,
        outcome: checkResult.status,
        calculation_id: 'CAL-EVENT-001',
        feedback_summary: checkResult.message,
        hints_used: 0,
      });
      setLatestAttemptId(att.attempt_id);
      setHistory(LocalPersistenceService.getAttempts(activeExercise.id));
    }
  };

  const handleSelfAssess = (choice: 'can_explain' | 'partly' | 'need_help') => {
    setSelfAssessment(choice);
    if (latestAttemptId) {
      LocalPersistenceService.updateAttemptSelfAssessment(latestAttemptId, choice);
    }
  };

  const isConceptFlagged = activeExercise.linkedConceptIds.some((cid) => !!manualFlags[cid]);

  const handleToggleGymReviewFlag = () => {
    const nextFlagged = !isConceptFlagged;
    for (const cid of activeExercise.linkedConceptIds) {
      LocalPersistenceService.setManualReviewFlag(cid, nextFlagged);
    }
    setManualFlags(LocalPersistenceService.getManualReviewFlags());
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>{isDrawerOpen ? '✕ Hide Filter Panel' : '☰ Filter by Module'}</span>
            {selectedModuleId && <span className="mod-id-badge active">{selectedModuleId}</span>}
          </button>

          <button
            className="btn-secondary btn-sm"
            onClick={() => setReviewOnly((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: reviewOnly ? '#fef3c7' : '#ffffff',
              color: reviewOnly ? '#b45309' : '#475569',
              borderColor: reviewOnly ? '#fcd34d' : '#cbd5e1',
              fontWeight: 600,
            }}
            title="Filter exercises to concepts currently due for revision (A-001 §2.3)"
          >
            <span>⏰ Review Due Only</span>
            <span
              style={{
                background: reviewOnly ? '#b45309' : '#e2e8f0',
                color: reviewOnly ? '#ffffff' : '#475569',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.72rem',
              }}
            >
              {reviewDueConcepts.size}
            </span>
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
          onNavigate={onNavigate}
        />

        {/* Practice Problem Workspace */}
        <div className="drawer-layout-content">
          {/* Ambient Contextual Help Guide */}
          <ContextualHelpBar screen="practice" />

          {visibleExercises.length > 0 ? (
            <div>
              {/* Exercise Selector: Stepper & Dropdown Combobox (No Clunky Horizontal Scrollbar) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.8rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  className="btn-secondary btn-sm"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  title="Previous Exercise"
                >
                  &larr; Prev
                </button>

                <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="exercise-select" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                    Problem:
                  </label>
                  <select
                    id="exercise-select"
                    value={activeExercise.id}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                    }}
                  >
                    {PARTS.map((part) => {
                      const partModules = MODULES.filter((m) => m.partId === part.id);
                      return partModules.map((mod) => {
                        const modExercises = visibleExercises.filter((ex) => ex.moduleId === mod.id);
                        if (modExercises.length === 0) return null;
                        return (
                          <optgroup key={mod.id} label={`${part.id} • ${mod.id}: ${mod.title}`}>
                            {modExercises.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.id}: {ex.title} ({ex.category})
                              </option>
                            ))}
                          </optgroup>
                        );
                      });
                    })}
                  </select>
                </div>

                <button
                  className="btn-secondary btn-sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  title="Next Exercise"
                >
                  Next &rarr;
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#64748b',
                      padding: '2px 8px',
                      background: '#e2e8f0',
                      borderRadius: '12px',
                    }}
                  >
                    {currentIndex + 1} of {visibleExercises.length}
                  </span>

                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setIsGridViewOpen((prev) => !prev)}
                    title={isGridViewOpen ? 'Hide problem chips' : 'Show problem chips as a clean wrapped grid'}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {isGridViewOpen ? '▲ Hide Chips' : '☷ Grid View'}
                  </button>
                </div>
              </div>

              {/* Module-scoped pills (clean & compact) OR expanded grid view */}
              {(selectedModuleId || isGridViewOpen) && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
                    padding: '0.75rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
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
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{ex.id}</span>
                        <span>{ex.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

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

                {/* Self-Assessment & Review Flagging (A-002 §5.2 & A-005 §7) */}
                {currentResult && (currentResult.status === 'correct' || currentResult.status === 'incorrect') && (
                  <div
                    style={{
                      marginTop: '1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        Self-Assessment Feedback (A-002 §5.2):
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className={`pill ${selfAssessment === 'can_explain' ? 'selected' : ''}`}
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            background: selfAssessment === 'can_explain' ? '#dcfce7' : '#ffffff',
                            color: selfAssessment === 'can_explain' ? '#15803d' : '#475569',
                            borderColor: selfAssessment === 'can_explain' ? '#86efac' : '#cbd5e1',
                          }}
                          onClick={() => handleSelfAssess('can_explain')}
                        >
                          🟢 I can explain this
                        </button>
                        <button
                          type="button"
                          className={`pill ${selfAssessment === 'partly' ? 'selected' : ''}`}
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            background: selfAssessment === 'partly' ? '#fef3c7' : '#ffffff',
                            color: selfAssessment === 'partly' ? '#b45309' : '#475569',
                            borderColor: selfAssessment === 'partly' ? '#fcd34d' : '#cbd5e1',
                          }}
                          onClick={() => handleSelfAssess('partly')}
                        >
                          🟡 Partly
                        </button>
                        <button
                          type="button"
                          className={`pill ${selfAssessment === 'need_help' ? 'selected' : ''}`}
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            background: selfAssessment === 'need_help' ? '#fee2e2' : '#ffffff',
                            color: selfAssessment === 'need_help' ? '#b91c1c' : '#475569',
                            borderColor: selfAssessment === 'need_help' ? '#fca5a5' : '#cbd5e1',
                          }}
                          onClick={() => handleSelfAssess('need_help')}
                        >
                          🔴 I need help
                        </button>
                      </div>
                    </div>

                    {/* "I need help" Action Banner */}
                    {selfAssessment === 'need_help' && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px dashed #cbd5e1',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                          Need reinforcement? Add this concept to your Dashboard review queue:
                        </span>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{
                            background: isConceptFlagged ? '#fef3c7' : '#ffffff',
                            borderColor: isConceptFlagged ? '#fcd34d' : '#fca5a5',
                            color: isConceptFlagged ? '#b45309' : '#b91c1c',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                          }}
                          onClick={handleToggleGymReviewFlag}
                        >
                          {isConceptFlagged ? '✓ Added to Review Queue' : '🔖 Add Concept to Review Queue'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Linked Concept & Playground Cross-Links (Preserving Context) */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Need to review theory or experiment?
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
                    {MODULE_TO_LAB[activeExercise.moduleId] && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => onNavigate('playground', { labId: MODULE_TO_LAB[activeExercise.moduleId].labId })}
                        style={{ background: '#faf5ff', borderColor: '#d8b4fe', color: '#7c3aed', fontWeight: 600 }}
                      >
                        🧪 {MODULE_TO_LAB[activeExercise.moduleId].labId} Lab &rarr;
                      </button>
                    )}
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
            /* Selected module or review filter has no exercises */
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <span className="badge badge-source" style={{ marginBottom: '1rem' }}>
                {reviewOnly ? 'Spaced Revision' : `${selectedModule?.id} • ${selectedModule?.partId}`}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {reviewOnly
                  ? 'No Exercises Currently Due for Review'
                  : `No Exercises Authored Yet for ${selectedModule?.id}`}
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                {reviewOnly
                  ? 'Great job! You have no outstanding review items in this filter. Switch off "Review Due Only" to practice any exercise.'
                  : `${selectedModule?.title} exercises will be added in upcoming curriculum increments.`}
              </p>
              <button
                className="btn-primary btn-sm"
                onClick={() => {
                  setReviewOnly(false);
                  handleSelectModule(null);
                }}
              >
                Clear Filters & Browse All Exercises
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
