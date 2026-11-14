import React, { useState, useEffect } from 'react';
import { CONCEPT_C000001, MODULE_M01 } from '../../core/content/fixtures';
import { getModuleById } from '../../core/content/modules';
import { MathView } from '../components/MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';
import { ModuleNavDrawer } from '../components/ModuleNavDrawer';

interface ConceptScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  returnTo?: string;
  initialModuleId?: string | null;
}

export const ConceptScreen: React.FC<ConceptScreenProps> = ({
  onNavigate,
  returnTo,
  initialModuleId = null,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: CONCEPT_C000001.id,
      activity_type: 'concept_view',
      description: `Viewed concept ${CONCEPT_C000001.title} (${CONCEPT_C000001.id})`,
    });
  }, []);

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) : null;

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
          onSelectModule={(id) => setSelectedModuleId(id)}
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
                Filtered by <strong>{selectedModule?.id}: {selectedModule?.title}</strong>
              </div>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setSelectedModuleId(null)}
              >
                ✕ Clear Filter (Browse All)
              </button>
            </div>
          )}

          {/* If selected module is M01 or All: Show M01 Concept */}
          {(!selectedModuleId || selectedModuleId === 'M01') ? (
            <div>
              {/* Concept Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="tag-label">Concept Atlas &bull; {MODULE_M01.id} {MODULE_M01.title}</span>
                  <h1 className="card-title" style={{ marginTop: '0.25rem' }}>{CONCEPT_C000001.title}</h1>
                </div>
                <span className="badge badge-source">
                  Source Derived &bull; {CONCEPT_C000001.sourceRef.part}
                </span>
              </div>

              {/* Intuition Section */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  INTUITIVE EXPLANATION
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {CONCEPT_C000001.intuition}
                </p>
              </div>

              {/* Formal Definition */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  FORMAL MATHEMATICAL DEFINITION
                </h3>
                <p style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                  {CONCEPT_C000001.formalDefinition}
                </p>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <MathView math={CONCEPT_C000001.formalDefinitionLatex} block />
                </div>
              </div>

              {/* Properties of Events */}
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  KEY PROPERTIES & EVENT OPERATIONS
                </h3>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {CONCEPT_C000001.properties.map((prop, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{prop}</li>
                  ))}
                </ul>
              </div>

              {/* Source Citation & Traceability */}
              <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Source Attribution & Traceability
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
                  <div><strong>Tutorial Transcript:</strong> <code>{CONCEPT_C000001.sourceRef.transcript_file}</code></div>
                  <div><strong>Section:</strong> {CONCEPT_C000001.sourceRef.chapter} ({CONCEPT_C000001.sourceRef.id})</div>
                  <div><strong>Note:</strong> {CONCEPT_C000001.sourceRef.note}</div>
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
                onClick={() => setSelectedModuleId('M01')}
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
