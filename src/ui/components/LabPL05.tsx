import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToDecimal,
  rationalToLatex,
  Rational,
} from '../../core/math/rational';
import {
  createDiscreteDistribution,
  calculateIntervalProbability,
  DiscreteDistribution,
} from '../../core/math/distribution';
import { MathView } from './MathView';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

export type LabPL05View = 'both' | 'pmf' | 'cdf';

interface LabPL05Props {
  onNavigate?: (route: string, params?: Record<string, string>) => void;
  initialPreset?: string;
}

export const LabPL05: React.FC<LabPL05Props> = ({ onNavigate }) => {
  // Support points and string mass inputs for editing
  const [supportRows, setSupportRows] = useState<{ x: string; mass: string }[]>([
    { x: '0', mass: '1/4' },
    { x: '1', mass: '1/2' },
    { x: '2', mass: '1/4' },
  ]);

  // Interval query bounds
  const [boundA, setBoundA] = useState<string>('0');
  const [boundB, setBoundB] = useState<string>('1');
  const [includeLeft, setIncludeLeft] = useState<boolean>(true);
  const [includeRight, setIncludeRight] = useState<boolean>(true);

  const [activeView, setActiveView] = useState<LabPL05View>('both');
  
  const [snapshotName, setSnapshotName] = useState<string>('Baseline CDF/PMF Setup');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() =>
    LocalPersistenceService.getLabSnapshot('PL-05')
  );

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-05',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-05: CDF and PMF Explorer',
    });
  }, []);

  // Parse and validate distribution
  const parsedDistResult = useMemo(() => {
    const rawSupport: { x: number; mass: Rational }[] = [];

    for (let i = 0; i < supportRows.length; i++) {
      const row = supportRows[i];
      const xNum = Number(row.x);
      if (!Number.isFinite(xNum)) {
        return {
          valid: false,
          error: `Support point #${i + 1} value "${row.x}" is not a finite number.`,
          dist: null,
        };
      }

      const p = parseRational(row.mass);
      if (!p) {
        return {
          valid: false,
          error: `Support point at x=${xNum} mass "${row.mass}" is not a valid rational or decimal.`,
          dist: null,
        };
      }

      rawSupport.push({ x: xNum, mass: p });
    }

    const res = createDiscreteDistribution(rawSupport);
    if (res.status !== 'valid' || !res.value) {
      return {
        valid: false,
        error: res.message || 'Invalid distribution configuration.',
        dist: null,
      };
    }

    return { valid: true, error: null, dist: res.value };
  }, [supportRows]);

  // Fallback for last valid distribution (Stale Result)
  const [lastValidDist, setLastValidDist] = useState<DiscreteDistribution>(() => {
    const q1 = createRational(1n, 4n);
    const q2 = createRational(1n, 2n);
    const q3 = createRational(1n, 4n);
    return createDiscreteDistribution([
      { x: 0, mass: q1 },
      { x: 1, mass: q2 },
      { x: 2, mass: q3 },
    ]).value!;
  });

  useEffect(() => {
    if (parsedDistResult.valid && parsedDistResult.dist) {
      setLastValidDist(parsedDistResult.dist);
    }
  }, [parsedDistResult]);

  const activeDist = parsedDistResult.valid && parsedDistResult.dist ? parsedDistResult.dist : lastValidDist;
  const isStale = !parsedDistResult.valid;

  // Evaluate interval probability
  const intervalResult = useMemo(() => {
    const a = Number(boundA);
    const b = Number(boundB);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return {
        status: 'invalid_configuration' as const,
        error_code: 'E-BOUNDS-INVALID',
        message: 'Interval bounds a and b must be finite numbers.',
        value: null,
      };
    }

    return calculateIntervalProbability(activeDist, a, b, includeLeft, includeRight);
  }, [activeDist, boundA, boundB, includeLeft, includeRight]);

  const handleRowChange = (index: number, field: 'x' | 'mass', val: string) => {
    setSupportRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddRow = () => {
    const nextX = supportRows.length > 0 ? (Number(supportRows[supportRows.length - 1].x) || 0) + 1 : 0;
    setSupportRows((prev) => [...prev, { x: nextX.toString(), mass: '0' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (supportRows.length <= 1) return;
    setSupportRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Presets
  const applyPresetDefault = () => {
    setSupportRows([
      { x: '0', mass: '1/4' },
      { x: '1', mass: '1/2' },
      { x: '2', mass: '1/4' },
    ]);
    setBoundA('0');
    setBoundB('1');
    setIncludeLeft(true);
    setIncludeRight(true);
  };

  const applyPresetDie = () => {
    setSupportRows([
      { x: '1', mass: '1/6' },
      { x: '2', mass: '1/6' },
      { x: '3', mass: '1/6' },
      { x: '4', mass: '1/6' },
      { x: '5', mass: '1/6' },
      { x: '6', mass: '1/6' },
    ]);
    setBoundA('2');
    setBoundB('5');
    setIncludeLeft(false);
    setIncludeRight(true);
  };

  const applyPresetBinomial = () => {
    setSupportRows([
      { x: '0', mass: '1/8' },
      { x: '1', mass: '3/8' },
      { x: '2', mass: '3/8' },
      { x: '3', mass: '1/8' },
    ]);
    setBoundA('1');
    setBoundB('2');
    setIncludeLeft(true);
    setIncludeRight(false);
  };

  const applyPresetBoundsOrderError = () => {
    applyPresetDefault();
    setBoundA('2');
    setBoundB('1'); // a > b triggers E-BOUNDS-ORDER
  };

  const handleSaveSnapshot = () => {
    const snap: LabComparisonSnapshot = {
      snapshot_id: `PL05-SNAP-${Date.now()}`,
      lab_id: 'PL-05',
      name: snapshotName.trim() || 'CDF/PMF Snapshot',
      timestamp: new Date().toISOString(),
      parameters: {
        supportRows,
        boundA,
        boundB,
        includeLeft,
        includeRight,
        activeView,
      },
      results: {
        isValid: parsedDistResult.valid,
        intervalProbability: intervalResult.value ? rationalToString(intervalResult.value.probability) : undefined,
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const p = savedSnapshot.parameters;
    if (p.supportRows) setSupportRows(p.supportRows);
    if (p.boundA !== undefined) setBoundA(p.boundA);
    if (p.boundB !== undefined) setBoundB(p.boundB);
    if (p.includeLeft !== undefined) setIncludeLeft(p.includeLeft);
    if (p.includeRight !== undefined) setIncludeRight(p.includeRight);
    if (p.activeView) setActiveView(p.activeView as LabPL05View);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-05');
    setSavedSnapshot(null);
  };

  return (
    <LabShell
      labId="PL-05"
      labTitle="CDF and PMF Explorer"
      labSubtitle="How do the jump heights of a right-continuous CDF recover the discrete PMF, and how do interval queries [a, b] relate to CDF differences?"
      sourceAttribution={{
        part: 'Part 1',
        chapter: 'Chapters 6–7: Cumulative distribution functions',
        isIllustrative: true,
      }}
      linkedModuleIds={['M06', 'M07']}
      linkedConceptIds={['C-000009', 'C-000010', 'C-000011', 'C-000012']}
      isStale={!parsedDistResult.valid}
      errorCode={parsedDistResult.valid ? undefined : 'E-PROB-SUM'}
      errorMessage={parsedDistResult.error ?? undefined}
      snapshotName={snapshotName}
      onSnapshotNameChange={setSnapshotName}
      savedSnapshot={savedSnapshot}
      onSaveSnapshot={handleSaveSnapshot}
      onRestoreSnapshot={handleRestoreSnapshot}
      onDeleteSnapshot={handleDeleteSnapshot}
      onReset={applyPresetDefault}
      onNavigate={onNavigate}
      renderSnapshotComparison={(saved) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', background: '#eff6ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#1d4ed8' }}>Active Configuration</h4>
            <div>Support: <code>{`{${supportRows.map((r) => r.x).join(', ')}}`}</code></div>
            <div>Interval: <strong>{includeLeft ? '[' : '('}{boundA}, {boundB}{includeRight ? ']' : ')'}</strong></div>
            <div>P(Interval): <strong>{intervalResult.value ? rationalToString(intervalResult.value.probability) : 'N/A'}</strong></div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Saved: {saved.name}</h4>
            <div>Support: <code>{JSON.stringify(Array.isArray(saved.parameters.supportRows) ? saved.parameters.supportRows.map((r: any) => r.x) : [])}</code></div>
            <div>Interval: <strong>{saved.parameters.includeLeft ? '[' : '('}{String(saved.parameters.boundA)}, {String(saved.parameters.boundB)}{saved.parameters.includeRight ? ']' : ')'}</strong></div>
            <div>P(Interval): <strong>{saved.results?.intervalProbability ?? 'N/A'}</strong></div>
          </div>
        </div>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Presets */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--surface, #ffffff)',
            borderRadius: '8px',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Presets:</span>
          <button
            onClick={applyPresetDefault}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Default &#123;0, 1, 2&#125; (0.25, 0.50, 0.25)
          </button>
          <button
            onClick={applyPresetDie}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Fair 6-Sided Die (1/6 Each)
          </button>
          <button
            onClick={applyPresetBinomial}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Binomial(3, 0.5) Heads Count
          </button>
          <button
            onClick={applyPresetBoundsOrderError}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #f87171',
              background: '#fee2e2',
              color: '#991b1b',
              cursor: 'pointer',
            }}
          >
            Reversed Bounds Error (E-BOUNDS-ORDER)
          </button>
        </div>

      {/* Validation warning */}
      {isStale && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '6px',
            color: '#b45309',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>Distribution Validation Warning:</strong> {parsedDistResult.error}
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              Showing results from the <em>last valid distribution</em> (Stale Result).
            </div>
          </div>
          <button
            onClick={applyPresetDefault}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #d97706',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Restore Default Distribution
          </button>
        </div>
      )}

      {/* Main Grid: Controls (Left) & Visualizations / Queries (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 390px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Support Editor & Interval Query */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Support Points Editor */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
                1. Support Values & PMF Masses
              </h3>
              <button
                onClick={handleAddRow}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                + Add Point
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Support <MathView math="x_k" /></th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Mass <MathView math="P(X=x_k)" /></th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {supportRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="text"
                        value={row.x}
                        onChange={(e) => handleRowChange(idx, 'x', e.target.value)}
                        style={{
                          width: '55px',
                          padding: '2px 4px',
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="text"
                        value={row.mass}
                        onChange={(e) => handleRowChange(idx, 'mass', e.target.value)}
                        style={{
                          width: '65px',
                          padding: '2px 4px',
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        disabled={supportRows.length <= 1}
                        style={{
                          padding: '1px 6px',
                          fontSize: '0.72rem',
                          borderRadius: '3px',
                          border: '1px solid #fca5a5',
                          background: '#fee2e2',
                          color: '#991b1b',
                          cursor: supportRows.length > 1 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interval Probability Query Panel */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
              2. Interval Probability Query
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
              Select interval bounds <MathView math="a" /> and <MathView math="b" />, and choose whether to include or exclude endpoints.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Lower Bound <MathView math="a" />
                </label>
                <input
                  type="text"
                  value={boundA}
                  onChange={(e) => setBoundA(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Upper Bound <MathView math="b" />
                </label>
                <input
                  type="text"
                  value={boundB}
                  onChange={(e) => setBoundB(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    marginTop: '4px',
                  }}
                />
              </div>
            </div>

            {/* Endpoint Convention Toggles */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Endpoint Inclusion:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setIncludeLeft(!includeLeft)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: includeLeft ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: includeLeft ? '#eff6ff' : '#ffffff',
                    color: includeLeft ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Left: {includeLeft ? 'Closed [' : 'Open ('}
                </button>
                <button
                  onClick={() => setIncludeRight(!includeRight)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: includeRight ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: includeRight ? '#eff6ff' : '#ffffff',
                    color: includeRight ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Right: {includeRight ? 'Closed ]' : 'Open )'}
                </button>
              </div>
            </div>

            {/* Snapshot Button */}
            <button
              onClick={handleSaveSnapshot}
              style={{
                marginTop: '4px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 500,
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📸 Save Comparison Snapshot
            </button>
          </div>
        </div>

        {/* Right Column: Visual Displays & Cumulative Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Visual Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* View Selector Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveView('both')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: activeView === 'both' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: activeView === 'both' ? '#eff6ff' : '#ffffff',
                    color: activeView === 'both' ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Both PMF & CDF
                </button>
                <button
                  onClick={() => setActiveView('pmf')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: activeView === 'pmf' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: activeView === 'pmf' ? '#eff6ff' : '#ffffff',
                    color: activeView === 'pmf' ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  PMF Only
                </button>
                <button
                  onClick={() => setActiveView('cdf')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: activeView === 'cdf' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: activeView === 'cdf' ? '#eff6ff' : '#ffffff',
                    color: activeView === 'cdf' ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Staircase CDF Only
                </button>
              </div>

              <span
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#475569',
                }}
              >
                Engine: CAL-CDF-001/002
              </span>
            </div>

            {/* Interval Result Banner */}
            {intervalResult.status === 'valid' && intervalResult.value ? (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                    Interval Probability:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>
                    <MathView
                      math={`P(X \\in ${intervalResult.value.intervalLabel}) = ${rationalToLatex(intervalResult.value.probability)} = ${(rationalToDecimal(intervalResult.value.probability, 4) * 100).toFixed(1)}\\%`}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                    Included support points: &#123;{intervalResult.value.includedPoints.join(', ') || '∅'}&#125;
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#991b1b',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  ⚠️ {intervalResult.error_code}: Invalid Interval Bounds
                </div>
                <div style={{ fontSize: '0.84rem' }}>{intervalResult.message}</div>
              </div>
            )}

            {/* Visual Plots Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: activeView === 'both' ? '1fr 1fr' : '1fr', gap: '20px' }}>
              {/* PMF Bar Chart */}
              {(activeView === 'both' || activeView === 'pmf') && (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e293b' }}>
                    PMF Point Masses <MathView math="p(x)" />
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width="280" height="180" viewBox="0 0 280 180" style={{ maxWidth: '100%', overflow: 'visible' }}>
                      <line x1="20" y1="145" x2="260" y2="145" stroke="#94a3b8" strokeWidth="1.5" />

                      {activeDist.points.map((pt, idx) => {
                        const n = activeDist.points.length;
                        const slotWidth = 220 / n;
                        const xCenter = 30 + idx * slotWidth + slotWidth / 2;
                        const barWidth = Math.min(32, slotWidth * 0.55);
                        const barHeight = Math.max(3, rationalToDecimal(pt.mass) * 120);
                        const yTop = 145 - barHeight;

                        const isIncluded =
                          intervalResult.status === 'valid' &&
                          intervalResult.value?.includedPoints.includes(pt.x);

                        return (
                          <g key={pt.x}>
                            <rect
                              x={xCenter - barWidth / 2}
                              y={yTop}
                              width={barWidth}
                              height={barHeight}
                              fill={isIncluded ? '#16a34a' : '#3b82f6'}
                              rx="3"
                            />
                            <text
                              x={xCenter}
                              y={yTop - 4}
                              fontSize="10"
                              fontWeight="bold"
                              fill="#1e293b"
                              textAnchor="middle"
                            >
                              {rationalToString(pt.mass)}
                            </text>
                            <text
                              x={xCenter}
                              y="160"
                              fontSize="11"
                              fontWeight="bold"
                              fill="#475569"
                              textAnchor="middle"
                            >
                              {pt.x}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Staircase CDF Plot */}
              {(activeView === 'both' || activeView === 'cdf') && (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e293b' }}>
                    Staircase CDF <MathView math="F(x) = P(X \le x)" />
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width="280" height="180" viewBox="0 0 280 180" style={{ maxWidth: '100%', overflow: 'visible' }}>
                      {/* Axes */}
                      <line x1="30" y1="145" x2="260" y2="145" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="30" y1="20" x2="30" y2="145" stroke="#94a3b8" strokeWidth="1.5" />

                      {/* 1.0 ceiling guideline */}
                      <line x1="30" y1="35" x2="260" y2="35" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="22" y="38" fontSize="9" fill="#94a3b8" textAnchor="end">1.0</text>

                      {/* CDF Segments */}
                      {activeDist.points.map((pt, idx) => {
                        const n = activeDist.points.length;
                        const slotWidth = 200 / n;
                        const xCurrent = 40 + idx * slotWidth;
                        const nextX = idx < n - 1 ? 40 + (idx + 1) * slotWidth : 260;

                        const yLevel = 145 - rationalToDecimal(pt.cdfValue) * 110;
                        const yPrev = 145 - rationalToDecimal(pt.leftLimit) * 110;

                        return (
                          <g key={pt.x}>
                            {/* Horizontal segment */}
                            <line
                              x1={xCurrent}
                              y1={yLevel}
                              x2={nextX}
                              y2={yLevel}
                              stroke="#2563eb"
                              strokeWidth="2.5"
                            />

                            {/* Solid right-continuous circle at (x, F(x)) */}
                            <circle cx={xCurrent} cy={yLevel} r="3.5" fill="#2563eb" />

                            {/* Open circle at (x, F(x-)) showing left jump if mass > 0 */}
                            {idx > 0 && (
                              <circle cx={xCurrent} cy={yPrev} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
                            )}

                            {/* X-axis tick */}
                            <text x={xCurrent} y="160" fontSize="11" fill="#475569" textAnchor="middle">
                              {pt.x}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Distribution Summary Table */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e293b' }}>
                Support Points & Jump Values Table
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Support <MathView math="x_k" /></th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Point Mass <MathView math="p(x_k)" /></th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Left Limit <MathView math="F(x_k^-)" /></th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>CDF <MathView math="F(x_k)" /></th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Jump Size <MathView math="\Delta F" /></th>
                  </tr>
                </thead>
                <tbody>
                  {activeDist.points.map((pt) => (
                    <tr key={pt.x} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px', fontWeight: 600, color: '#1e40af' }}>{pt.x}</td>
                      <td style={{ padding: '6px' }}>{rationalToString(pt.mass)}</td>
                      <td style={{ padding: '6px', color: '#64748b' }}>{rationalToString(pt.leftLimit)}</td>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{rationalToString(pt.cdfValue)}</td>
                      <td style={{ padding: '6px', color: '#15803d', fontWeight: 600 }}>
                        +{rationalToString(pt.jumpSize)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Insight Callout */}
          <div
            style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#1e293b' }}>
              💡 Mathematical Insight: Discrete Endpoint Sensitivity
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              For continuous random variables, single points have zero probability, so <MathView math="P(a \le X \le b) = P(a < X < b)" />. But for discrete random variables, point masses cause instantaneous jump discontinuities in the CDF! Therefore, whether an interval endpoint is open or closed directly includes or excludes that point mass: <MathView math="P(a \le X \le b) = F(b) - F(a^-)" /> whereas <MathView math="P(a < X \le b) = F(b) - F(a)" />.
            </p>
          </div>
        </div>
      </div>
    </div>
  </LabShell>
);
};
