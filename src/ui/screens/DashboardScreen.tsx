import React, { useState, useEffect } from 'react';
import {
  LocalPersistenceService,
  StoredAttempt,
  ActivityEvent,
  LabComparisonSnapshot,
  ALL_SUPPORTED_LAB_IDS,
} from '../../core/storage/persistence';

interface DashboardScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

const LAB_TITLES: Record<string, string> = {
  'PL-01': 'Event & Probability Builder',
  'PL-02': 'Conditional & Bayes Lab',
  'PL-03': 'Independence Laboratory',
  'PL-04': 'Random Variable Mapper',
  'PL-05': 'CDF & PMF Explorer',
  'PL-06': 'Distribution Explorer',
  'PL-07': 'Continuous Explorer',
  'PL-08': 'Transform & Moments',
  'PL-09': 'Joint & Marginals',
  'PL-10': 'Conditionals, Channel & Transforms',
  'PL-11': 'Central Limit Theorem & IID Sums',
  'EXP-BUILDER': 'Custom Experiment Builder',
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, LabComparisonSnapshot>>({});

  const refreshHistory = () => {
    setAttempts(LocalPersistenceService.getAttempts());
    setActivities(LocalPersistenceService.getActivities());
    setSnapshots(LocalPersistenceService.getAllLabSnapshots());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleClear = () => {
    if (window.confirm('Reset all prototype local activity, snapshots, and attempt records?')) {
      LocalPersistenceService.clearAll();
      refreshHistory();
    }
  };

  const snapshotEntries = Object.entries(snapshots);

  return (
    <div className="dashboard-view">
      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <h1 className="card-title">Welcome to Probability Revision Studio</h1>
        <p className="card-subtitle" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
          A self-paced, browser-based environment for understanding, practising, and experimenting with probability.
        </p>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1.5rem 0 1rem', color: 'var(--text-muted)' }}>
        THREE CO-EQUAL ENVIRONMENTS
      </h2>

      <div className="grid-cols-3">
        {/* Practice Gym */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tag-label">Practice</span>
              <span className="badge badge-supplementary">31 Exercises Active</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Practice Gym</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Solve targeted probability exercises across Parts 1, 2, and 3 with instant exact checking, step-by-step mathematical explanations, and concept cross-links.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('practice', { exerciseId: 'EX-000001' })}
          >
            Enter Practice Gym &rarr;
          </button>
        </div>

        {/* Concept Atlas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tag-label">Theory</span>
              <span className="badge badge-source">44 Concepts / 22 Modules</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Concept Atlas</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Browse formal definitions, mathematical intuition, axioms, and examples mapped directly to tutorial chapters across Parts 1, 2, and 3.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('atlas', { conceptId: 'C-000001' })}
          >
            Explore Concept Atlas &rarr;
          </button>
        </div>

        {/* Probability Playground */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tag-label">Laboratory</span>
              <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>11 Labs + Builder</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Probability Playground</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Interact with models, distributions, continuous transforms, joints, and Central Limit Theorem in <strong>11 guided laboratories</strong> or author custom sample spaces in the <strong>Experiment Builder</strong>.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('playground', { labId: 'PL-01' })}
          >
            Launch Playground Labs &rarr;
          </button>
        </div>
      </div>

      {/* Saved Snapshots & Quick Lab Access Hub */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem' }}>
          SAVED LABORATORY SNAPSHOTS & QUICK ACCESS
        </h2>

        {snapshotEntries.length > 0 ? (
          <div className="card" style={{ marginBottom: '1.5rem', background: '#faf5ff', borderColor: '#e9d5ff' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.75rem' }}>
              Saved Comparison Snapshots ({snapshotEntries.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {snapshotEntries.map(([labId, snap]) => (
                <div
                  key={labId}
                  style={{
                    background: '#ffffff',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #d8b4fe',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '2px 6px', borderRadius: '3px' }}>
                        {labId}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{snap.timestamp.split(',')[0]}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginTop: '4px' }}>
                      {snap.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {LAB_TITLES[labId] || labId}
                    </div>
                  </div>
                  <button
                    className="btn-secondary btn-sm"
                    style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#7c3aed', borderColor: '#d8b4fe' }}
                    onClick={() => onNavigate('playground', { labId })}
                  >
                    Open Snapshot in Lab &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              No comparison snapshots saved yet. In any laboratory, name and save a comparison snapshot to keep benchmarks handy here.
            </p>
          </div>
        )}

        {/* Quick Launch Pills for All 11 Labs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {ALL_SUPPORTED_LAB_IDS.map((lid) => (
            <button
              key={lid}
              onClick={() => onNavigate('playground', { labId: lid })}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              {lid}: {LAB_TITLES[lid] || lid}
            </button>
          ))}
        </div>
      </div>

      {/* Local Activity and Verification Stream */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            LOCAL ACTIVITY & PERSISTENCE RECORD
          </h2>
          {activities.length > 0 && (
            <button className="btn-secondary btn-sm" onClick={handleClear}>
              Reset Local Storage
            </button>
          )}
        </div>

        <div className="card">
          {attempts.length === 0 && activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No attempts recorded yet in this browser session. Enter Practice Gym or any Guided Lab to generate activity.
            </p>
          ) : (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Recent Attempts ({attempts.length})
              </h4>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Response</th>
                    <th>Outcome</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((att) => (
                    <tr key={att.attempt_id}>
                      <td><strong>{att.exercise_id}</strong></td>
                      <td><code>{att.raw_response}</code></td>
                      <td>
                        <span className={`badge ${att.outcome === 'correct' ? 'alert-success' : 'alert-error'}`} style={{ padding: '0.15rem 0.5rem' }}>
                          {att.outcome.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(att.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                Activity Stream ({activities.length})
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activities.slice(0, 5).map((act) => (
                  <li key={act.event_id} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>[{act.activity_type}]</span> {act.description}
                    <span style={{ float: 'right', color: '#94a3b8' }}>{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
