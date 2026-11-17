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
  FiniteSampleSpace,
} from '../../core/math/types';
import {
  validateSampleSpace,
} from '../../core/math/events';
import {
  calculateInducedDistribution,
  InducedDistributionResult,
} from '../../core/math/randomVariable';
import { MathView } from './MathView';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

interface LabPL04Props {
  onNavigate?: (route: string, params?: Record<string, string>) => void;
  initialPreset?: string;
}

export const LabPL04: React.FC<LabPL04Props> = ({ onNavigate }) => {
  // Outcomes and masses
  const [outcomes, setOutcomes] = useState<string[]>([
    'HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT',
  ]);
  const [massesInput, setMassesInput] = useState<string[]>(Array(8).fill('1/8'));

  // Mapping from outcome to numerical value (as string for user editing)
  const [mappingInput, setMappingInput] = useState<Record<string, string>>({
    HHH: '3',
    HHT: '2',
    HTH: '2',
    HTT: '1',
    THH: '2',
    THT: '1',
    TTH: '1',
    TTT: '0',
  });

  const [varName, setVarName] = useState<string>('X');
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const [snapshotName, setSnapshotName] = useState<string>('Baseline RV Mapping');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() =>
    LocalPersistenceService.getLabSnapshot('PL-04')
  );

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-04',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-04: Random Variable Mapper',
    });
  }, []);

  // Parse sample space
  const parsedSpaceResult = useMemo(() => {
    const parsedMasses: Rational[] = [];
    for (let i = 0; i < massesInput.length; i++) {
      const p = parseRational(massesInput[i]);
      if (!p) {
        return {
          valid: false,
          error: `Outcome ${outcomes[i]} mass "${massesInput[i]}" is not a valid rational or decimal.`,
          space: null,
        };
      }
      parsedMasses.push(p);
    }

    const space: FiniteSampleSpace = {
      outcomes,
      masses: parsedMasses,
    };

    const val = validateSampleSpace(space);
    if (!val.valid) {
      return {
        valid: false,
        error: val.message || 'Invalid probability distribution: outcome masses must sum to 1.',
        space: null,
      };
    }

    return { valid: true, error: null, space };
  }, [outcomes, massesInput]);

  // Fallback for last valid calculation (Stale Result)
  const [lastValidResult, setLastValidResult] = useState<InducedDistributionResult | null>(() => {
    const e = createRational(1n, 8n);
    const initialSpace: FiniteSampleSpace = {
      outcomes: ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'],
      masses: [e, e, e, e, e, e, e, e],
    };
    const initialMapping: Record<string, number> = {
      HHH: 3, HHT: 2, HTH: 2, HTT: 1, THH: 2, THT: 1, TTH: 1, TTT: 0,
    };
    return calculateInducedDistribution(initialSpace, initialMapping).value;
  });

  // Calculate induced distribution
  const [calcResult, isStale, errorMsg] = useMemo(() => {
    if (!parsedSpaceResult.valid || !parsedSpaceResult.space) {
      return [lastValidResult, true, parsedSpaceResult.error] as const;
    }

    const res = calculateInducedDistribution(parsedSpaceResult.space, mappingInput);
    if (res.status === 'valid' && res.value) {
      return [res.value, false, null] as const;
    } else {
      return [lastValidResult, true, res.message || 'Mapping is incomplete or invalid.'] as const;
    }
  }, [parsedSpaceResult, mappingInput, lastValidResult]);

  useEffect(() => {
    if (parsedSpaceResult.valid && parsedSpaceResult.space) {
      const res = calculateInducedDistribution(parsedSpaceResult.space, mappingInput);
      if (res.status === 'valid' && res.value) {
        setLastValidResult(res.value);
      }
    }
  }, [parsedSpaceResult, mappingInput]);

  const handleMappingChange = (outcome: string, val: string) => {
    setMappingInput((prev) => ({
      ...prev,
      [outcome]: val,
    }));
  };

  const handleMassChange = (index: number, val: string) => {
    setMassesInput((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Presets
  const applyPresetHeads = () => {
    setOutcomes(['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT']);
    setMassesInput(Array(8).fill('1/8'));
    setMappingInput({
      HHH: '3', HHT: '2', HTH: '2', HTT: '1', THH: '2', THT: '1', TTH: '1', TTT: '0',
    });
    setVarName('X');
  };

  const applyPresetTails = () => {
    setOutcomes(['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT']);
    setMassesInput(Array(8).fill('1/8'));
    setMappingInput({
      HHH: '0', HHT: '1', HTH: '1', HTT: '2', THH: '1', THT: '2', TTH: '2', TTT: '3',
    });
    setVarName('Y');
  };

  const applyPresetGame = () => {
    setOutcomes(['HH', 'HT', 'TH', 'TT']);
    setMassesInput(['1/4', '1/4', '1/4', '1/4']);
    setMappingInput({
      HH: '2', HT: '0', TH: '0', TT: '-3',
    });
    setVarName('Z');
  };

  const applyPresetIncomplete = () => {
    applyPresetHeads();
    setMappingInput((prev) => ({ ...prev, TTT: '' })); // make TTT blank
  };

  const handleSaveSnapshot = () => {
    const snap: LabComparisonSnapshot = {
      snapshot_id: `PL04-SNAP-${Date.now()}`,
      lab_id: 'PL-04',
      name: snapshotName.trim() || 'RV Mapping Snapshot',
      timestamp: new Date().toISOString(),
      parameters: {
        varName,
        outcomes,
        massesInput,
        mappingInput,
      },
      results: {
        distinctCount: calcResult?.distinctValues.length ?? 0,
        values: calcResult?.distinctValues ?? [],
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const p = savedSnapshot.parameters;
    if (p.varName) setVarName(p.varName);
    if (p.outcomes) setOutcomes(p.outcomes);
    if (p.massesInput) setMassesInput(p.massesInput);
    if (p.mappingInput) setMappingInput(p.mappingInput);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-04');
    setSavedSnapshot(null);
  };

  return (
    <LabShell
      labId="PL-04"
      labTitle="Random Variable Mapper"
      labSubtitle="How does a rule X: Ω → ℝ map outcomes to real values, and how does inverse-image fiber aggregation induce the probability mass function (PMF)?"
      sourceAttribution={{
        part: 'Part 1',
        chapter: 'Chapter 5: Random variables and induced probability distributions',
        isIllustrative: true,
      }}
      linkedModuleIds={['M05']}
      linkedConceptIds={['C-000007', 'C-000008']}
      isStale={isStale}
      errorCode={isStale ? 'E-PARAM-DOMAIN' : undefined}
      errorMessage={errorMsg ?? undefined}
      snapshotName={snapshotName}
      onSnapshotNameChange={setSnapshotName}
      savedSnapshot={savedSnapshot}
      onSaveSnapshot={handleSaveSnapshot}
      onRestoreSnapshot={handleRestoreSnapshot}
      onDeleteSnapshot={handleDeleteSnapshot}
      onReset={applyPresetHeads}
      onNavigate={onNavigate}
      renderSnapshotComparison={(saved) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', background: '#eff6ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#1d4ed8' }}>Active Configuration</h4>
            <div>Variable: <strong>{varName}</strong></div>
            <div>Support: <code>&#123;{(calcResult?.distinctValues ?? []).join(', ')}&#125;</code></div>
            <div>Outcomes mapped: <strong>{outcomes.length}</strong></div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Saved: {saved.name}</h4>
            <div>Variable: <strong>{saved.parameters?.varName ?? 'X'}</strong></div>
            <div>Support: <code>&#123;{(saved.results?.values ?? []).join(', ')}&#125;</code></div>
            <div>Outcomes mapped: <strong>{(saved.parameters?.outcomes ?? []).length}</strong></div>
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
            onClick={applyPresetHeads}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            3 Tosses → Heads Count X(ω)
          </button>
          <button
            onClick={applyPresetTails}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            3 Tosses → Tails Count Y(ω)
          </button>
          <button
            onClick={applyPresetGame}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Net Payoff Game Z(ω) ∈ &#123;-3, 0, 2&#125;
          </button>
          <button
            onClick={applyPresetIncomplete}
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
            Incomplete Mapping (E-MAPPING-INCOMPLETE)
          </button>
        </div>
      </div>

      {/* Validation warning if invalid mapping or masses */}
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
            <strong>Validation Warning:</strong> {errorMsg}
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              Showing results from the <em>last valid mapping</em> (Stale Result).
            </div>
          </div>
          <button
            onClick={applyPresetHeads}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #d97706',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Restore Default Mapping
          </button>
        </div>
      )}

      {/* Main Grid: Mapping Editor (Left) & Induced PMF / Visuals (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 390px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Outcome to Real Value Mapping Editor */}
        <div
          style={{
            background: 'var(--surface, #ffffff)',
            padding: '18px',
            borderRadius: '8px',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
              1. Outcome Mapping <MathView math={`${varName}: \\Omega \\to \\mathbb{R}`} />
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Name:</span>
              <input
                type="text"
                value={varName}
                onChange={(e) => setVarName(e.target.value.trim().slice(0, 3) || 'X')}
                style={{
                  width: '35px',
                  padding: '2px 4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
            Assign a real numerical value to each outcome. Multiple outcomes may map to the same value (many-to-one fiber).
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Outcome (ω)</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>Mass p(ω)</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>Mapped Value {varName}(ω)</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((item, idx) => {
                const mappedVal = Number(mappingInput[item]);
                const isHovered = hoveredValue !== null && mappedVal === hoveredValue;

                return (
                  <tr
                    key={item}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isHovered ? '#eff6ff' : undefined,
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '6px', fontWeight: 600 }}>
                      <code>{item}</code>
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="text"
                        value={massesInput[idx]}
                        onChange={(e) => handleMassChange(idx, e.target.value)}
                        style={{
                          width: '55px',
                          padding: '2px 4px',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="text"
                        value={mappingInput[item] ?? ''}
                        onChange={(e) => handleMappingChange(item, e.target.value)}
                        placeholder="Real num"
                        style={{
                          width: '65px',
                          padding: '2px 6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          border: mappingInput[item] === '' ? '1px solid #f87171' : '1px solid #cbd5e1',
                          borderRadius: '4px',
                          background: mappingInput[item] === '' ? '#fee2e2' : '#ffffff',
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Snapshot Button */}
          <button
            onClick={handleSaveSnapshot}
            disabled={!calcResult}
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: calcResult ? 'pointer' : 'not-allowed',
            }}
          >
            📸 Take Comparison Snapshot
          </button>
        </div>

        {/* Right Column: Induced Distribution Results & Bar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {calcResult && (
            <div
              style={{
                background: 'var(--surface, #ffffff)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary, #1e293b)' }}>
                  Induced Probability Mass Function <MathView math={`p_{${varName}}(${varName.toLowerCase()}) = P(${varName} = ${varName.toLowerCase()})`} />
                </h3>
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
                  Engine: CAL-RV-001
                </span>
              </div>

              {/* Induced PMF Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Value <MathView math="x" /></th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Pre-image Fiber <MathView math={`\\{ \\omega : ${varName}(\\omega) = x \\}`} /></th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Exact Mass <MathView math={`P(${varName} = x)`} /></th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.pmf.map((pt) => {
                    const isHovered = hoveredValue === pt.value;
                    return (
                      <tr
                        key={pt.value}
                        onMouseEnter={() => setHoveredValue(pt.value)}
                        onMouseLeave={() => setHoveredValue(null)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isHovered ? '#eff6ff' : undefined,
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>
                          {pt.value}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'left' }}>
                          <code>&#123;{pt.preimages.join(', ')}&#125;</code>{' '}
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({pt.preimages.length} outcomes)</span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>
                          <MathView math={rationalToLatex(pt.mass)} />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#475569' }}>
                          {(rationalToDecimal(pt.mass, 4) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={2} style={{ padding: '8px', textAlign: 'right' }}>Total Mass Sum:</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#166534' }}>
                      {rationalToString(calcResult.totalMass)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#166534' }}>100.0%</td>
                  </tr>
                </tfoot>
              </table>

              {/* Interactive SVG PMF Bar Chart */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: '#1e293b' }}>
                  PMF Bar Chart (Hover bar to highlight fiber)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="500" height="200" viewBox="0 0 500 200" style={{ maxWidth: '100%', overflow: 'visible' }}>
                    {/* Baseline axis */}
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#94a3b8" strokeWidth="2" />

                    {/* Bars */}
                    {calcResult.pmf.map((pt, idx) => {
                      const n = calcResult.pmf.length;
                      const slotWidth = 400 / n;
                      const xCenter = 60 + idx * slotWidth + slotWidth / 2;
                      const barWidth = Math.min(50, slotWidth * 0.6);
                      const barHeight = Math.max(4, rationalToDecimal(pt.mass) * 140);
                      const yTop = 160 - barHeight;
                      const isHovered = hoveredValue === pt.value;

                      return (
                        <g
                          key={pt.value}
                          onMouseEnter={() => setHoveredValue(pt.value)}
                          onMouseLeave={() => setHoveredValue(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Value Bar */}
                          <rect
                            x={xCenter - barWidth / 2}
                            y={yTop}
                            width={barWidth}
                            height={barHeight}
                            fill={isHovered ? '#2563eb' : '#3b82f6'}
                            rx="4"
                          />

                          {/* Probability Label Above Bar */}
                          <text
                            x={xCenter}
                            y={yTop - 6}
                            fontSize="11"
                            fontWeight="bold"
                            fill="#1e293b"
                            textAnchor="middle"
                          >
                            {rationalToString(pt.mass)}
                          </text>

                          {/* Value Label on Axis */}
                          <text
                            x={xCenter}
                            y="180"
                            fontSize="12"
                            fontWeight="bold"
                            fill={isHovered ? '#1d4ed8' : '#475569'}
                            textAnchor="middle"
                          >
                            {pt.value}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

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
              💡 Mathematical Insight: Fibers and Induced Measures
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              A random variable is a deterministic mapping <MathView math="X: \Omega \to \mathbb{R}" />. It partitions the sample space <MathView math="\Omega" /> into fibers (pre-image sets) <MathView math="X^{-1}(\{x\}) = \{\omega : X(\omega) = x\}" />. The probability mass <MathView math="P(X = x)" /> is simply the total probability of all outcomes in its fiber. This induces a brand new, valid probability space on the real numbers.
            </p>
          </div>
        </div>
      </div>
    </LabShell>
  );
};
