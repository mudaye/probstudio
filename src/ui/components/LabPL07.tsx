import React, { useState, useMemo, useEffect } from 'react';
import {
  ContinuousDistributionType,
  ContinuousDistribution,
  createUniform,
  createExponential,
  createGaussian,
  calculateContinuousIntervalProbability,
  getContinuousMoments,
  getContinuousDensityCurve,
  simulateContinuousDistribution,
  ContinuousSimulationResult,
  ContinuousMoments,
} from '../../core/math/continuous';
import { MathView } from './MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';

interface PL07Snapshot {
  timestamp: string;
  name: string;
  distType: ContinuousDistributionType;
  paramSummary: string;
  mean: string;
  variance: string;
  intervalQuery: string;
  intervalProb: string;
  simMean?: string;
  simVariance?: string;
}

export type LabPL07View = 'pdf' | 'cdf' | 'both';

export const LabPL07: React.FC = () => {
  // Distribution selector
  const [distType, setDistType] = useState<ContinuousDistributionType>('uniform');

  // Parameters
  const [uniformA, setUniformA] = useState<string>('0');
  const [uniformB, setUniformB] = useState<string>('1');
  const [exponentialLambda, setExponentialLambda] = useState<string>('1.0');
  const [gaussianMu, setGaussianMu] = useState<string>('0');
  const [gaussianSigma, setGaussianSigma] = useState<string>('1');

  // Interval Inspector
  const [intervalLower, setIntervalLower] = useState<string>('0');
  const [intervalUpper, setIntervalUpper] = useState<string>('0.5');

  // View mode
  const [activeView, setActiveView] = useState<LabPL07View>('pdf');

  // Simulation controls
  const [sampleCount, setSampleCount] = useState<number>(1000);
  const [seed, setSeed] = useState<number>(42);
  const [simResult, setSimResult] = useState<ContinuousSimulationResult | null>(null);

  // Snapshot
  const [snapshotName, setSnapshotName] = useState<string>('Baseline Continuous Model');
  const [snapshot, setSnapshot] = useState<PL07Snapshot | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-07',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-07: Continuous Distribution Explorer',
    });
  }, []);

  // Parse active distribution configuration
  const parsedDistResult = useMemo(() => {
    switch (distType) {
      case 'uniform': {
        const aNum = Number(uniformA);
        const bNum = Number(uniformB);
        const res = createUniform(aNum, bNum);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Uniform bounds.',
            code: res.error_code || 'E-BOUNDS-ORDER',
            dist: null,
          };
        }
        return { valid: true, error: null, code: null, dist: res.value };
      }

      case 'exponential': {
        const lamNum = Number(exponentialLambda);
        const res = createExponential(lamNum);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Exponential rate.',
            code: res.error_code || 'E-PARAM-DOMAIN',
            dist: null,
          };
        }
        return { valid: true, error: null, code: null, dist: res.value };
      }

      case 'gaussian': {
        const muNum = Number(gaussianMu);
        const sigNum = Number(gaussianSigma);
        const res = createGaussian(muNum, sigNum);
        if (res.status !== 'valid' || !res.value) {
          return {
            valid: false,
            error: res.message || 'Invalid Gaussian parameters.',
            code: res.error_code || 'E-PARAM-DOMAIN',
            dist: null,
          };
        }
        return { valid: true, error: null, code: null, dist: res.value };
      }
    }
  }, [distType, uniformA, uniformB, exponentialLambda, gaussianMu, gaussianSigma]);

  // Fallback for last valid distribution (Stale Result requirement)
  const [lastValidDist, setLastValidDist] = useState<ContinuousDistribution>(() => {
    return createUniform(0, 1).value!;
  });

  useEffect(() => {
    if (parsedDistResult.valid && parsedDistResult.dist) {
      setLastValidDist(parsedDistResult.dist);
    }
  }, [parsedDistResult]);

  const activeDist: ContinuousDistribution =
    parsedDistResult.valid && parsedDistResult.dist
      ? parsedDistResult.dist
      : lastValidDist;

  const isStale = !parsedDistResult.valid;

  // Theoretical moments
  const moments: ContinuousMoments = useMemo(() => {
    return getContinuousMoments(activeDist);
  }, [activeDist]);

  // Density curve points
  const densityCurve = useMemo(() => {
    return getContinuousDensityCurve(activeDist, 100);
  }, [activeDist]);

  // Interval query calculation
  const intervalResult = useMemo(() => {
    const low = Number(intervalLower);
    const up = Number(intervalUpper);
    const res = calculateContinuousIntervalProbability(activeDist, low, up);
    if (res.status !== 'valid' || !res.value) {
      return {
        valid: false,
        error: res.message || 'Invalid interval bounds.',
        code: res.error_code || 'E-BOUNDS-ORDER',
        data: null,
      };
    }
    return { valid: true, error: null, code: null, data: res.value };
  }, [activeDist, intervalLower, intervalUpper]);

  // Simulation handler
  const handleRunSimulation = (chosenSeed?: number) => {
    const s = chosenSeed !== undefined ? chosenSeed : seed;
    const res = simulateContinuousDistribution(activeDist, sampleCount, s, 24);
    if (res.status === 'valid' && res.value) {
      setSimResult(res.value);
    }
  };

  // Presets
  const applyPresetUniformStandard = () => {
    setDistType('uniform');
    setUniformA('0');
    setUniformB('1');
    setIntervalLower('0.2');
    setIntervalUpper('0.8');
    setSimResult(null);
  };

  const applyPresetExponentialStandard = () => {
    setDistType('exponential');
    setExponentialLambda('1.0');
    setIntervalLower('0');
    setIntervalUpper('1.0');
    setSimResult(null);
  };

  const applyPresetNormalStandard = () => {
    setDistType('gaussian');
    setGaussianMu('0');
    setGaussianSigma('1');
    setIntervalLower('-1.96');
    setIntervalUpper('1.96');
    setSimResult(null);
  };

  const applyPresetBoundsOrderError = () => {
    setDistType('uniform');
    setUniformA('3');
    setUniformB('1'); // a >= b triggers E-BOUNDS-ORDER
  };

  // Snapshot handling
  const handleSaveSnapshot = () => {
    let paramSummary = '';
    switch (activeDist.type) {
      case 'uniform':
        paramSummary = `Uniform(a=${activeDist.a}, b=${activeDist.b})`;
        break;
      case 'exponential':
        paramSummary = `Exponential(λ=${activeDist.lambda})`;
        break;
      case 'gaussian':
        paramSummary = `Normal(μ=${activeDist.mu}, σ=${activeDist.sigma})`;
        break;
    }

    setSnapshot({
      timestamp: new Date().toLocaleTimeString(),
      name: snapshotName || 'Snapshot',
      distType: activeDist.type,
      paramSummary,
      mean: moments.displayMean,
      variance: moments.displayVariance,
      intervalQuery: `[${intervalLower}, ${intervalUpper}]`,
      intervalProb: intervalResult.valid && intervalResult.data ? intervalResult.data.displayProbability : 'N/A',
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

  const { xMin, xMax, points } = densityCurve;
  const maxDensity = Math.max(
    0.5,
    ...points.map((p) => p.density),
    ...(simResult ? simResult.bins.map((b) => b.empiricalDensity) : [])
  );

  const scaleX = (x: number) => {
    return paddingLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
  };

  const scaleYDensity = (d: number) => {
    return svgHeight - paddingBottom - (d / maxDensity) * plotHeight;
  };

  const scaleYCdf = (cdf: number) => {
    return svgHeight - paddingBottom - cdf * plotHeight;
  };

  // Build SVG Path for PDF
  const pdfPathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${scaleX(points[0].x)} ${scaleYDensity(points[0].density)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${scaleX(points[i].x)} ${scaleYDensity(points[i].density)}`;
    }
    return d;
  }, [points, maxDensity, xMin, xMax]);

  // Build SVG Path for CDF
  const cdfPathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${scaleX(points[0].x)} ${scaleYCdf(points[0].cdf)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${scaleX(points[i].x)} ${scaleYCdf(points[i].cdf)}`;
    }
    return d;
  }, [points, xMin, xMax]);

  // Build Shaded Area Path for Interval Integration
  const shadedAreaD = useMemo(() => {
    if (!intervalResult.valid || !intervalResult.data) return '';
    const low = Math.max(xMin, intervalResult.data.lower);
    const up = Math.min(xMax, intervalResult.data.upper);
    if (low >= up) return '';

    const subPoints = points.filter((p) => p.x >= low && p.x <= up);
    if (subPoints.length === 0) return '';

    const firstX = scaleX(subPoints[0].x);
    const lastX = scaleX(subPoints[subPoints.length - 1].x);
    const baselineY = svgHeight - paddingBottom;

    let d = `M ${firstX} ${baselineY}`;
    for (const p of subPoints) {
      d += ` L ${scaleX(p.x)} ${scaleYDensity(p.density)}`;
    }
    d += ` L ${lastX} ${baselineY} Z`;
    return d;
  }, [points, intervalResult, maxDensity, xMin, xMax]);

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
              Guided Lab PL-07: Continuous Distribution Explorer
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #64748b)',
              }}
            >
              <strong>Learning question:</strong> How do continuous PDFs and CDFs describe probability, and how do distribution parameters affect curve shape and empirical samples?
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={applyPresetUniformStandard}
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
            onClick={applyPresetUniformStandard}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'uniform' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Uniform(0, 1)
          </button>
          <button
            onClick={applyPresetExponentialStandard}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'exponential' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Exponential(λ=1.0)
          </button>
          <button
            onClick={applyPresetNormalStandard}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: distType === 'gaussian' ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            Standard Normal(μ=0, σ=1)
          </button>
          <button
            onClick={applyPresetBoundsOrderError}
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
            Test Stale Error (a ≥ b)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: '20px',
        }}
      >
        {/* Left Column: Parameter Controls */}
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
              1. Continuous Model Family
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
                  value="uniform"
                  checked={distType === 'uniform'}
                  onChange={() => {
                    setDistType('uniform');
                    setSimResult(null);
                  }}
                />
                <strong>Uniform(a, b)</strong> — Flat density on interval [a, b]
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
                  value="exponential"
                  checked={distType === 'exponential'}
                  onChange={() => {
                    setDistType('exponential');
                    setSimResult(null);
                  }}
                />
                <strong>Exponential(λ)</strong> — Waiting time, memoryless property
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
                  value="gaussian"
                  checked={distType === 'gaussian'}
                  onChange={() => {
                    setDistType('gaussian');
                    setSimResult(null);
                  }}
                />
                <strong>Gaussian/Normal(μ, σ)</strong> — Symmetric bell curve
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
              2. Parameters
            </h3>

            {/* Uniform Controls */}
            {distType === 'uniform' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Lower Bound a:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={uniformA}
                    onChange={(e) => setUniformA(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginTop: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Upper Bound b (must satisfy b &gt; a):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={uniformB}
                    onChange={(e) => setUniformB(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginTop: '4px',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Exponential Controls */}
            {distType === 'exponential' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Rate Parameter λ &gt; 0:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={exponentialLambda}
                    onChange={(e) => setExponentialLambda(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginTop: '4px',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Gaussian Controls */}
            {distType === 'gaussian' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Mean μ:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={gaussianMu}
                    onChange={(e) => setGaussianMu(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginTop: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Standard Deviation σ &gt; 0:
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    min="0.1"
                    value={gaussianSigma}
                    onChange={(e) => setGaussianSigma(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      marginTop: '4px',
                    }}
                  />
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

          {/* Interval Inspector Card */}
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
              3. Interval Probability P(c ≤ X ≤ d)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Lower c:</label>
                <input
                  type="number"
                  step="0.1"
                  value={intervalLower}
                  onChange={(e) => setIntervalLower(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Upper d:</label>
                <input
                  type="number"
                  step="0.1"
                  value={intervalUpper}
                  onChange={(e) => setIntervalUpper(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {intervalResult.valid && intervalResult.data && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                  Interval Probability:
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                  {intervalResult.data.displayProbability}{' '}
                  <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>
                    ({(intervalResult.data.probability * 100).toFixed(2)}%)
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>
                  {intervalResult.data.endpointNote}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Snapshot Card */}
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
                <div style={{ color: '#475569' }}>{snapshot.paramSummary}</div>
                <div style={{ marginTop: '4px', color: '#334155' }}>
                  Mean: <strong>{snapshot.mean}</strong> | Var: <strong>{snapshot.variance}</strong>
                </div>
                <div style={{ color: '#166534', fontSize: '0.75rem' }}>
                  P{snapshot.intervalQuery} = {snapshot.intervalProb}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualization & Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Moments Readout */}
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
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                <MathView math={`E[X] = ${moments.displayMean}`} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Theoretical Variance Var(X):
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                <MathView math={`\\text{Var}(X) = ${moments.displayVariance}`} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Standard Deviation σ:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                {moments.stdDev.toFixed(4)}
              </div>
            </div>

            <div
              style={{
                padding: '6px 10px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#1e40af',
              }}
            >
              <strong>Crucial Principle:</strong> The vertical height f(x) is <em>probability density</em>, NOT point probability! P(X = x) = 0 for any single point.
            </div>
          </div>

          {/* Interactive Curve Visualizer */}
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
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveView('pdf')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: activeView === 'pdf' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: activeView === 'pdf' ? '#eff6ff' : '#ffffff',
                    color: activeView === 'pdf' ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  PDF Density Curve f(x)
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
                  Cumulative CDF F(x)
                </button>
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
                  Both Curves
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '3px',
                      background: '#2563eb',
                      display: 'inline-block',
                    }}
                  />
                  PDF Curve
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '10px',
                      background: 'rgba(37, 99, 235, 0.25)',
                      display: 'inline-block',
                    }}
                  />
                  Shaded Area P(c ≤ X ≤ d)
                </span>
                {simResult && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '10px',
                        background: 'rgba(245, 158, 11, 0.4)',
                        display: 'inline-block',
                      }}
                    />
                    Empirical Histogram
                  </span>
                )}
              </div>
            </div>

            {/* SVG Plot */}
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
                  const val = frac * maxDensity;
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

                {/* Shaded Area for Interval Integration */}
                {(activeView === 'pdf' || activeView === 'both') && shadedAreaD && (
                  <path d={shadedAreaD} fill="rgba(37, 99, 235, 0.25)" />
                )}

                {/* Empirical Histogram Bins */}
                {simResult &&
                  (activeView === 'pdf' || activeView === 'both') &&
                  simResult.bins.map((b, idx) => {
                    const bx = scaleX(b.binStart);
                    const bw = scaleX(b.binEnd) - bx;
                    const bh = (b.empiricalDensity / maxDensity) * plotHeight;
                    const by = svgHeight - paddingBottom - bh;
                    return (
                      <rect
                        key={idx}
                        x={bx}
                        y={by}
                        width={Math.max(1, bw - 1)}
                        height={bh}
                        fill="#f59e0b"
                        opacity={0.35}
                        stroke="#d97706"
                        strokeWidth="0.5"
                      >
                        <title>{`Bin [${b.binStart.toFixed(2)}, ${b.binEnd.toFixed(2)}]: Density = ${b.empiricalDensity.toFixed(4)}, Count = ${b.count}`}</title>
                      </rect>
                    );
                  })}

                {/* PDF Density Curve */}
                {(activeView === 'pdf' || activeView === 'both') && (
                  <path d={pdfPathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                )}

                {/* CDF Curve */}
                {(activeView === 'cdf' || activeView === 'both') && (
                  <path
                    d={cdfPathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray={activeView === 'both' ? '4,4' : 'none'}
                  />
                )}

                {/* X-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                  const xVal = xMin + frac * (xMax - xMin);
                  const xPos = scaleX(xVal);
                  return (
                    <g key={frac}>
                      <line
                        x1={xPos}
                        y1={svgHeight - paddingBottom}
                        x2={xPos}
                        y2={svgHeight - paddingBottom + 4}
                        stroke="#64748b"
                      />
                      <text
                        x={xPos}
                        y={svgHeight - paddingBottom + 16}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="middle"
                      >
                        {xVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={paddingLeft + plotWidth / 2}
                  y={svgHeight - 10}
                  fontSize="12"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                >
                  Continuous Real Value x
                </text>

                <text
                  x={15}
                  y={paddingTop + plotHeight / 2}
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                  transform={`rotate(-90 15 ${paddingTop + plotHeight / 2})`}
                >
                  {activeView === 'cdf' ? 'Cumulative F(x)' : 'Probability Density f(x)'}
                </text>
              </svg>
            </div>
          </div>

          {/* Simulation Card */}
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
                Continuous PRNG Sampling & Histogram Overlay
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
                Inversion / Box-Muller PRNG
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
                  <strong>First 20 Samples:</strong> [
                  {simResult.samplesPreview.map((s) => s.toFixed(3)).join(', ')}...]
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
