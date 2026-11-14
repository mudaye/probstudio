import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToDecimal,
  rationalToLatex,
} from '../../core/math/rational';
import {
  DistributionType,
  ParameterizedDistribution,
  createBernoulli,
  createBinomial,
  createGeometric,
  createPoisson,
  calculateBernoulliPmf,
  calculateBinomialPmf,
  calculateGeometricPmf,
  calculatePoissonPmf,
  calculateBernoulliCdf,
  calculateBinomialCdf,
  calculateGeometricCdf,
  calculatePoissonCdf,
  getDistributionMoments,
  getDistributionDisplayTable,
  simulateDistribution,
  SimulationResult,
  DistributionMoments,
  DisplayTableResult,
} from '../../core/math/distributions';
import { MathView } from './MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';

interface PL06Snapshot {
  timestamp: string;
  name: string;
  distType: DistributionType;
  paramSummary: string;
  mean: string;
  variance: string;
  simMean?: string;
  simVariance?: string;
}

export const LabPL06: React.FC = () => {
  // Distribution selector
  const [distType, setDistType] = useState<DistributionType>('bernoulli');

  // Parameters (string inputs to allow user typing and validation)
  const [bernoulliP, setBernoulliP] = useState<string>('1/2');
  const [binomialN, setBinomialN] = useState<string>('10');
  const [binomialP, setBinomialP] = useState<string>('1/2');
  const [geometricP, setGeometricP] = useState<string>('1/2');
  const [poissonLambda, setPoissonLambda] = useState<string>('3');

  // Point Query input
  const [queryK, setQueryK] = useState<string>('1');

  // Simulation controls
  const [sampleCount, setSampleCount] = useState<number>(1000);
  const [seed, setSeed] = useState<number>(42);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Comparison Snapshot
  const [snapshotName, setSnapshotName] = useState<string>('Baseline Model');
  const [snapshot, setSnapshot] = useState<PL06Snapshot | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-06',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-06: Distribution Explorer',
    });
  }, []);

  // Parse active distribution configuration
  const parsedDistResult = useMemo(() => {
    switch (distType) {
      case 'bernoulli': {
        const pRat = parseRational(bernoulliP);
        if (!pRat) {
          return {
            valid: false,
            error: `Parameter p "${bernoulliP}" cannot be parsed as a rational or decimal.`,
            dist: null,
            code: 'E-PARAM-DOMAIN',
          };
        }
        const res = createBernoulli(pRat);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Bernoulli parameter.',
            dist: null,
            code: res.error_code || 'E-PARAM-DOMAIN',
          };
        }
        return { valid: true, error: null, dist: res.value, code: null };
      }

      case 'binomial': {
        const nNum = Number(binomialN);
        if (!Number.isInteger(nNum) || nNum < 0) {
          return {
            valid: false,
            error: `Trial count n "${binomialN}" must be a non-negative integer.`,
            dist: null,
            code: 'E-PARAM-DOMAIN',
          };
        }
        const pRat = parseRational(binomialP);
        if (!pRat) {
          return {
            valid: false,
            error: `Parameter p "${binomialP}" cannot be parsed as a rational or decimal.`,
            dist: null,
            code: 'E-PARAM-DOMAIN',
          };
        }
        const res = createBinomial(nNum, pRat);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Binomial parameter.',
            dist: null,
            code: res.error_code || 'E-PARAM-DOMAIN',
          };
        }
        return { valid: true, error: null, dist: res.value, code: null };
      }

      case 'geometric': {
        const pRat = parseRational(geometricP);
        if (!pRat) {
          return {
            valid: false,
            error: `Parameter p "${geometricP}" cannot be parsed as a rational or decimal.`,
            dist: null,
            code: 'E-PARAM-DOMAIN',
          };
        }
        const res = createGeometric(pRat);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Geometric parameter.',
            dist: null,
            code: res.error_code || 'E-PARAM-DOMAIN',
          };
        }
        return { valid: true, error: null, dist: res.value, code: null };
      }

      case 'poisson': {
        const lamNum = Number(poissonLambda);
        if (!Number.isFinite(lamNum) || lamNum < 0) {
          return {
            valid: false,
            error: `Rate λ "${poissonLambda}" must be a non-negative real number.`,
            dist: null,
            code: 'E-PARAM-DOMAIN',
          };
        }
        const res = createPoisson(lamNum);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Poisson parameter.',
            dist: null,
            code: res.error_code || 'E-PARAM-DOMAIN',
          };
        }
        return { valid: true, error: null, dist: res.value, code: null };
      }
    }
  }, [distType, bernoulliP, binomialN, binomialP, geometricP, poissonLambda]);

  // Fallback for last valid distribution (Stale Result requirement)
  const [lastValidDist, setLastValidDist] = useState<ParameterizedDistribution>(() => {
    return createBernoulli(createRational(1n, 2n)).value!;
  });

  useEffect(() => {
    if (parsedDistResult.valid && parsedDistResult.dist) {
      setLastValidDist(parsedDistResult.dist);
    }
  }, [parsedDistResult]);

  const activeDist: ParameterizedDistribution =
    parsedDistResult.valid && parsedDistResult.dist
      ? parsedDistResult.dist
      : lastValidDist;

  const isStale = !parsedDistResult.valid;

  // Theoretical moments and table
  const moments: DistributionMoments = useMemo(() => {
    return getDistributionMoments(activeDist);
  }, [activeDist]);

  const displayTable: DisplayTableResult = useMemo(() => {
    return getDistributionDisplayTable(activeDist, 40);
  }, [activeDist]);

  // Point Query evaluation
  const queryResult = useMemo(() => {
    const kNum = Number(queryK);
    if (!Number.isFinite(kNum)) {
      return null;
    }

    switch (activeDist.type) {
      case 'bernoulli': {
        const pmf = calculateBernoulliPmf(activeDist, kNum);
        const cdf = calculateBernoulliCdf(activeDist, kNum);
        return {
          k: kNum,
          pmfStr: rationalToString(pmf.value!),
          pmfLatex: rationalToLatex(pmf.value!),
          cdfStr: rationalToString(cdf.value!),
          cdfLatex: rationalToLatex(cdf.value!),
        };
      }
      case 'binomial': {
        const pmf = calculateBinomialPmf(activeDist, kNum);
        const cdf = calculateBinomialCdf(activeDist, kNum);
        return {
          k: kNum,
          pmfStr: rationalToString(pmf.value!),
          pmfLatex: rationalToLatex(pmf.value!),
          cdfStr: rationalToString(cdf.value!),
          cdfLatex: rationalToLatex(cdf.value!),
        };
      }
      case 'geometric': {
        const pmf = calculateGeometricPmf(activeDist, kNum);
        const cdf = calculateGeometricCdf(activeDist, kNum);
        return {
          k: kNum,
          pmfStr: rationalToString(pmf.value!),
          pmfLatex: rationalToLatex(pmf.value!),
          cdfStr: rationalToString(cdf.value!),
          cdfLatex: rationalToLatex(cdf.value!),
        };
      }
      case 'poisson': {
        const pmf = calculatePoissonPmf(activeDist, kNum);
        const cdf = calculatePoissonCdf(activeDist, kNum);
        return {
          k: kNum,
          pmfStr: pmf.value!.toFixed(6),
          pmfLatex: pmf.value!.toFixed(6),
          cdfStr: cdf.value!.toFixed(6),
          cdfLatex: cdf.value!.toFixed(6),
        };
      }
    }
  }, [activeDist, queryK]);

  // Handle Simulation execution
  const handleRunSimulation = (chosenSeed?: number) => {
    const s = chosenSeed !== undefined ? chosenSeed : seed;
    const res = simulateDistribution(activeDist, sampleCount, s);
    if (res.status === 'valid' && res.value) {
      setSimResult(res.value);
    }
  };

  // Presets
  const applyPresetBernoulli = () => {
    setDistType('bernoulli');
    setBernoulliP('1/2');
    setQueryK('1');
    setSimResult(null);
  };

  const applyPresetBinomial = () => {
    setDistType('binomial');
    setBinomialN('10');
    setBinomialP('1/2');
    setQueryK('5');
    setSimResult(null);
  };

  const applyPresetGeometric = () => {
    setDistType('geometric');
    setGeometricP('1/2');
    setQueryK('2');
    setSimResult(null);
  };

  const applyPresetPoisson = () => {
    setDistType('poisson');
    setPoissonLambda('3');
    setQueryK('3');
    setSimResult(null);
  };

  const applyPresetDomainError = () => {
    setDistType('bernoulli');
    setBernoulliP('1.5'); // p > 1 triggers E-PARAM-DOMAIN
  };

  // Snapshot handling
  const handleSaveSnapshot = () => {
    let paramSummary = '';
    switch (activeDist.type) {
      case 'bernoulli':
        paramSummary = `p=${rationalToString(activeDist.p)}`;
        break;
      case 'binomial':
        paramSummary = `n=${activeDist.n}, p=${rationalToString(activeDist.p)}`;
        break;
      case 'geometric':
        paramSummary = `p=${rationalToString(activeDist.p)} (support starts at 1)`;
        break;
      case 'poisson':
        paramSummary = `λ=${activeDist.lambda}`;
        break;
    }

    setSnapshot({
      timestamp: new Date().toLocaleTimeString(),
      name: snapshotName || 'Snapshot',
      distType: activeDist.type,
      paramSummary,
      mean: moments.displayMean,
      variance: moments.displayVariance,
      simMean: simResult ? simResult.empiricalMean.toFixed(4) : undefined,
      simVariance: simResult ? simResult.empiricalVariance.toFixed(4) : undefined,
    });
  };

  // SVG Chart Dimensions
  const svgWidth = 620;
  const svgHeight = 280;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const points = displayTable.points;
  const maxMass = Math.max(
    0.05,
    ...points.map((p) => p.mass),
    ...(simResult
      ? Object.values(simResult.frequencies).map((f) => f.frequency)
      : [])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--surface, #ffffff)',
          borderRadius: '8px',
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 6px 0',
                fontSize: '1.25rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              Guided Lab PL-06: Distribution Explorer
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #64748b)',
              }}
            >
              <strong>Learning question:</strong> How do distribution parameters change a discrete model's probabilities, and how do repeated samples compare with its theoretical distribution?
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={applyPresetBernoulli}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border, #cbd5e1)',
                background: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              ↺ Reset Defaults
            </button>
          </div>
        </div>

        {/* Presets */}
        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-secondary, #475569)',
            }}
          >
            Presets:
          </span>
          <button
            onClick={applyPresetBernoulli}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'bernoulli' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Bernoulli(p=0.5)
          </button>
          <button
            onClick={applyPresetBinomial}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'binomial' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Binomial(n=10, p=0.5)
          </button>
          <button
            onClick={applyPresetGeometric}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'geometric' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Geometric(p=0.5)
          </button>
          <button
            onClick={applyPresetPoisson}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'poisson' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Poisson(λ=3)
          </button>
          <button
            onClick={applyPresetDomainError}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#991b1b',
              cursor: 'pointer',
            }}
          >
            Test Stale Error (p=1.5)
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Right Displays */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: '20px',
        }}
      >
        {/* Left Column: Parameter Setup & Distribution Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Distribution Selector Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '0.95rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              1. Distribution Family
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="distType"
                  value="bernoulli"
                  checked={distType === 'bernoulli'}
                  onChange={() => {
                    setDistType('bernoulli');
                    setSimResult(null);
                  }}
                />
                <strong>Bernoulli(p)</strong> — Single binary trial, support &#123;0, 1&#125;
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="distType"
                  value="binomial"
                  checked={distType === 'binomial'}
                  onChange={() => {
                    setDistType('binomial');
                    setSimResult(null);
                  }}
                />
                <strong>Binomial(n, p)</strong> — Successes in n trials, support &#123;0, …, n&#125;
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="distType"
                  value="geometric"
                  checked={distType === 'geometric'}
                  onChange={() => {
                    setDistType('geometric');
                    setSimResult(null);
                  }}
                />
                <strong>Geometric(p)</strong> — Trials until first success, support &#123;1, 2, …&#125;
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="distType"
                  value="poisson"
                  checked={distType === 'poisson'}
                  onChange={() => {
                    setDistType('poisson');
                    setSimResult(null);
                  }}
                />
                <strong>Poisson(λ)</strong> — Rate/event counts, support &#123;0, 1, 2, …&#125;
              </label>
            </div>
          </div>

          {/* Parameter Inputs Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '0.95rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              2. Parameter Settings
            </h3>

            {/* Bernoulli Controls */}
            {distType === 'bernoulli' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Success Probability p ∈ [0, 1]:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={(() => {
                        const r = parseRational(bernoulliP);
                        return r ? rationalToDecimal(r) : 0.5;
                      })()}
                      onChange={(e) => setBernoulliP(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={bernoulliP}
                      onChange={(e) => setBernoulliP(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                    Enter fraction (e.g. 1/2) or decimal (e.g. 0.5).
                  </div>
                </div>
              </div>
            )}

            {/* Binomial Controls */}
            {distType === 'binomial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Number of Trials n (integer ≥ 0):
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={Number(binomialN) || 10}
                      onChange={(e) => setBinomialN(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={binomialN}
                      onChange={(e) => setBinomialN(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Success Probability p ∈ [0, 1]:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={(() => {
                        const r = parseRational(binomialP);
                        return r ? rationalToDecimal(r) : 0.5;
                      })()}
                      onChange={(e) => setBinomialP(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={binomialP}
                      onChange={(e) => setBinomialP(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Geometric Controls */}
            {distType === 'geometric' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Success Probability p ∈ (0, 1]:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={(() => {
                        const r = parseRational(geometricP);
                        return r ? rationalToDecimal(r) : 0.5;
                      })()}
                      onChange={(e) => setGeometricP(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={geometricP}
                      onChange={(e) => setGeometricP(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    color: '#1e40af',
                  }}
                >
                  <strong>NPTEL Transcript Convention:</strong> Geometric random variable X represents the trial number of the first success. Support begins at 1 (k ∈ &#123;1, 2, …&#125;).
                </div>
              </div>
            )}

            {/* Poisson Controls */}
            {distType === 'poisson' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Rate Parameter λ ≥ 0:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.2"
                      value={Number(poissonLambda) || 3}
                      onChange={(e) => setPoissonLambda(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.1"
                      value={poissonLambda}
                      onChange={(e) => setPoissonLambda(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                    Poisson probabilities are marked approximate and computed numerically.
                  </div>
                </div>
              </div>
            )}

            {/* Stale Warning Banner */}
            {isStale && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <strong>⚠️ Stale result — based on last valid settings</strong>
                </div>
                <div style={{ marginTop: '2px' }}>
                  {parsedDistResult.error} {parsedDistResult.code && `(${parsedDistResult.code})`}
                </div>
              </div>
            )}
          </div>

          {/* Point Query Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '0.95rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              3. Point & CDF Query
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                Query point k:
              </label>
              <input
                type="number"
                value={queryK}
                onChange={(e) => setQueryK(e.target.value)}
                style={{
                  width: '70px',
                  padding: '4px 8px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
            </div>

            {queryResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569' }}>Point Mass P(X = {queryResult.k}): </span>
                  <strong>
                    <MathView math={`P(X = ${queryResult.k}) = ${queryResult.pmfLatex}`} />
                  </strong>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569' }}>Cumulative CDF F({queryResult.k}): </span>
                  <strong>
                    <MathView math={`F(${queryResult.k}) = ${queryResult.cdfLatex}`} />
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Snapshot Comparison Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '0.95rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              4. Saved Comparison Snapshot
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Snapshot name"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '0.82rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                }}
              />
              <button
                onClick={handleSaveSnapshot}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                📸 Save
              </button>
            </div>

            {snapshot && (
              <div
                style={{
                  padding: '10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{snapshot.name}</strong>
                  <button
                    onClick={() => setSnapshot(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      padding: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ color: '#475569' }}>
                  {snapshot.distType.toUpperCase()} ({snapshot.paramSummary})
                </div>
                <div style={{ marginTop: '4px', color: '#334155' }}>
                  Mean: <strong>{snapshot.mean}</strong> | Var: <strong>{snapshot.variance}</strong>
                </div>
                {snapshot.simMean && (
                  <div style={{ color: '#d97706', fontSize: '0.75rem' }}>
                    Simulated: Mean {snapshot.simMean}, Var {snapshot.simVariance}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualization & Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theoretical Summary Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Theoretical Expectation E[X]:
              </div>
              <div style={{ fontSize: '1.2rem' }}>
                <MathView math={`E[X] = ${moments.displayMean}`} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Theoretical Variance Var(X):
              </div>
              <div style={{ fontSize: '1.2rem' }}>
                <MathView math={`\\text{Var}(X) = ${moments.displayVariance}`} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Standard Deviation σ:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                {Math.sqrt(moments.variance).toFixed(4)}
              </div>
            </div>

            {displayTable.isTruncated && (
              <div
                style={{
                  padding: '6px 10px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#92400e',
                }}
              >
                <strong>Infinite Support Truncation:</strong> {displayTable.tailBoundDescription}
              </div>
            )}
          </div>

          {/* Interactive Bar Chart Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
                Theoretical PMF & Empirical Simulation Overlay
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      background: '#3b82f6',
                      borderRadius: '2px',
                      display: 'inline-block',
                    }}
                  />
                  Theoretical PMF
                </span>
                {simResult && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        background: '#f59e0b',
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    Empirical Frequency
                  </span>
                )}
              </div>
            </div>

            {/* SVG Visualizer */}
            <div style={{ overflowX: 'auto' }}>
              <svg
                width={svgWidth}
                height={svgHeight}
                style={{
                  display: 'block',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Axes and Grid Lines */}
                <line
                  x1={paddingLeft}
                  y1={svgHeight - paddingBottom}
                  x2={svgWidth - paddingRight}
                  y2={svgHeight - paddingBottom}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <line
                  x1={paddingLeft}
                  y1={paddingTop}
                  x2={paddingLeft}
                  y2={svgHeight - paddingBottom}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* Y-axis ticks and labels */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                  const val = frac * maxMass;
                  const y = svgHeight - paddingBottom - frac * plotHeight;
                  return (
                    <g key={frac}>
                      <line
                        x1={paddingLeft - 4}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="2,2"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="end"
                      >
                        {val.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Bars for each point */}
                {points.map((pt, idx) => {
                  const count = points.length;
                  const slotWidth = plotWidth / count;
                  const barWidth = Math.min(28, slotWidth * 0.4);
                  const xCenter = paddingLeft + (idx + 0.5) * slotWidth;

                  const theoHeight = (pt.mass / maxMass) * plotHeight;
                  const theoY = svgHeight - paddingBottom - theoHeight;

                  const empFreq =
                    simResult && simResult.frequencies[pt.x]
                      ? simResult.frequencies[pt.x].frequency
                      : 0;
                  const empHeight = (empFreq / maxMass) * plotHeight;
                  const empY = svgHeight - paddingBottom - empHeight;

                  return (
                    <g key={pt.x}>
                      {/* Theoretical Bar */}
                      <rect
                        x={simResult ? xCenter - barWidth : xCenter - barWidth / 2}
                        y={theoY}
                        width={barWidth}
                        height={theoHeight}
                        fill="#3b82f6"
                        opacity={0.85}
                        rx="2"
                      >
                        <title>{`Theoretical P(X=${pt.x}) = ${pt.mass.toFixed(4)}`}</title>
                      </rect>

                      {/* Empirical Bar (if simulation present) */}
                      {simResult && (
                        <rect
                          x={xCenter + 2}
                          y={empY}
                          width={barWidth}
                          height={empHeight}
                          fill="#f59e0b"
                          opacity={0.85}
                          rx="2"
                        >
                          <title>{`Empirical Freq(X=${pt.x}) = ${empFreq.toFixed(4)}`}</title>
                        </rect>
                      )}

                      {/* X-axis tick & label */}
                      <text
                        x={xCenter}
                        y={svgHeight - paddingBottom + 16}
                        fontSize="11"
                        fontWeight="600"
                        fill="#334155"
                        textAnchor="middle"
                      >
                        {pt.x}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Label */}
                <text
                  x={paddingLeft + plotWidth / 2}
                  y={svgHeight - 10}
                  fontSize="12"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                >
                  Support Point k
                </text>

                {/* Y-Axis Label */}
                <text
                  x={15}
                  y={paddingTop + plotHeight / 2}
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                  transform={`rotate(-90 15 ${paddingTop + plotHeight / 2})`}
                >
                  Probability / Frequency
                </text>
              </svg>
            </div>
          </div>

          {/* Simulation Controls & Empirical Results Card */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>
                Deterministic Pseudorandom Simulation (Mulberry32 PRNG)
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                Reproducible Simulation
              </span>
            </div>

            {/* Run Controls */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Sample Count N:
                </label>
                <select
                  value={sampleCount}
                  onChange={(e) => setSampleCount(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                  }}
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Seed:
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  style={{
                    width: '70px',
                    padding: '4px 8px',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <button
                onClick={() => handleRunSimulation()}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ▶ Run Simulation
              </button>

              <button
                onClick={() => {
                  const newSeed = Math.floor(Math.random() * 100000);
                  setSeed(newSeed);
                  handleRunSimulation(newSeed);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🎲 Randomize Seed & Run
              </button>
            </div>

            {/* Empirical Readout */}
            {simResult && (
              <div
                style={{
                  padding: '14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                      Empirical Mean:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#78350f' }}>
                      {simResult.empiricalMean.toFixed(4)}{' '}
                      <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#92400e' }}>
                        (vs theoretical {moments.mean.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                      Empirical Variance:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#78350f' }}>
                      {simResult.empiricalVariance.toFixed(4)}{' '}
                      <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#92400e' }}>
                        (vs theoretical {moments.variance.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                      Sample Count & Seed:
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#78350f' }}>
                      N = {simResult.sampleCount}, Seed = {simResult.seed}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '4px' }}>
                  <strong>First 20 Samples:</strong> [{simResult.samplesPreview.join(', ')}...]
                </div>
              </div>
            )}
          </div>

          {/* PMF & CDF Tabular Summary (Accessibility & Verification) */}
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '0.9rem',
                color: 'var(--text-primary, #1e293b)',
              }}
            >
              PMF & CDF Values Table
            </h4>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  fontSize: '0.82rem',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>k</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Theoretical P(X = k)</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Cumulative F(k)</th>
                    {simResult && (
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Empirical Freq</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {points.map((pt) => {
                    const empFreq =
                      simResult && simResult.frequencies[pt.x]
                        ? simResult.frequencies[pt.x].frequency
                        : 0;
                    return (
                      <tr key={pt.x} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 600 }}>{pt.x}</td>
                        <td style={{ padding: '5px 8px' }}>
                          {pt.exactMass ? rationalToString(pt.exactMass) : pt.mass.toFixed(6)}{' '}
                          <span style={{ color: '#64748b' }}>({pt.mass.toFixed(4)})</span>
                        </td>
                        <td style={{ padding: '5px 8px' }}>
                          {pt.exactCdf ? rationalToString(pt.exactCdf) : pt.cdf.toFixed(6)}{' '}
                          <span style={{ color: '#64748b' }}>({pt.cdf.toFixed(4)})</span>
                        </td>
                        {simResult && (
                          <td style={{ padding: '5px 8px', color: '#b45309', fontWeight: 600 }}>
                            {empFreq.toFixed(4)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
