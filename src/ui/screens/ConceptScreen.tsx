import React, { useState, useEffect } from 'react';
import {
  ALL_CONCEPTS,
  getConceptById,
  getConceptsByModule,
  getExercisesByConcept,
} from '../../core/content/fixtures';
import { getModuleById } from '../../core/content/modules';
import { MathView } from '../components/MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';
import { ModuleNavDrawer } from '../components/ModuleNavDrawer';
import { computeConceptMastery } from '../../core/mastery/scheduler';
import { ConceptMasteryRecord } from '../../core/mastery/types';

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

interface ConceptScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  returnTo?: string;
  initialModuleId?: string | null;
  initialConceptId?: string | null;
}

export const ConceptScreen: React.FC<ConceptScreenProps> = ({
  onNavigate,
  returnTo,
  initialModuleId = null,
  initialConceptId = null,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId);
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId || 'C-000001');
  const [manualFlags, setManualFlags] = useState<Record<string, boolean>>(() =>
    LocalPersistenceService.getManualReviewFlags()
  );

  // Load available concepts for the active filter
  const visibleConcepts = selectedModuleId
    ? getConceptsByModule(selectedModuleId)
    : ALL_CONCEPTS;

  const activeConcept = getConceptById(selectedConceptId) || visibleConcepts[0] || ALL_CONCEPTS[0];

  const activeMastery: ConceptMasteryRecord = computeConceptMastery(
    activeConcept,
    LocalPersistenceService.getAttempts(),
    LocalPersistenceService.getActivities(),
    !!manualFlags[activeConcept.id]
  );

  const handleToggleManualReview = () => {
    const nextState = LocalPersistenceService.toggleManualReviewFlag(activeConcept.id);
    setManualFlags((prev) => ({ ...prev, [activeConcept.id]: nextState }));
  };

  useEffect(() => {
    if (activeConcept) {
      LocalPersistenceService.recordActivity({
        target_id: activeConcept.id,
        activity_type: 'concept_view',
        description: `Viewed concept ${activeConcept.title} (${activeConcept.id})`,
      });
    }
  }, [activeConcept]);

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) : null;

  const handleSelectModule = (modId: string | null) => {
    setSelectedModuleId(modId);
    if (modId) {
      const modConcepts = getConceptsByModule(modId);
      if (modConcepts.length > 0) {
        setSelectedConceptId(modConcepts[0].id);
      }
    }
  };

  return (
    <div className="concept-view">
      {/* Return to Practice Banner if originated from exercise */}
      {returnTo === 'practice' && (
        <div
          style={{
            background: 'var(--primary-light)',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
            Active practice session in progress (Context preserved)
          </span>
          <button
            className="btn-primary btn-sm"
            onClick={() => onNavigate('practice')}
          >
            &larr; Return to Exercise EX-000001
          </button>
        </div>
      )}

      {/* Main Two-Column Drawer Layout */}
      <div className="drawer-layout">
        {/* Scoped Module Navigation Drawer */}
        <ModuleNavDrawer
          isOpen={isDrawerOpen}
          onToggle={() => setIsDrawerOpen((prev) => !prev)}
          selectedModuleId={selectedModuleId}
          onSelectModule={handleSelectModule}
          title="Concept Atlas"
          subtitle="Curriculum Index"
          onNavigate={onNavigate}
        />

        {/* Main Content Area */}
        <div className="drawer-layout-content">
          {/* Active Filter Bar if filtered by module */}
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
                Filtered by <strong>{selectedModule?.id}: {selectedModule?.title}</strong> ({visibleConcepts.length} concepts)
              </div>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setSelectedModuleId(null)}
              >
                ✕ Clear Filter (Browse All)
              </button>
            </div>
          )}

          {visibleConcepts.length > 0 ? (
            <div>
              {/* Concept Selector Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem',
                }}
                role="tablist"
                aria-label="Concepts in this section"
              >
                {visibleConcepts.map((concept) => {
                  const isSelected = concept.id === activeConcept.id;
                  return (
                    <button
                      key={concept.id}
                      role="tab"
                      aria-selected={isSelected}
                      className={`pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedConceptId(concept.id)}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{concept.id}</span>
                      <span>{concept.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Concept Details Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="tag-label">
                    Concept Atlas &bull; {activeConcept.moduleId} &bull; {activeConcept.id}
                  </span>
                  <h1 className="card-title" style={{ marginTop: '0.25rem' }}>{activeConcept.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Mastery Lifecycle Badge */}
                  <span
                    className="badge"
                    style={{
                      background:
                        activeMastery.status === 'secure'
                          ? '#dcfce7'
                          : activeMastery.status === 'review_due'
                          ? '#fef3c7'
                          : activeMastery.status === 'practising'
                          ? '#dbeafe'
                          : activeMastery.status === 'exploring'
                          ? '#ede9fe'
                          : '#f1f5f9',
                      color:
                        activeMastery.status === 'secure'
                          ? '#15803d'
                          : activeMastery.status === 'review_due'
                          ? '#b45309'
                          : activeMastery.status === 'practising'
                          ? '#1d4ed8'
                          : activeMastery.status === 'exploring'
                          ? '#6d28d9'
                          : '#64748b',
                      fontWeight: 600,
                      padding: '3px 8px',
                    }}
                  >
                    {activeMastery.status === 'secure' && 'Secure ✓'}
                    {activeMastery.status === 'review_due' && 'Review Due ⏰'}
                    {activeMastery.status === 'practising' && 'Practising'}
                    {activeMastery.status === 'exploring' && 'Exploring'}
                    {activeMastery.status === 'unseen' && 'Unseen'}
                  </span>

                  {/* Manual Mark for Review Button (A-002 §8.1) */}
                  <button
                    onClick={handleToggleManualReview}
                    className="btn-secondary btn-sm"
                    style={{
                      background: activeMastery.isManualReviewFlagged ? '#fef3c7' : '#ffffff',
                      borderColor: activeMastery.isManualReviewFlagged ? '#fcd34d' : '#cbd5e1',
                      color: activeMastery.isManualReviewFlagged ? '#b45309' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                    }}
                    title={activeMastery.isManualReviewFlagged ? 'Click to unflag from review list' : 'Click to flag for revision (A-002 §8.1)'}
                  >
                    {activeMastery.isManualReviewFlagged ? '🔖 Flagged for Review' : '🔖 Mark for Review'}
                  </button>

                  <span className="badge badge-source">
                    Source Derived &bull; {activeConcept.sourceRef.part}
                  </span>
                </div>
              </div>

              {/* Revision Banner if review is due */}
              {activeMastery.reasonsForReview.length > 0 && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>⏰</span>
                  <span>
                    <strong>Spaced Revision Notice:</strong> {activeMastery.reasonsForReview.join(' • ')}
                    {activeMastery.nextReviewDate && ` (Interval: ${activeMastery.currentIntervalDays}d)`}
                  </span>
                </div>
              )}

              {/* Intuition Section */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  INTUITIVE EXPLANATION
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {activeConcept.intuition}
                </p>
              </div>

              {/* Formal Mathematical Definition */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  FORMAL MATHEMATICAL DEFINITION
                </h3>
                <p style={{ fontSize: '1rem', marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                  {activeConcept.formalDefinition}
                </p>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <MathView math={activeConcept.formalDefinitionLatex} block />
                </div>
              </div>

              {/* Key Properties & Theorems */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  KEY PROPERTIES & THEOREMS
                </h3>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {activeConcept.properties.map((prop, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem' }}>{prop}</li>
                  ))}
                </ul>
              </div>

              {/* Connected Learning Actions */}
              {(() => {
                const connectedExercises = getExercisesByConcept(activeConcept.id);
                const targetExId = connectedExercises.length > 0 ? connectedExercises[0].id : 'EX-000001';
                const associatedLab = MODULE_TO_LAB[activeConcept.moduleId];

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: associatedLab ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--primary-light)', borderColor: '#bfdbfe' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                          ✍️ Practice Gym
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Solve problems directly testing {activeConcept.title}.
                        </div>
                      </div>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => onNavigate('practice', { exerciseId: targetExId })}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Start Exercise ({targetExId}) &rarr;
                      </button>
                    </div>

                    {associatedLab && (
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', background: '#faf5ff', borderColor: '#e9d5ff' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.95rem' }}>
                            🧪 Probability Playground
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6b21a8', marginTop: '4px' }}>
                            Explore interactively in {associatedLab.labTitle}.
                          </div>
                        </div>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => onNavigate('playground', { labId: associatedLab.labId })}
                          style={{ alignSelf: 'flex-start', background: '#ffffff', borderColor: '#d8b4fe', color: '#7c3aed', fontWeight: 600 }}
                        >
                          Launch {associatedLab.labId} &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Source Citation & Traceability */}
              <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Source Attribution & Traceability
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
                  <div><strong>Tutorial Transcript:</strong> <code>{activeConcept.sourceRef.transcript_file}</code></div>
                  <div><strong>Section:</strong> {activeConcept.sourceRef.chapter} ({activeConcept.sourceRef.id})</div>
                  <div><strong>Note:</strong> {activeConcept.sourceRef.note}</div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected module is not yet authored */
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <span className="badge badge-source" style={{ marginBottom: '1rem' }}>
                {selectedModule?.id} &bull; {selectedModule?.partId}
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedModule?.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                {selectedModule?.summary}
              </p>
              <div className="alert alert-warning" style={{ maxWidth: '480px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
                <strong>Curriculum Roadmap Note:</strong> This module is scheduled for authoring in upcoming increments. Module selection does not gate access to other curriculum material.
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={() => handleSelectModule('M01')}
              >
                Go to Active Module M01 (Probability Foundations)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
