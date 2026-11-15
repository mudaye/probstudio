import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'progression' | 'mastery' | 'contextual'>('progression');

  if (!isOpen) return null;

  const handleActionClick = (route: string, params?: Record<string, string>) => {
    onClose();
    if (onNavigate) {
      onNavigate(route, params);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📖</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                ProbStudio Learner Guide & Progression
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Self-paced probability theory, deterministic problem-solving, and laboratory exploration.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            title="Close Guide"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 1.5rem',
            background: '#ffffff',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('progression')}
            style={{
              padding: '10px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'progression' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'progression' ? '#1d4ed8' : '#64748b',
              cursor: 'pointer',
            }}
          >
            🗺️ Suggested Progression
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            style={{
              padding: '10px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'mastery' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'mastery' ? '#1d4ed8' : '#64748b',
              cursor: 'pointer',
            }}
          >
            📈 Mastery & Revision Rules
          </button>
          <button
            onClick={() => setActiveTab('contextual')}
            style={{
              padding: '10px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'contextual' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'contextual' ? '#1d4ed8' : '#64748b',
              cursor: 'pointer',
            }}
          >
            💡 Context Guide ({currentRoute})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
          {/* TAB 1: PROGRESSION */}
          {activeTab === 'progression' && (
            <div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>The Non-Gating Learning Cycle</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#1e3a8a' }}>
                  ProbStudio never locks or gates content. You may freely navigate to any module, exercise, or laboratory at any time. For optimal retention, we recommend following the <strong>Theory &rarr; Practice &rarr; Laboratory</strong> cycle.
                </p>
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Recommended 4-Phase Curriculum Progression:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a' }}>Phase 1: Foundations & Axioms (Modules M01–M04)</strong>
                    <span className="badge badge-source">Part 1</span>
                  </div>
                  <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#64748b' }}>
                    Sample spaces, Kolmogorov axioms, conditional probability, Bayes' theorem, and event independence.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                    Recommended Labs: <strong>PL-01 (Venn Workbench)</strong> &bull; <strong>PL-02 (Conditional & Bayes)</strong> &bull; <strong>PL-03 (Independence)</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a' }}>Phase 2: Discrete Random Variables (Modules M05–M08)</strong>
                    <span className="badge badge-source">Part 1</span>
                  </div>
                  <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#64748b' }}>
                    Random variables as functions X: &Omega; &rarr; &#8477;, cumulative distribution functions (CDFs), PMFs, Bernoulli, Binomial, Geometric, and Poisson models.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                    Recommended Labs: <strong>PL-04 (RV Mapper)</strong> &bull; <strong>PL-05 (CDF/PMF Explorer)</strong> &bull; <strong>PL-06 (Distribution Explorer)</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a' }}>Phase 3: Continuous Variables & Moments (Modules M09–M15)</strong>
                    <span className="badge badge-source">Part 2</span>
                  </div>
                  <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#64748b' }}>
                    PDF integration, Uniform/Exponential/Gaussian distributions, nonlinear transforms $Y = g(X)$, expectation, variance, Markov/Chebyshev inequalities, and Monte Carlo simulation.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                    Recommended Labs: <strong>PL-07 (Continuous Explorer)</strong> &bull; <strong>PL-08 (Transform & Moments)</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a' }}>Phase 4: Multivariate, Joints & Limit Theorems (Modules M16–M22)</strong>
                    <span className="badge badge-source">Part 3</span>
                  </div>
                  <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#64748b' }}>
                    Joint distributions, marginals, continuous conditional densities, noisy binary channels, 2D Jacobian transformations, and Central Limit Theorem.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                    Recommended Labs: <strong>PL-09 (Joint & Marginals)</strong> &bull; <strong>PL-10 (Conditionals & Channels)</strong> &bull; <strong>PL-11 (CLT)</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleActionClick('atlas', { conceptId: 'C-000001' })}
                >
                  Start Phase 1 in Concept Atlas &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MASTERY & REVISION */}
          {activeTab === 'mastery' && (
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                The 4-Tier Concept Mastery Lifecycle
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', minWidth: '85px', textAlign: 'center' }}>Unseen</span>
                  <span style={{ fontSize: '0.85rem' }}>Concept has not yet been viewed in the Atlas or attempted in the Gym.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', minWidth: '85px', textAlign: 'center' }}>Exploring</span>
                  <span style={{ fontSize: '0.85rem' }}>Viewed in Concept Atlas or loaded in a Guided Lab, but 0 exercises attempted yet.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8', minWidth: '85px', textAlign: 'center' }}>Practising</span>
                  <span style={{ fontSize: '0.85rem' }}>At least 1 exercise attempted, actively developing retrieval accuracy.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="badge" style={{ background: '#dcfce7', color: '#15803d', minWidth: '85px', textAlign: 'center' }}>Secure ✓</span>
                  <span style={{ fontSize: '0.85rem' }}>Rigorous retention confirmed conforming to A-001/A-002 requirements.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="badge" style={{ background: '#fef3c7', color: '#b45309', minWidth: '85px', textAlign: 'center' }}>Review Due ⏰</span>
                  <span style={{ fontSize: '0.85rem' }}>Scheduled review interval has elapsed, a recent error occurred, or manually flagged.</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>How to Unlock "Secure ✓" Status (A-001 §2.3 / A-002 §8.2)</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                  <li><strong>&ge; 3 correct attempts:</strong> Solved without consulting the final answer.</li>
                  <li><strong>&ge; 2 distinct calendar days:</strong> Cramming in a single session does not count; spaced retrieval is required.</li>
                  <li><strong>Unassisted rule:</strong> Hint-supported answers build familiarity, but only unassisted correct answers advance toward Secure.</li>
                </ul>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem' }}>
                <strong style={{ color: '#92400e', fontSize: '0.92rem' }}>Spaced Repetition Ladder (Leitner Intervals)</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78350f' }}>
                  After securing a concept, it is scheduled for revision across increasing intervals: <strong>1 day &rarr; 3 days &rarr; 7 days &rarr; 14 days &rarr; 30 days</strong>. If an error occurs, the interval drops back to 1 day for reinforcement.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CONTEXTUAL HELP */}
          {activeTab === 'contextual' && (
            <div>
              {currentRoute === 'dashboard' && (
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Dashboard Overview & Navigation
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                    The Dashboard provides a consolidated view of your learning progress, spaced revision schedule, and saved lab benchmarks.
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>Curriculum Mastery Bar:</strong> Tracks overall concept retention across all 22 modules.</li>
                    <li><strong>Spaced Revision Queue:</strong> Surfaces concepts due for review with 1-click action buttons.</li>
                    <li><strong>Saved Snapshots:</strong> Quick-load presets saved during laboratory sessions for side-by-side comparison.</li>
                  </ul>
                </div>
              )}

              {currentRoute === 'atlas' && (
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Concept Atlas Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>Sidebar Navigation:</strong> Filter concepts by Part (P1, P2, P3) or specific module (M01–M22).</li>
                    <li><strong>Formal vs Intuitive:</strong> Every concept includes both an accessible plain-language intuition and formal LaTeX definition.</li>
                    <li><strong>🔖 Mark for Review:</strong> Use this button to manually add any concept to your Dashboard review queue whenever you feel you need extra practice.</li>
                  </ul>
                </div>
              )}

              {currentRoute === 'practice' && (
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Practice Gym Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>Exact Arithmetic Input:</strong> Enter exact rational numbers like <code>1/4</code>, <code>3/8</code>, or decimals like <code>0.25</code>. All answers are evaluated with 100% deterministic mathematical precision.</li>
                    <li><strong>Review Due Only Filter:</strong> Toggle this top-bar filter to practice only exercises linked to concepts currently due for spaced revision.</li>
                    <li><strong>Self-Assessment:</strong> After checking an answer, select your confidence level to automatically record retention feedback.</li>
                  </ul>
                </div>
              )}

              {currentRoute === 'playground' && (
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Probability Playground Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>7-Step Lab Cycle:</strong> <em>Orient &rarr; Set up &rarr; Explore &rarr; Explain &rarr; Compare &rarr; Simulate &rarr; Reset</em> provides a structured scientific workflow.</li>
                    <li><strong>Snapshot Drawer:</strong> Name and save snapshots to freeze theoretical outputs and compare them against new parameter sweeps.</li>
                    <li><strong>Normalization Repair:</strong> If event masses or probability densities do not sum to 1, click "Auto-Normalize" to repair the distribution.</li>
                  </ul>
                </div>
              )}

              {currentRoute === 'settings' && (
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Settings & Persistence Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                    <li><strong>JSON Export:</strong> Creates a complete offline backup of your attempts, activity logs, manual flags, and saved laboratory snapshots.</li>
                    <li><strong>Attempt Audit:</strong> Review all past submissions, outcomes, and mathematical check summaries.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            ProbStudio &bull; Grounded in NPTEL Review of Basic Probability
          </span>
          <button
            onClick={onClose}
            className="btn-secondary btn-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
