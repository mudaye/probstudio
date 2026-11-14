import React, { useState } from 'react';
import { ErrorCode } from '../../core/math/types';
import { getErrorMeta } from '../../core/math/errors';
import { LabComparisonSnapshot } from '../../core/storage/persistence';

export interface LabShellProps {
  labId: string;
  labTitle: string;
  labSubtitle?: string;
  sourceAttribution?: {
    part: string;
    chapter: string;
    isIllustrative?: boolean;
  };
  linkedModuleIds?: readonly string[];
  linkedConceptIds?: readonly string[];

  // Stale result & error state
  isStale?: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;

  // Normalization repair state
  repairEligible?: boolean;
  repairPreview?: readonly { label: string; oldVal: string; newVal: string }[];
  onApplyRepair?: () => void;

  // Snapshot Bar
  snapshotName: string;
  onSnapshotNameChange: (name: string) => void;
  savedSnapshot?: LabComparisonSnapshot | null;
  onSaveSnapshot?: (includeSim?: boolean) => void;
  onRestoreSnapshot?: () => void;
  onDeleteSnapshot?: () => void;
  renderSnapshotComparison?: (saved: LabComparisonSnapshot) => React.ReactNode;

  // Reset
  onReset?: () => void;
  resetConfirmationMessage?: string;

  // Navigation
  onNavigate?: (route: string, params?: Record<string, string>) => void;

  // Child content
  children: React.ReactNode;
}

