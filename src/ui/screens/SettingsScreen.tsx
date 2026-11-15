import React, { useState, useEffect } from 'react';
import {
  LocalPersistenceService,
  StoredAttempt,
  ActivityEvent,
  LabComparisonSnapshot,
} from '../../core/storage/persistence';

interface SettingsScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, LabComparisonSnapshot>>({});
  const [manualFlags, setManualFlags] = useState<Record<string, boolean>>({});
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [attemptFilter, setAttemptFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const refreshData = () => {
    setAttempts(LocalPersistenceService.getAttempts());
    setActivities(LocalPersistenceService.getActivities());
    setSnapshots(LocalPersistenceService.getAllLabSnapshots());
    setManualFlags(LocalPersistenceService.getManualReviewFlags());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExportAll = () => {
    const jsonStr = LocalPersistenceService.exportLearnerStateJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `probability_studio_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const res = LocalPersistenceService.importLearnerStateJson(text);
        if (res.success) {
          setImportStatus(`Successfully restored ${res.importedSnapshots ?? 0} snapshots and ${res.importedAttempts} exercise attempts!`);
          refreshData();
          setTimeout(() => setImportStatus(null), 5000);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      } catch {
        setImportStatus('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently reset all stored attempts, activity records, manual flags, and laboratory snapshots?')) {
      LocalPersistenceService.clearAll();
      refreshData();
      setImportStatus('All local storage records have been cleared.');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const filteredAttempts = attempts.filter((att) => {
    if (attemptFilter === 'correct') return att.outcome === 'correct';
    if (attemptFilter === 'incorrect') return att.outcome === 'incorrect';
    return true;
  });

  const snapshotCount = Object.keys(snapshots).length;
  const flagCount = Object.keys(manualFlags).length;

  return (
    <div className="settings-view" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="tag-label">System Preferences & Persistence</span>
          <h1 className="card-title" style={{ marginTop: '0.25rem' }}>⚙️ Studio Settings & Data Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Inspect local storage audit logs, export and import portable state backups, and manage offline data.
          </p>
        </div>
        <button
          className="btn-secondary btn-sm"
          onClick={() => onNavigate('dashboard')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {importStatus && (
        <div
          style={{
            background: importStatus.startsWith('Import failed') ? '#fef2f2' : '#f0fdf4',
            color: importStatus.startsWith('Import failed') ? '#991b1b' : '#166534',
            border: `1px solid ${importStatus.startsWith('Import failed') ? '#fecaca' : '#bbf7d0'}`,
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {importStatus}
        </div>
      )}

      {/* Grid: Backup & Storage Management */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Backup & Restore */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💾</span> Portable Backup & Restore (JSON)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Download an encrypted or portable JSON file containing all exercise attempts, activity streams, manual review flags, and comparison snapshots conforming to A-005/A-007.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportAll}
              className="btn-primary btn-sm"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Export JSON Backup
            </button>
            <label
              className="btn-secondary btn-sm"
              style={{ padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}
            >
              Import JSON File
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Local Storage Overview & Danger Zone */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📊</span> Local Storage Footprint
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', margin: '0.75rem 0 1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Attempts:</span> <strong>{attempts.length}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Activities:</span> <strong>{activities.length}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Lab Snapshots:</span> <strong>{snapshotCount}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Review Flags:</span> <strong>{flagCount}</strong>
            </div>
          </div>
          <button
            onClick={handleClearAll}
            className="btn-secondary btn-sm"
            style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', width: '100%' }}
          >
            🗑️ Reset All Local Records & Cache
          </button>
        </div>
      </div>

      {/* Attempt Audit Log */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Attempt Audit History ({attempts.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic evaluation log with exact rational arithmetic check results
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setAttemptFilter('all')}
              className={`pill ${attemptFilter === 'all' ? 'selected' : ''}`}
              style={{ fontSize: '0.76rem', padding: '4px 10px' }}
            >
              All ({attempts.length})
            </button>
            <button
              onClick={() => setAttemptFilter('correct')}
              className={`pill ${attemptFilter === 'correct' ? 'selected' : ''}`}
              style={{ fontSize: '0.76rem', padding: '4px 10px', color: '#16a34a' }}
            >
              Correct ({attempts.filter((a) => a.outcome === 'correct').length})
            </button>
            <button
              onClick={() => setAttemptFilter('incorrect')}
              className={`pill ${attemptFilter === 'incorrect' ? 'selected' : ''}`}
              style={{ fontSize: '0.76rem', padding: '4px 10px', color: '#dc2626' }}
            >
              Incorrect ({attempts.filter((a) => a.outcome === 'incorrect').length})
            </button>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            No exercise attempts recorded under this filter.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Exercise</th>
                  <th>Raw Response</th>
                  <th>Outcome</th>
                  <th>Calculation Engine</th>
                  <th>Feedback Summary</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((att) => (
                  <tr key={att.attempt_id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {new Date(att.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => onNavigate('practice', { exerciseId: att.exercise_id })}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        title="Jump to exercise in Practice Gym"
                      >
                        {att.exercise_id}
                      </button>
                    </td>
                    <td><code>{att.raw_response}</code></td>
                    <td>
                      <span className={`badge ${att.outcome === 'correct' ? 'alert-success' : 'alert-error'}`} style={{ padding: '0.15rem 0.5rem' }}>
                        {att.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {att.calculation_id}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>
                      {att.feedback_summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Event Stream */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Activity Audit Stream ({activities.length})
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Chronological event stream tracking concept views, lab interactions, and exercise entries conforming to A-005 §7.
        </p>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            No user activity logged yet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', maxHeight: '280px', overflowY: 'auto' }}>
            {activities.map((act) => (
              <li key={act.event_id} style={{ padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)', background: '#f1f5f9', padding: '1px 6px', borderRadius: '3px', marginRight: '6px', fontSize: '0.75rem' }}>
                  {act.activity_type}
                </span>
                <span>{act.description}</span>
                <span style={{ float: 'right', color: '#94a3b8', fontSize: '0.78rem' }}>
                  {new Date(act.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Architecture & Specifications Metadata */}
      <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
          System Standards & Attribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div><strong>Application:</strong> Probability Revision Studio v0.1.0</div>
          <div><strong>Curriculum Series:</strong> NPTEL Review of Basic Probability (Parts 1–3)</div>
          <div><strong>Data Specification:</strong> A-005 Content & Data Model v0.2</div>
          <div><strong>Deterministic Operations:</strong> A-004 Exact Rational Engine v0.2</div>
          <div><strong>Interaction Standard:</strong> A-002 Interaction Specification v0.4</div>
          <div><strong>Playground Standard:</strong> A-003 Laboratory Specification v0.4</div>
        </div>
      </div>
    </div>
  );
};
