import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToDecimal,
  rationalToLatex,
  subRational,
  Rational,
} from '../../core/math/rational';
import {
  calculateBayesRule,
  BayesInputPartition,
} from '../../core/math/conditional';
import { MathView } from './MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';

interface PL02Snapshot {
  timestamp: string;
  prevalence: string;
  sensitivity: string;
  specificity: string;
  evidence: 'positive' | 'negative';
  evidenceProbStr: string;
  posteriorStr: string;
  posteriorPct: string;
}

export const LabPL02: React.FC = () => {
  // Input parameters stored as rational-compatible decimal strings
  const [prevalenceInput, setPrevalenceInput] = useState<string>('0.01'); // P(D)
  const [sensitivityInput, setSensitivityInput] = useState<string>('0.99'); // P(T+ | D)
  const [specificityInput, setSpecificityInput] = useState<string>('0.95'); // P(T- | D^c)
  const [evidence, setEvidence] = useState<'positive' | 'negative'>('positive');
  const [snapshot, setSnapshot] = useState<PL02Snapshot | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-02',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-02: Conditional Probability and Bayes Rule',
    });
  }, []);

  // Parse inputs safely
  const parsedParams = useMemo(() => {
    const pD = parseRational(prevalenceInput);
    const pSens = parseRational(sensitivityInput);
    const pSpec = parseRational(specificityInput);

    if (!pD || !pSens || !pSpec) {
      return {
        valid: false,
        error: 'Please enter valid rational numbers (e.g. 0.01 or 1/100).',
        pD: null,
        pSens: null,
        pSpec: null,
      };
    }

    const zero = createRational(0n);
    const one = createRational(1n);

    // Validate bounds [0, 1]
    const inRange = (r: Rational) =>
      Number(r.num) / Number(r.den) >= 0 && Number(r.num) / Number(r.den) <= 1;

    if (!inRange(pD) || !inRange(pSens) || !inRange(pSpec)) {
      return {
        valid: false,
        error: 'Probabilities must be within the range [0, 1].',
        pD: null,
        pSens: null,
        pSpec: null,
      };
    }

    return {
      valid: true,
      error: null,
      pD,
      pSens,
      pSpec,
      one,
      zero,
    };
  }, [prevalenceInput, sensitivityInput, specificityInput]);

  // Compute Bayes calculation
  const calculation = useMemo(() => {
    if (!parsedParams.valid || !parsedParams.pD || !parsedParams.pSens || !parsedParams.pSpec) {
      return null;
    }

    const one = parsedParams.one!;
    const pD = parsedParams.pD;
    const pDComp = subRational(one, pD);
    const pSens = parsedParams.pSens;
    const pSensComp = subRational(one, pSens); // P(T- | D)
    const pSpec = parsedParams.pSpec;
    const pSpecComp = subRational(one, pSpec); // P(T+ | D^c), false positive rate

    // Contingency cells:
    // D & T+ : pD * pSens
    // D & T- : pD * pSensComp
    // D^c & T+ : pDComp * pSpecComp
    // D^c & T- : pDComp * pSpec
    const isPos = evidence === 'positive';

    const partition: BayesInputPartition[] = [
      {
        name: 'D (Condition Present)',
        prior: pD,
        likelihood: isPos ? pSens : pSensComp,
      },
      {
        name: 'D^c (Condition Absent)',
        prior: pDComp,
        likelihood: isPos ? pSpecComp : pSpec,
      },
    ];

    const bayesResult = calculateBayesRule(partition, 0);

    return {
      pD,
      pDComp,
      pSens,
      pSensComp,
      pSpec,
      pSpecComp,
      jointD_Tpos: bayesResult.jointProbabilities[0], // for evidence
      bayesResult,
      isPos,
    };
  }, [parsedParams, evidence]);

  const handlePreset = (prev: string, sens: string, spec: string, ev: 'positive' | 'negative' = 'positive') => {
    setPrevalenceInput(prev);
    setSensitivityInput(sens);
    setSpecificityInput(spec);
    setEvidence(ev);
  };

  const handleTakeSnapshot = () => {
    if (!calculation) return;
    const evProb = calculation.bayesResult.evidenceTotalProbability;
    const post = calculation.bayesResult.posteriorProbability;

    let posteriorStr = 'Undefined';
    let posteriorPct = 'N/A';
    if (post.status === 'valid' && post.exact_rational) {
      posteriorStr = rationalToString(post.exact_rational);
      posteriorPct = (rationalToDecimal(post.exact_rational, 4) * 100).toFixed(2) + '%';
    }

    setSnapshot({
      timestamp: new Date().toLocaleTimeString(),
      prevalence: prevalenceInput,
      sensitivity: sensitivityInput,
      specificity: specificityInput,
      evidence,
      evidenceProbStr: evProb.exact_rational ? rationalToString(evProb.exact_rational) : '0',
      posteriorStr,
      posteriorPct,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--surface, #ffffff)',
          borderRadius: '8px',
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: 'var(--text-primary, #1e293b)' }}>
              Guided Lab PL-02: Conditional Probability & Bayes' Rule
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)' }}>
              Investigate the mathematics of diagnostic screening, joint event intersections, the Law of Total Probability, and how prior evidence updates belief into posterior probabilities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePreset('0.01', '0.99', '0.95', 'positive')}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border, #cbd5e1)',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Presets:</span>
          <button
            onClick={() => handlePreset('0.01', '0.99', '0.95', 'positive')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Rare Disease (0.01, 0.99, 0.95)
          </button>
          <button
            onClick={() => handlePreset('0.20', '0.90', '0.90', 'positive')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Common Condition (0.20, 0.90, 0.90)
          </button>
          <button
            onClick={() => handlePreset('0.05', '1.00', '1.00', 'positive')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Perfect Test (100% / 100%)
          </button>
          <button
            onClick={() => handlePreset('0.10', '0.50', '0.50', 'positive')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Coin Flip (50% / 50%)
          </button>
          <button
            onClick={() => handlePreset('0', '0', '1', 'positive')}
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
            Zero Evidence (E-COND-ZERO)
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Calculations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameter Sliders */}
        <div
          style={{
            background: 'var(--surface, #ffffff)',
            padding: '18px',
            borderRadius: '8px',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
            1. Model Parameters
          </h3>

          {/* Prevalence */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Prevalence / Prior <MathView math="P(D)" />
              </label>
              <input
                type="text"
                value={prevalenceInput}
                onChange={(e) => setPrevalenceInput(e.target.value)}
                style={{
                  width: '65px',
                  padding: '2px 6px',
                  fontSize: '0.82rem',
                  textAlign: 'right',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={Number(prevalenceInput) || 0}
              onChange={(e) => setPrevalenceInput(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Proportion of population with condition. <MathView math={`P(D^c) = ${(1 - (Number(prevalenceInput) || 0)).toFixed(4)}`} />
            </span>
          </div>

          {/* Sensitivity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Sensitivity <MathView math="P(T^+ \mid D)" />
              </label>
              <input
                type="text"
                value={sensitivityInput}
                onChange={(e) => setSensitivityInput(e.target.value)}
                style={{
                  width: '65px',
                  padding: '2px 6px',
                  fontSize: '0.82rem',
                  textAlign: 'right',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={Number(sensitivityInput) || 0}
              onChange={(e) => setSensitivityInput(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              True positive rate (test is positive given condition).
            </span>
          </div>

          {/* Specificity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Specificity <MathView math="P(T^- \mid D^c)" />
              </label>
              <input
                type="text"
                value={specificityInput}
                onChange={(e) => setSpecificityInput(e.target.value)}
                style={{
                  width: '65px',
                  padding: '2px 6px',
                  fontSize: '0.82rem',
                  textAlign: 'right',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={Number(specificityInput) || 0}
              onChange={(e) => setSpecificityInput(e.target.value)}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              True negative rate. False-positive rate <MathView math={`P(T^+ \\mid D^c) = ${(1 - (Number(specificityInput) || 0)).toFixed(4)}`} />.
            </span>
          </div>

          {/* Evidence Selector */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
              2. Observed Evidence
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: evidence === 'positive' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: evidence === 'positive' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: evidence === 'positive' ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="evidence"
                  checked={evidence === 'positive'}
                  onChange={() => setEvidence('positive')}
                />
                Positive (<MathView math="T^+" />)
              </label>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: evidence === 'negative' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: evidence === 'negative' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: evidence === 'negative' ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="evidence"
                  checked={evidence === 'negative'}
                  onChange={() => setEvidence('negative')}
                />
                Negative (<MathView math="T^-" />)
              </label>
            </div>
          </div>

          {/* Snapshot Button */}
          <button
            onClick={handleTakeSnapshot}
            disabled={!calculation}
            style={{
              marginTop: '4px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: calculation ? 'pointer' : 'not-allowed',
            }}
          >
            📸 Take Snapshot
          </button>
        </div>

        {/* Right Column: Visualizations & Posterior Inference */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Posterior Inference Hero Card */}
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
                Bayesian Update & Posterior Probability
              </h3>
              <span
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: calculation?.bayesResult.posteriorProbability.status === 'valid' ? '#dcfce7' : '#fee2e2',
                  color: calculation?.bayesResult.posteriorProbability.status === 'valid' ? '#166534' : '#991b1b',
                }}
              >
                Engine: CAL-COND-002
              </span>
            </div>

            {parsedParams.error && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                {parsedParams.error}
              </div>
            )}

            {calculation && (
              <div>
                {calculation.bayesResult.posteriorProbability.status === 'valid' ? (
                  <div>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
                          Prior <MathView math="P(D)" />
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                          {(rationalToDecimal(calculation.pD, 4) * 100).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <MathView math={`\\frac{${calculation.pD.num}}{${calculation.pD.den}}`} />
                        </div>
                      </div>

                      <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>➔</div>

                      <div style={{ background: '#eff6ff', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '0.78rem', color: '#1d4ed8', marginBottom: '4px' }}>
                          Total Evidence <MathView math={evidence === 'positive' ? 'P(T^+)' : 'P(T^-)'} />
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e40af' }}>
                          {(rationalToDecimal(calculation.bayesResult.evidenceTotalProbability.exact_rational!, 4) * 100).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                          <MathView math={`\\frac{${calculation.bayesResult.evidenceTotalProbability.exact_rational!.num}}{${calculation.bayesResult.evidenceTotalProbability.exact_rational!.den}}`} />
                        </div>
                      </div>

                      <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>➔</div>

                      <div style={{ background: '#f0fdf4', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', marginBottom: '4px' }}>
                          Posterior <MathView math={evidence === 'positive' ? 'P(D \\mid T^+)' : 'P(D \\mid T^-)'} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>
                          {(rationalToDecimal(calculation.bayesResult.posteriorProbability.exact_rational!, 4) * 100).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                          Exact: <MathView math={`\\frac{${calculation.bayesResult.posteriorProbability.exact_rational!.num}}{${calculation.bayesResult.posteriorProbability.exact_rational!.den}}`} />
                        </div>
                      </div>
                    </div>

                    {/* Belief Shift Visual Bar */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
                        <span>Prior Belief: {(rationalToDecimal(calculation.pD, 4) * 100).toFixed(2)}%</span>
                        <span>Updated Belief: {(rationalToDecimal(calculation.bayesResult.posteriorProbability.exact_rational!, 4) * 100).toFixed(2)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, rationalToDecimal(calculation.bayesResult.posteriorProbability.exact_rational!, 4) * 100)}%`,
                            background: evidence === 'positive' ? '#22c55e' : '#3b82f6',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Formula breakdown */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <MathView
                        math={`P(D \\mid ${evidence === 'positive' ? 'T^+' : 'T^-\\!'}) = \\frac{P(${evidence === 'positive' ? 'T^+' : 'T^-\\!'}\\mid D) P(D)}{P(${evidence === 'positive' ? 'T^+' : 'T^-\\!'})} = \\frac{${rationalToLatex(calculation.bayesResult.jointProbabilities[0].joint)}}{${rationalToLatex(calculation.bayesResult.evidenceTotalProbability.exact_rational!)}} = ${rationalToLatex(calculation.bayesResult.posteriorProbability.exact_rational!)}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      ⚠️ {calculation.bayesResult.posteriorProbability.error_code}: Result Undefined
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {calculation.bayesResult.posteriorProbability.message}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2x2 Contingency Table */}
          {calculation && (
            <div
              style={{
                background: 'var(--surface, #ffffff)',
                padding: '18px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
                2x2 Contingency Table (Joint and Marginal Mass)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#475569' }}>Hypothesis \ Test</th>
                    <th
                      style={{
                        padding: '8px',
                        background: evidence === 'positive' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                        color: evidence === 'positive' ? '#1d4ed8' : '#475569',
                      }}
                    >
                      <MathView math="T^+" /> (Positive)
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        background: evidence === 'negative' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                        color: evidence === 'negative' ? '#1d4ed8' : '#475569',
                      }}
                    >
                      <MathView math="T^-" /> (Negative)
                    </th>
                    <th style={{ padding: '8px', borderLeft: '2px solid #cbd5e1', color: '#475569' }}>Marginal Prior</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Condition D */}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                      <MathView math="D" /> (Present)
                    </td>
                    {/* D & T+ */}
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'positive' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        <MathView math={`P(D \\cap T^+) = ${rationalToString(calculation.bayesResult.jointProbabilities[0].joint)}`} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(calculation.bayesResult.jointProbabilities[0].joint, 4) * 100).toFixed(2)}% (True Pos)
                      </div>
                    </td>
                    {/* D & T- */}
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'negative' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        <MathView math={`P(D \\cap T^-) = ${rationalToString(subRational(calculation.pD, calculation.bayesResult.jointProbabilities[0].joint))}`} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(subRational(calculation.pD, calculation.bayesResult.jointProbabilities[0].joint), 4) * 100).toFixed(2)}% (False Neg)
                      </div>
                    </td>
                    {/* Marginal P(D) */}
                    <td style={{ padding: '10px 8px', borderLeft: '2px solid #cbd5e1', fontWeight: 600 }}>
                      <MathView math={`P(D) = ${rationalToString(calculation.pD)}`} />
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(calculation.pD, 4) * 100).toFixed(2)}%
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Condition D^c */}
                  <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                      <MathView math="D^c" /> (Absent)
                    </td>
                    {/* D^c & T+ */}
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'positive' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        <MathView math={`P(D^c \\cap T^+) = ${rationalToString(calculation.bayesResult.jointProbabilities[1].joint)}`} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(calculation.bayesResult.jointProbabilities[1].joint, 4) * 100).toFixed(2)}% (False Pos)
                      </div>
                    </td>
                    {/* D^c & T- */}
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'negative' ? '#eff6ff' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        <MathView math={`P(D^c \\cap T^-) = ${rationalToString(subRational(calculation.pDComp, calculation.bayesResult.jointProbabilities[1].joint))}`} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(subRational(calculation.pDComp, calculation.bayesResult.jointProbabilities[1].joint), 4) * 100).toFixed(2)}% (True Neg)
                      </div>
                    </td>
                    {/* Marginal P(D^c) */}
                    <td style={{ padding: '10px 8px', borderLeft: '2px solid #cbd5e1', fontWeight: 600 }}>
                      <MathView math={`P(D^c) = ${rationalToString(calculation.pDComp)}`} />
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(rationalToDecimal(calculation.pDComp, 4) * 100).toFixed(2)}%
                      </div>
                    </td>
                  </tr>

                  {/* Marginal Row */}
                  <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                    <td style={{ padding: '10px 8px', textAlign: 'left', color: '#475569' }}>Marginal Evidence</td>
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'positive' ? '#dbeafe' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                        color: evidence === 'positive' ? '#1d4ed8' : undefined,
                      }}
                    >
                      <MathView math={`P(T^+) = ${rationalToString(calculation.isPos ? calculation.bayesResult.evidenceTotalProbability.exact_rational! : subRational(createRational(1n), calculation.bayesResult.evidenceTotalProbability.exact_rational!))}`} />
                    </td>
                    <td
                      style={{
                        padding: '10px 8px',
                        background: evidence === 'negative' ? '#dbeafe' : undefined,
                        borderLeft: '1px solid #e2e8f0',
                        color: evidence === 'negative' ? '#1d4ed8' : undefined,
                      }}
                    >
                      <MathView math={`P(T^-) = ${rationalToString(!calculation.isPos ? calculation.bayesResult.evidenceTotalProbability.exact_rational! : subRational(createRational(1n), calculation.bayesResult.evidenceTotalProbability.exact_rational!))}`} />
                    </td>
                    <td style={{ padding: '10px 8px', borderLeft: '2px solid #cbd5e1' }}>1.0000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SVG Tree Diagram */}
          {calculation && (
            <div
              style={{
                background: 'var(--surface, #ffffff)',
                padding: '18px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
                Probability Tree Diagram
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="560" height="220" viewBox="0 0 560 220" style={{ maxWidth: '100%', overflow: 'visible' }}>
                  {/* Root Node */}
                  <circle cx="50" cy="110" r="18" fill="#475569" />
                  <text x="50" y="115" fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">Ω</text>

                  {/* Branches to D and D^c */}
                  <line x1="68" y1="100" x2="190" y2="55" stroke="#94a3b8" strokeWidth="2" />
                  <text x="120" y="70" fontSize="11" fill="#475569" textAnchor="middle">
                    P(D) = {rationalToString(calculation.pD)}
                  </text>

                  <line x1="68" y1="120" x2="190" y2="165" stroke="#94a3b8" strokeWidth="2" />
                  <text x="120" y="155" fontSize="11" fill="#475569" textAnchor="middle">
                    P(Dᶜ) = {rationalToString(calculation.pDComp)}
                  </text>

                  {/* Partition Nodes D and D^c */}
                  <circle cx="210" cy="55" r="18" fill="#0284c7" />
                  <text x="210" y="60" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">D</text>

                  <circle cx="210" cy="165" r="18" fill="#64748b" />
                  <text x="210" y="170" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">Dᶜ</text>

                  {/* Branches from D */}
                  <line
                    x1="228"
                    y1="48"
                    x2="370"
                    y2="25"
                    stroke={evidence === 'positive' ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={evidence === 'positive' ? 3 : 1.5}
                  />
                  <text x="295" y="28" fontSize="11" fill={evidence === 'positive' ? '#1d4ed8' : '#64748b'} textAnchor="middle">
                    P(T⁺|D) = {rationalToString(calculation.pSens)}
                  </text>

                  <line
                    x1="228"
                    y1="62"
                    x2="370"
                    y2="85"
                    stroke={evidence === 'negative' ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={evidence === 'negative' ? 3 : 1.5}
                  />
                  <text x="295" y="80" fontSize="11" fill={evidence === 'negative' ? '#1d4ed8' : '#64748b'} textAnchor="middle">
                    P(T⁻|D) = {rationalToString(calculation.pSensComp)}
                  </text>

                  {/* Branches from D^c */}
                  <line
                    x1="228"
                    y1="158"
                    x2="370"
                    y2="135"
                    stroke={evidence === 'positive' ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={evidence === 'positive' ? 3 : 1.5}
                  />
                  <text x="295" y="138" fontSize="11" fill={evidence === 'positive' ? '#1d4ed8' : '#64748b'} textAnchor="middle">
                    P(T⁺|Dᶜ) = {rationalToString(calculation.pSpecComp)}
                  </text>

                  <line
                    x1="228"
                    y1="172"
                    x2="370"
                    y2="195"
                    stroke={evidence === 'negative' ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={evidence === 'negative' ? 3 : 1.5}
                  />
                  <text x="295" y="190" fontSize="11" fill={evidence === 'negative' ? '#1d4ed8' : '#64748b'} textAnchor="middle">
                    P(T⁻|Dᶜ) = {rationalToString(calculation.pSpec)}
                  </text>

                  {/* Leaf Outcome Labels */}
                  <g opacity={evidence === 'positive' ? 1 : 0.45}>
                    <text x="390" y="29" fontSize="12" fontWeight="bold" fill="#1e293b">
                      T⁺ → P(D ∩ T⁺) = {rationalToString(calculation.bayesResult.jointProbabilities[0].joint)}
                    </text>
                  </g>
                  <g opacity={evidence === 'negative' ? 1 : 0.45}>
                    <text x="390" y="89" fontSize="12" fontWeight="bold" fill="#1e293b">
                      T⁻ → P(D ∩ T⁻) = {rationalToString(subRational(calculation.pD, calculation.bayesResult.jointProbabilities[0].joint))}
                    </text>
                  </g>
                  <g opacity={evidence === 'positive' ? 1 : 0.45}>
                    <text x="390" y="139" fontSize="12" fontWeight="bold" fill="#1e293b">
                      T⁺ → P(Dᶜ ∩ T⁺) = {rationalToString(calculation.bayesResult.jointProbabilities[1].joint)}
                    </text>
                  </g>
                  <g opacity={evidence === 'negative' ? 1 : 0.45}>
                    <text x="390" y="199" fontSize="12" fontWeight="bold" fill="#1e293b">
                      T⁻ → P(Dᶜ ∩ T⁻) = {rationalToString(subRational(calculation.pDComp, calculation.bayesResult.jointProbabilities[1].joint))}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* Intuition Box: The Base Rate Fallacy */}
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
              💡 Mathematical Insight: The Base Rate Fallacy
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              Notice that even when sensitivity is extremely high (e.g. 99%), testing positive does not guarantee having the condition if the base rate (prevalence) is tiny (e.g. 1%). Because the healthy population (99%) is vast, the small 5% false-positive rate produces roughly 4.95% false positives across the entire population, heavily outnumbering the true positives (0.99%). Bayes' Rule formalizes exactly how priors anchor posterior beliefs.
            </p>
          </div>

          {/* Snapshot Comparison Panel */}
          {snapshot && (
            <div
              style={{
                background: 'var(--surface, #ffffff)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>
                  Snapshot Comparison (Saved at {snapshot.timestamp})
                </h4>
                <button
                  onClick={() => setSnapshot(null)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Snapshot Config</div>
                  <div>Prevalence: {snapshot.prevalence}</div>
                  <div>Sensitivity: {snapshot.sensitivity}</div>
                  <div>Specificity: {snapshot.specificity}</div>
                  <div>Evidence: {snapshot.evidence}</div>
                  <div style={{ marginTop: '4px', fontWeight: 600, color: '#0369a1' }}>
                    Posterior: {snapshot.posteriorPct} ({snapshot.posteriorStr})
                  </div>
                </div>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>Current Live Config</div>
                  <div>Prevalence: {prevalenceInput}</div>
                  <div>Sensitivity: {sensitivityInput}</div>
                  <div>Specificity: {specificityInput}</div>
                  <div>Evidence: {evidence}</div>
                  <div style={{ marginTop: '4px', fontWeight: 600, color: '#166534' }}>
                    Posterior:{' '}
                    {calculation?.bayesResult.posteriorProbability.status === 'valid'
                      ? `${(rationalToDecimal(calculation.bayesResult.posteriorProbability.exact_rational!, 4) * 100).toFixed(2)}% (${rationalToString(calculation.bayesResult.posteriorProbability.exact_rational!)})`
                      : 'Undefined'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