export const LabShell: React.FC<LabShellProps> = ({
  labId,
  labTitle,
  labSubtitle,
  sourceAttribution,
  linkedModuleIds = [],
  linkedConceptIds = [],
  isStale = false,
  errorCode,
  errorMessage,
  repairEligible = false,
  repairPreview = [],
  onApplyRepair,
  snapshotName,
  onSnapshotNameChange,
  savedSnapshot,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  renderSnapshotComparison,
  onReset,
  resetConfirmationMessage = 'Are you sure you want to reset settings to documented defaults? This will clear un-snapshotted active settings.',
  onNavigate,
  children,
}) => {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [includeSimInSnapshot, setIncludeSimInSnapshot] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const errorMeta = errorCode ? getErrorMeta(errorCode) : null;

  const handleSaveClick = () => {
    if (!onSaveSnapshot) return;
    if (savedSnapshot) {
      const confirmReplace = window.confirm(
        `A saved comparison snapshot "${savedSnapshot.name}" already exists. Do you want to replace it?`
      );
      if (!confirmReplace) return;
    }
    onSaveSnapshot(includeSimInSnapshot);
  };

  const handleRestoreClick = () => {
    if (!onRestoreSnapshot || !savedSnapshot) return;
    const confirmRestore = window.confirm(
      `Restore snapshot "${savedSnapshot.name}"? Active edits will be overwritten.`
    );
    if (confirmRestore) {
      onRestoreSnapshot();
    }
  };

  const handleDeleteClick = () => {
    if (!onDeleteSnapshot || !savedSnapshot) return;
    const confirmDel = window.confirm(
      `Delete saved comparison snapshot "${savedSnapshot.name}"? This action cannot be undone.`
    );
    if (confirmDel) {
      onDeleteSnapshot();
    }
  };

  const handleResetClick = () => {
    if (!onReset) return;
    setShowResetConfirm(true);
  };

  const confirmResetAction = () => {
    setShowResetConfirm(false);
    if (onReset) onReset();
  };

  return (
    <div className="lab-shell" style={{ marginBottom: '2rem' }}>
      {/* Top Universal Lab Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                }}
              >
                {labId}
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                {labTitle}
              </h1>
            </div>
            {labSubtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)' }}>
                {labSubtitle}
              </p>
            )}
          </div>

          {/* Source Attribution & Illustrative Label */}
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            {sourceAttribution?.isIllustrative ? (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginBottom: '4px',
                }}
              >
                Illustrative Setup
              </span>
            ) : (
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginBottom: '4px',
                }}
              >
                Source Derived
              </span>
            )}
            {sourceAttribution && (
              <div>
                {sourceAttribution.part} &bull; {sourceAttribution.chapter}
              </div>
            )}
          </div>
        </div>

        {/* Standard Laboratory Interaction Cycle Pill Bar (A-002 / A-003) */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#64748b',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard Cycle:</span>
          {['1. Orient', '2. Set Up', '3. Explore', '4. Explain', '5. Compare', '6. Simulate', '7. Reset'].map((step, idx) => (
            <React.Fragment key={step}>
              {idx > 0 && <span style={{ color: '#cbd5e1' }}>&rarr;</span>}
              <span
                style={{
                  padding: '2px 6px',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                {step}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Contextual Curriculum Discovery Cross-Links (A-003 §2.5) */}
        {(linkedModuleIds.length > 0 || linkedConceptIds.length > 0) && (
          <div
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 600, color: '#475569' }}>Curriculum Links:</span>
            {linkedModuleIds.map((modId) => (
              <button
                key={modId}
                onClick={() => onNavigate && onNavigate('atlas', { moduleId: modId })}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Module {modId} &rarr;
              </button>
            ))}
            {linkedConceptIds.map((cId) => (
              <button
                key={cId}
                onClick={() => onNavigate && onNavigate('atlas', { conceptId: cId })}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Concept {cId} &rarr;
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot & Session Controls Bar (A-003 §2.2) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            Snapshot Name:
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => onSnapshotNameChange(e.target.value)}
              placeholder="e.g. Fair Model / Custom Boundary"
              style={{
                marginLeft: '6px',
                padding: '4px 8px',
                fontSize: '0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                width: '210px',
              }}
            />
          </label>

          <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={includeSimInSnapshot}
              onChange={(e) => setIncludeSimInSnapshot(e.target.checked)}
            />
            Include last simulation
          </label>

          <button
            onClick={handleSaveClick}
            disabled={!onSaveSnapshot || !snapshotName.trim()}
            style={{
              padding: '4px 10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: snapshotName.trim() ? 'pointer' : 'not-allowed',
              opacity: snapshotName.trim() ? 1 : 0.6,
            }}
          >
            📸 Save Snapshot
          </button>
        </div>

        {/* Saved Snapshot Status & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {savedSnapshot ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '3px 8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: 600 }}>
                Saved: "{savedSnapshot.name}"
              </span>
              {renderSnapshotComparison && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.78rem',
                    background: '#9333ea',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Side-by-Side Compare
                </button>
              )}
              {onRestoreSnapshot && (
                <button
                  onClick={handleRestoreClick}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.78rem',
                    background: '#ffffff',
                    color: '#6b21a8',
                    border: '1px solid #d8b4fe',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Restore saved snapshot to active view"
                >
                  Restore
                </button>
              )}
              {onDeleteSnapshot && (
                <button
                  onClick={handleDeleteClick}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.78rem',
                    background: 'transparent',
                    color: '#dc2626',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Delete saved snapshot"
                >
                  &times;
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              (No comparison snapshot saved)
            </span>
          )}

          {/* Reset Action */}
          {onReset && (
            <button
              onClick={handleResetClick}
              style={{
                padding: '4px 10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Reset laboratory to documented defaults"
            >
              ↺ Reset Defaults
            </button>
          )}
        </div>
      </div>

      {/* Normative Stale Result Callout Banner (A-003 §2.1 & A-004 §3.3) */}
      {isStale && (
        <div
          role="alert"
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderLeft: '4px solid #f59e0b',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>
                Stale result — displaying calculations from the last valid configuration
              </div>
              <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                {errorMessage || 'Current input values are incomplete or outside their admissible domain.'}
              </div>
            </div>
          </div>
          {errorCode && errorMeta && (
            <span
              style={{
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                color: '#78350f',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              title={errorMeta.description}
            >
              [{errorCode}] {errorMeta.title}
            </span>
          )}
        </div>
      )}

      {/* Normalization Repair Banner (A-003 §2.1 & A-004 §3.4) */}
      {repairEligible && onApplyRepair && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #16a34a',
            padding: '0.85rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                🔧 Repair Available: Normalize Masses
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#15803d' }}>
                All entered values are non-negative and their total is positive, but does not sum to 1. You can normalize by dividing each mass by the total.
              </p>
            </div>
            <button
              onClick={onApplyRepair}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Apply Repair &rarr;
            </button>
          </div>

          {repairPreview.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #dcfce7', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#14532d' }}>
              <strong>Preview: </strong>
              {repairPreview.map((p, idx) => (
                <span key={idx} style={{ marginRight: '10px' }}>
                  {p.label}: <code>{p.oldVal}</code> &rarr; <strong>{p.newVal}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              maxWidth: '460px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Confirm Laboratory Reset
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
              {resetConfirmationMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetAction}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && savedSnapshot && renderSnapshotComparison && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                Side-by-Side Comparison: Active vs. "{savedSnapshot.name}"
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                &times;
              </button>
            </div>

            {renderSnapshotComparison(savedSnapshot)}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowCompareModal(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Lab Body */}
      {children}
    </div>
  );
};
