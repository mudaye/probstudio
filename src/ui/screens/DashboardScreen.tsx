import React, { useState, useEffect } from 'react';
import { LocalPersistenceService, StoredAttempt, ActivityEvent } from '../../core/storage/persistence';

interface DashboardScreenProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const refreshHistory = () => {
    setAttempts(LocalPersistenceService.getAttempts());
    setActivities(LocalPersistenceService.getActivities());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleClear = () => {
    if (window.confirm('Reset all prototype local activity and attempt records?')) {
      LocalPersistenceService.clearAll();
      refreshHistory();
    }
  };

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
              <span className="badge badge-supplementary">Deterministic Check</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Practice Gym</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Solve targeted probability exercises with instant exact checking, step-by-step mathematical explanations, and concept cross-links.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('practice', { exerciseId: 'EX-000001' })}
          >
            Enter Practice Gym →
          </button>
        </div>

        {/* Concept Atlas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tag-label">Theory</span>
              <span className="badge badge-source">Source Derived</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Concept Atlas</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Browse formal definitions, mathematical intuition, axioms, and examples mapped directly to tutorial chapters.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('atlas', { conceptId: 'C-000001' })}
          >
            Explore Concept Atlas →
          </button>
        </div>

        {/* Probability Playground */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tag-label">Laboratory</span>
              <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>PL-01 Approved</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>Probability Playground</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Interact with models and set operations in guided laboratory <strong>PL-01 (Event and Probability Builder)</strong> with live exact evaluation.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('playground', { labId: 'PL-01' })}
          >
            Launch Guided Lab PL-01 →
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            LOCAL ACTIVITY & PERSISTENCE RECORD (STAGE 0 VERIFICATION)
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
              No attempts recorded yet in this browser session. Enter Practice Gym or PL-01 to generate activity.
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
