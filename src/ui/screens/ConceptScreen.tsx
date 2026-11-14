import React, { useState, useEffect } from 'react';
import {
  ALL_CONCEPTS,
  getConceptById,
  getConceptsByModule,
} from '../../core/content/fixtures';
import { getModuleById } from '../../core/content/modules';
import { MathView } from '../components/MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';
import { ModuleNavDrawer } from '../components/ModuleNavDrawer';

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

  // Load available concepts for the active filter
  const visibleConcepts = selectedModuleId
    ? getConceptsByModule(selectedModuleId)
    : ALL_CONCEPTS;

  const activeConcept = getConceptById(selectedConceptId) || visibleConcepts[0] || ALL_CONCEPTS[0];

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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-source">
                    Source Derived &bull; {activeConcept.sourceRef.part}
                  </span>
                </div>
              </div>

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
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--primary-light)', borderColor: '#bfdbfe' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    Ready to test your understanding?
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Solve problems connected to {activeConcept.title} in the Practice Gym.
                  </div>
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onNavigate('practice', { exerciseId: 'EX-000001' })}
                >
                  Go to Practice Exercise &rarr;
                </button>
              </div>

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
