import React, { useState, useMemo, useEffect } from 'react';
import {
  simulateClt,
  getBaseDistributionMoments,
  CltBaseDistributionType,
  CltSimulationResult,
} from '../../core/math/clt';
import { MathView } from './MathView';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

export const LabPL11: React.FC<{ onNavigate?: (route: string, params?: Record<string, string>) => void }> = ({
  onNavigate,
}) => {
  // Model state
  const [baseType, setBaseType] = useState<CltBaseDistributionType>('uniform');
  const [uniformA, setUniformA] = useState<number>(0);
  const [uniformB, setUniformB] = useState<number>(1);
  const [expLambda, setExpLambda] = useState<number>(1);
  const [bernoulliP, setBernoulliP] = useState<number>(0.5);

  // Sample size n
  const [sampleSizeN, setSampleSizeN] = useState<number>(5);

  // Simulation controls
  const [trialCount, setTrialCount] = useState<number>(1000);
  const [seed, setSeed] = useState<number>(42);
  const [lastRunSeed, setLastRunSeed] = useState<number>(42);

  // Snapshot state
  const [snapshotName, setSnapshotName] = useState<string>('Uniform n=5');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() => {
    return LocalPersistenceService.getLabSnapshot('PL-11');
  });

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-11',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-11: Central Limit Theorem & Sums of IID Variables',
    });
  }, []);

  // Compute Base Moments
  const baseMoments = useMemo(() => {
    return getBaseDistributionMoments({
      type: baseType,
      uniformA,
      uniformB,
      expLambda,
      bernoulliP,
    });
  }, [baseType, uniformA, uniformB, expLambda, bernoulliP]);

  // Simulation Calculation
  const simResult = useMemo(() => {
    const res = simulateClt(
      {
        type: baseType,
        uniformA,
        uniformB,
        expLambda,
        bernoulliP,
      },
      sampleSizeN,
      trialCount,
      seed
    );
    return res;
  }, [baseType, uniformA, uniformB, expLambda, bernoulliP, sampleSizeN, trialCount, seed]);

  const activeSimulation: CltSimulationResult | null = simResult.status === 'valid' ? simResult.value : null;

  const handleRunNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);
    setLastRunSeed(newSeed);
  };

  const handleReplaySeed = () => {
    setSeed(lastRunSeed);
  };

  const handleSaveSnapshot = (includeSim = false) => {
    if (!snapshotName.trim()) return;
    const snap: LabComparisonSnapshot = {
      lab_id: 'PL-11',
      snapshot_id: `snap_pl11_${Date.now()}`,
      name: snapshotName.trim(),
      timestamp: new Date().toLocaleString(),
      settings: {
        baseType,
        sampleSizeN,
        uniformA,
        uniformB,
        expLambda,
        bernoulliP,
      },
      theoreticalOutputs: {
        baseMean: baseMoments.mean,
        baseVariance: baseMoments.variance,
        sumMean: sampleSizeN * baseMoments.mean,
        sumVariance: sampleSizeN * baseMoments.variance,
      },
      simulationOutputs: includeSim && activeSimulation
        ? {
            trialCount,
            seed,
            empiricalMeanZ: activeSimulation.empiricalMeanZ,
            empiricalVarianceZ: activeSimulation.empiricalVarianceZ,
            maxDensityError: activeSimulation.maxDensityError,
          }
        : undefined,
    };

    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const s = savedSnapshot.settings;
    if (s.baseType) setBaseType(s.baseType);
    if (s.sampleSizeN) setSampleSizeN(s.sampleSizeN);
    if (s.uniformA !== undefined) setUniformA(s.uniformA);
    if (s.uniformB !== undefined) setUniformB(s.uniformB);
    if (s.expLambda !== undefined) setExpLambda(s.expLambda);
    if (s.bernoulliP !== undefined) setBernoulliP(s.bernoulliP);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-11');
    setSavedSnapshot(null);
  };

  const handleResetDefaults = () => {
    setBaseType('uniform');
    setUniformA(0);
    setUniformB(1);
    setExpLambda(1);
    setBernoulliP(0.5);
    setSampleSizeN(5);
    setTrialCount(1000);
    setSeed(42);
    setLastRunSeed(42);
    setSnapshotName('Uniform n=5 Default');
  };

  // Render SVG Histogram & Gaussian Density Curve
  const renderHistogramSvg = () => {
    if (!activeSimulation) return null;
    const { bins } = activeSimulation;

    const svgWidth = 560;
    const svgHeight = 260;
    const padX = 45;
    const padY = 30;
    const plotW = svgWidth - 2 * padX;
    const plotH = svgHeight - 2 * padY;

    // Normalizing ranges: Z in [-3.6, 3.6], Density in [0, 0.5]
    const zMin = -3.6;
    const zMax = 3.6;
    const maxDensity = 0.48;

    const mapX = (z: number) => padX + ((z - zMin) / (zMax - zMin)) * plotW;
    const mapY = (d: number) => padY + plotH - (Math.min(d, maxDensity) / maxDensity) * plotH;

    // Generate path for theoretical standard normal density phi(z)
    let bellCurvePath = '';
    const numPoints = 80;
    for (let i = 0; i <= numPoints; i++) {
      const z = zMin + (i / numPoints) * (zMax - zMin);
      const d = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      const px = mapX(z);
      const py = mapY(d);
      bellCurvePath += `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)} `;
    }

    return (
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      >
        {/* Grid lines */}
        {[0, 0.1, 0.2, 0.3, 0.4].map((d) => (
          <g key={d}>
            <line
              x1={padX}
              y1={mapY(d)}
              x2={padX + plotW}
              y2={mapY(d)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text x={padX - 8} y={mapY(d) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
              {d.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X axis ticks */}
        {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
          <g key={z}>
            <line
              x1={mapX(z)}
              y1={padY + plotH}
              x2={mapX(z)}
              y2={padY + plotH + 5}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text x={mapX(z)} y={padY + plotH + 18} fontSize="11" fill="#64748b" textAnchor="middle">
              {z > 0 ? `+${z}` : z}
            </text>
          </g>
        ))}

        {/* Empirical Histogram Bars */}
        {bins.map((b, idx) => {
          const bx0 = mapX(b.x0);
          const bx1 = mapX(b.x1);
          const barW = Math.max(1, bx1 - bx0 - 1);
          const barH = ((Math.min(b.empiricalDensity, maxDensity)) / maxDensity) * plotH;
          const by = padY + plotH - barH;

          return (
            <rect
              key={idx}
              x={bx0}
              y={by}
              width={barW}
              height={barH}
              fill="#93c5fd"
              stroke="#3b82f6"
              strokeWidth="0.8"
              opacity="0.85"
            >
              <title>{`Bin [${b.x0.toFixed(2)}, ${b.x1.toFixed(2)}]: Density = ${b.empiricalDensity.toFixed(4)} (Count = ${b.count})`}</title>
            </rect>
          );
        })}

        {/* Theoretical Gaussian Bell Curve Overlay */}
        <path d={bellCurvePath} fill="none" stroke="#dc2626" strokeWidth="2.5" />

        {/* Center Mean Guide Line */}
        <line
          x1={mapX(0)}
          y1={padY}
          x2={mapX(0)}
          y2={padY + plotH}
          stroke="#dc2626"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Legend */}
        <g transform={`translate(${padX + 15}, ${padY + 15})`}>
          <rect x="0" y="0" width="14" height="10" fill="#93c5fd" stroke="#3b82f6" />
          <text x="20" y="9" fontSize="11" fill="#334155" fontWeight="600">
            Empirical Histogram of Standardized Z_n
          </text>

          <line x1="0" y1="20" x2="16" y2="20" stroke="#dc2626" strokeWidth="2.5" />
          <text x="20" y="24" fontSize="11" fill="#dc2626" fontWeight="700">
            Theoretical N(0, 1) Gaussian Density
          </text>
        </g>
      </svg>
    );
  };

  return (
    <LabShell
      labId="PL-11"
      labTitle="Central Limit Theorem & Sums of IID Variables"
      labSubtitle="Investigate convolution of IID random variables Sn = Σ Xi and asymptotic convergence of standardized Zn = (Sn - nμ)/(σ√n) to N(0,1)."
      sourceAttribution={{
        part: 'Part 2 & Part 3',
        chapter: 'Chapter 15: Simulation & IID Sequences',
        isIllustrative: false,
      }}
      linkedModuleIds={['M15', 'M21']}
      linkedConceptIds={['C-000043']}
      isStale={simResult.status !== 'valid'}
      errorCode={simResult.error_code}
      errorMessage={simResult.message}
      snapshotName={snapshotName}
      onSnapshotNameChange={setSnapshotName}
      savedSnapshot={savedSnapshot}
      onSaveSnapshot={handleSaveSnapshot}
      onRestoreSnapshot={handleRestoreSnapshot}
      onDeleteSnapshot={handleDeleteSnapshot}
      onReset={handleResetDefaults}
      onNavigate={onNavigate}
      renderSnapshotComparison={(saved) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', background: '#eff6ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#1d4ed8' }}>Active Configuration</h4>
            <div>Base Distribution: <strong>{baseType.toUpperCase()}</strong></div>
            <div>Sample Size n: <strong>{sampleSizeN}</strong></div>
            <div>Sum E[Sn]: <strong>{(sampleSizeN * baseMoments.mean).toFixed(4)}</strong></div>
            <div>Sum Var(Sn): <strong>{(sampleSizeN * baseMoments.variance).toFixed(4)}</strong></div>
            {activeSimulation && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #dbeafe' }}>
                <div>Empirical E[Zn]: <strong>{activeSimulation.empiricalMeanZ.toFixed(4)}</strong> (Target: 0)</div>
                <div>Empirical Var(Zn): <strong>{activeSimulation.empiricalVarianceZ.toFixed(4)}</strong> (Target: 1)</div>
              </div>
            )}
          </div>
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '6px', padding: '1rem', background: '#faf5ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#7e22ce' }}>Saved: "{saved.name}"</h4>
            <div>Base Distribution: <strong>{saved.settings.baseType?.toUpperCase()}</strong></div>
            <div>Sample Size n: <strong>{saved.settings.sampleSizeN}</strong></div>
            <div>Sum E[Sn]: <strong>{saved.theoreticalOutputs?.sumMean?.toFixed(4)}</strong></div>
            <div>Sum Var(Sn): <strong>{saved.theoreticalOutputs?.sumVariance?.toFixed(4)}</strong></div>
            {saved.simulationOutputs && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f3e8ff' }}>
                <div>Empirical E[Zn]: <strong>{saved.simulationOutputs.empiricalMeanZ?.toFixed(4)}</strong></div>
                <div>Empirical Var(Zn): <strong>{saved.simulationOutputs.empiricalVarianceZ?.toFixed(4)}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Interactive Controls */}
        <div>
          {/* Base Distribution Selector */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
              1. Select Base Distribution (X_i)
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {(['uniform', 'exponential', 'bernoulli', 'die', 'bimodal'] as CltBaseDistributionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setBaseType(type)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: baseType === type ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    background: baseType === type ? '#eff6ff' : '#ffffff',
                    color: baseType === type ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'uniform' && 'Uniform U(a,b)'}
                  {type === 'exponential' && 'Exponential (λ)'}
                  {type === 'bernoulli' && 'Bernoulli (p)'}
                  {type === 'die' && 'Fair 6-Sided Die'}
                  {type === 'bimodal' && 'Bimodal Mixture (±2)'}
                </button>
              ))}
            </div>

            {/* Parameter sliders based on baseType */}
            {baseType === 'uniform' && (
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>
                    Bound a: <strong>{uniformA}</strong>
                    <input
                      type="range"
                      min="-5"
                      max="2"
                      step="0.5"
                      value={uniformA}
                      onChange={(e) => setUniformA(parseFloat(e.target.value))}
                      style={{ display: 'block', width: '130px', marginTop: '4px' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.85rem' }}>
                    Bound b: <strong>{uniformB}</strong>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={uniformB}
                      onChange={(e) => setUniformB(parseFloat(e.target.value))}
                      style={{ display: 'block', width: '130px', marginTop: '4px' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {baseType === 'exponential' && (
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Rate Parameter λ: <strong>{expLambda}</strong> (Highly skewed when n=1)
                  <input
                    type="range"
                    min="0.2"
                    max="5"
                    step="0.2"
                    value={expLambda}
                    onChange={(e) => setExpLambda(parseFloat(e.target.value))}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  />
                </label>
              </div>
            )}

            {baseType === 'bernoulli' && (
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Success Probability p: <strong>{bernoulliP}</strong>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={bernoulliP}
                    onChange={(e) => setBernoulliP(parseFloat(e.target.value))}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  />
                </label>
              </div>
            )}

            {/* Base Moments Summary Card */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
              Base Mean: <code>μ = {baseMoments.mean.toFixed(3)}</code> &bull; Base Variance: <code>σ² = {baseMoments.variance.toFixed(3)}</code> &bull; Std Dev: <code>σ = {baseMoments.stdDev.toFixed(3)}</code>
            </div>
          </div>

          {/* Sample Size Slider n in [1, 50] */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                2. Number of IID Variables in Sum (n)
              </h3>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>
                n = {sampleSizeN}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={sampleSizeN}
              onChange={(e) => setSampleSizeN(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              <span>n = 1 (Base Shape)</span>
              <span>n = 5</span>
              <span>n = 15</span>
              <span>n = 30</span>
              <span>n = 50 (Gaussian)</span>
            </div>

            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong>Sum Moments: </strong>
              E[S_n] = nμ = <strong>{(sampleSizeN * baseMoments.mean).toFixed(2)}</strong> &bull;
              Var(S_n) = nσ² = <strong>{(sampleSizeN * baseMoments.variance).toFixed(2)}</strong> &bull;
              StdDev = <strong>{(baseMoments.stdDev * Math.sqrt(sampleSizeN)).toFixed(2)}</strong>
            </div>
          </div>

          {/* Simulation Run Controls */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
              3. Monte Carlo Simulation Engine
            </h3>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem' }}>
                Trials N:
                <select
                  value={trialCount}
                  onChange={(e) => setTrialCount(parseInt(e.target.value, 10))}
                  style={{ marginLeft: '6px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value={100}>100 trials</option>
                  <option value={1000}>1,000 trials</option>
                  <option value={10000}>10,000 trials</option>
                </select>
              </label>

              <label style={{ fontSize: '0.85rem' }}>
                Seed:
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                  style={{ marginLeft: '6px', width: '90px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                </input>
              </label>

              <button
                onClick={handleRunNewSeed}
                className="btn-primary btn-sm"
                style={{ padding: '6px 12px' }}
              >
                ▶ Run New Seed
              </button>

              <button
                onClick={handleReplaySeed}
                className="btn-secondary btn-sm"
                style={{ padding: '6px 10px' }}
                title="Replay with last seed"
              >
                ↺ Replay Seed
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Generates N independent sum samples S_n, standardizes to Z_n, and computes histogram density.
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Convergence Analysis */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Standardized Sum Distribution vs. N(0, 1)
              </h3>
              <span className="badge badge-source">CAL-CLT-001</span>
            </div>

            <div style={{ margin: '0.5rem 0 1rem', textAlign: 'center' }}>
              <MathView
                math={`Z_n = \\frac{S_n - n\\mu}{\\sigma \\sqrt{n}} \\xrightarrow{d} \\mathcal{N}(0, 1) \\quad \\text{as } n \\to \\infty`}
                block
              />
            </div>

            {/* Interactive SVG Histogram */}
            {renderHistogramSvg()}

            {/* Convergence Statistics Table */}
            {activeSimulation && (
              <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>Metric</th>
                      <th style={{ padding: '6px 8px' }}>Theoretical Target</th>
                      <th style={{ padding: '6px 8px' }}>Empirical (N={trialCount})</th>
                      <th style={{ padding: '6px 8px' }}>Abs Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>Standardized Mean E[Z_n]</td>
                      <td style={{ padding: '6px 8px' }}>0.0000</td>
                      <td style={{ padding: '6px 8px' }}>{activeSimulation.empiricalMeanZ.toFixed(4)}</td>
                      <td style={{ padding: '6px 8px', color: '#2563eb' }}>
                        {Math.abs(activeSimulation.empiricalMeanZ).toFixed(4)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>Standardized Variance Var(Z_n)</td>
                      <td style={{ padding: '6px 8px' }}>1.0000</td>
                      <td style={{ padding: '6px 8px' }}>{activeSimulation.empiricalVarianceZ.toFixed(4)}</td>
                      <td style={{ padding: '6px 8px', color: '#2563eb' }}>
                        {Math.abs(activeSimulation.empiricalVarianceZ - 1.0).toFixed(4)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>Max Density Curve Discrepancy</td>
                      <td style={{ padding: '6px 8px' }}>0.0000</td>
                      <td style={{ padding: '6px 8px' }}>{activeSimulation.maxDensityError.toFixed(4)}</td>
                      <td style={{ padding: '6px 8px', color: activeSimulation.maxDensityError < 0.1 ? '#16a34a' : '#ea580c' }}>
                        {activeSimulation.maxDensityError < 0.1 ? '✓ Strong Gaussian Fit' : 'Approaching Normal'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </LabShell>
  );
};
