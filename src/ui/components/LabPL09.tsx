import React, { useState, useMemo, useEffect } from 'react';
import {
  JointModelType,
  RectangleBounds,
  createDiscreteJointTable,
  queryDiscreteRectangleProbability,
  queryContinuousBoundaryEvent,
  queryContinuousTriangularRectangle,
  checkJointIndependence,
  simulateJointDistribution,
  DiscreteJointResult,
  JointSimulationResult,
} from '../../core/math/joint';
import { rationalToDecimal } from '../../core/math/rational';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

export type QueryRegionType = 'rectangle' | 'boundary';

export interface LabPL09Props {
  onNavigate?: (route: string, params?: Record<string, string>) => void;
  initialPreset?: string;
}

export const LabPL09: React.FC<LabPL09Props> = ({ onNavigate, initialPreset }) => {
  // Model selector
  const [modelType, setModelType] = useState<JointModelType>('discrete');

  // Discrete 2x2 Joint Mass Inputs
  const [cell00, setCell00] = useState<string>('0.25');
  const [cell01, setCell01] = useState<string>('0.25');
  const [cell10, setCell10] = useState<string>('0.25');
  const [cell11, setCell11] = useState<string>('0.25');

  // Region Query State
  const [regionType, setRegionType] = useState<QueryRegionType>('rectangle');
  const [rectXMin, setRectXMin] = useState<string>('0');
  const [rectXMax, setRectXMax] = useState<string>('1');
  const [rectYMin, setRectYMin] = useState<string>('0');
  const [rectYMax, setRectYMax] = useState<string>('1');
  const [boundaryC, setBoundaryC] = useState<string>('0.5');

  // Independence comparison toggle
  const [showIndependence, setShowIndependence] = useState<boolean>(false);

  // Simulation State
  const [sampleCount, setSampleCount] = useState<number>(1000);
  const [seed, setSeed] = useState<number>(42);
  const [simResult, setSimResult] = useState<JointSimulationResult | null>(null);

  // Snapshot State (LabShell managed)
  const [snapshotName, setSnapshotName] = useState<string>('Joint Baseline');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() =>
    LocalPersistenceService.getLabSnapshot('PL-09')
  );

  // Stale Results Cache
  const [lastValidDiscrete, setLastValidDiscrete] = useState<DiscreteJointResult | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-09',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-09: Joint Distribution and Marginals Lab',
    });
  }, []);

  // Compute Discrete Joint Table
  const discreteCalc = useMemo(() => {
    return createDiscreteJointTable(
      [0, 1],
      [0, 1],
      [
        [cell00, cell01],
        [cell10, cell11],
      ]
    );
  }, [cell00, cell01, cell10, cell11]);

  const isDiscreteValid = discreteCalc.status === 'valid' && !!discreteCalc.value;

  useEffect(() => {
    if (isDiscreteValid && discreteCalc.value) {
      setLastValidDiscrete(discreteCalc.value);
    }
  }, [isDiscreteValid, discreteCalc.value]);

  const activeDiscrete: DiscreteJointResult | null = isDiscreteValid
    ? discreteCalc.value!
    : lastValidDiscrete;

  // Normalization repair handler
  const handleNormalizeRepair = () => {
    const v00 = Math.max(0, Number(cell00) || 0);
    const v01 = Math.max(0, Number(cell01) || 0);
    const v10 = Math.max(0, Number(cell10) || 0);
    const v11 = Math.max(0, Number(cell11) || 0);
    const sum = v00 + v01 + v10 + v11;
    if (sum > 0) {
      setCell00((v00 / sum).toFixed(4));
      setCell01((v01 / sum).toFixed(4));
      setCell10((v10 / sum).toFixed(4));
      setCell11((v11 / sum).toFixed(4));
    }
  };

  // Rectangle bounds
  const parsedBounds: RectangleBounds = useMemo(() => {
    return {
      xMin: Number(rectXMin),
      xMax: Number(rectXMax),
      yMin: Number(rectYMin),
      yMax: Number(rectYMax),
    };
  }, [rectXMin, rectXMax, rectYMin, rectYMax]);

  // Compute Region Query Probability
  const regionQueryResult = useMemo(() => {
    if (modelType === 'discrete') {
      if (!activeDiscrete) return null;
      return queryDiscreteRectangleProbability(activeDiscrete.table, parsedBounds);
    } else {
      // Continuous Triangular
      if (regionType === 'boundary') {
        return queryContinuousBoundaryEvent(Number(boundaryC));
      } else {
        return queryContinuousTriangularRectangle(parsedBounds);
      }
    }
  }, [modelType, regionType, activeDiscrete, parsedBounds, boundaryC]);

  // Independence check
  const indepResult = useMemo(() => {
    if (modelType === 'discrete') {
      if (!activeDiscrete) return null;
      return checkJointIndependence({ type: 'discrete', data: activeDiscrete });
    } else {
      return checkJointIndependence({ type: 'continuous_triangular' });
    }
  }, [modelType, activeDiscrete]);

  // Simulation handler
  const handleRunSimulation = (overrideSeed?: number) => {
    const runSeed = overrideSeed !== undefined ? overrideSeed : Math.floor(Math.random() * 1000000);
    if (overrideSeed === undefined) {
      setSeed(runSeed);
    }

    if (modelType === 'discrete') {
      if (!activeDiscrete) return;
      const res = simulateJointDistribution(
        { type: 'discrete', data: activeDiscrete },
        sampleCount,
        runSeed,
        parsedBounds
      );
      setSimResult(res);
    } else {
      const res = simulateJointDistribution(
        { type: 'continuous_triangular' },
        sampleCount,
        runSeed,
        regionType === 'rectangle' ? parsedBounds : undefined,
        regionType === 'boundary' ? Number(boundaryC) : undefined
      );
      setSimResult(res);
    }
  };

  useEffect(() => {
    if (!initialPreset) return;
    if (
      initialPreset === 'indep_2x2' ||
      initialPreset === 'diag_dependent' ||
      initialPreset === 'triangular_boundary' ||
      initialPreset === 'triangular_rect'
    ) {
      applyPreset(initialPreset);
    }
  }, [initialPreset]);

  // Snapshot handlers
  const handleSaveSnapshot = () => {
    if (!regionQueryResult || !indepResult) return;
    const snap: LabComparisonSnapshot = {
      lab_id: 'PL-09',
      name: snapshotName || 'Joint Snapshot',
      timestamp: new Date().toISOString(),
      parameters: {
        modelType,
        cell00,
        cell01,
        cell10,
        cell11,
        regionType,
        rectXMin,
        rectXMax,
        rectYMin,
        rectYMax,
        boundaryC,
        showIndependence,
      },
      results: {
        modelType,
        theoreticalProb: (regionQueryResult.value?.probability ?? 0).toFixed(4),
        independenceVerdict: indepResult.value?.isIndependent ? 'Independent' : 'Dependent',
        simProb:
          simResult?.empiricalBoundaryProb !== undefined
            ? simResult.empiricalBoundaryProb.toFixed(4)
            : simResult?.empiricalRectangleProb !== undefined
            ? simResult.empiricalRectangleProb.toFixed(4)
            : undefined,
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const p = savedSnapshot.parameters;
    if (p.modelType) setModelType(p.modelType as JointModelType);
    if (p.cell00) setCell00(String(p.cell00));
    if (p.cell01) setCell01(String(p.cell01));
    if (p.cell10) setCell10(String(p.cell10));
    if (p.cell11) setCell11(String(p.cell11));
    if (p.regionType) setRegionType(p.regionType as QueryRegionType);
    if (p.rectXMin) setRectXMin(String(p.rectXMin));
    if (p.rectXMax) setRectXMax(String(p.rectXMax));
    if (p.rectYMin) setRectYMin(String(p.rectYMin));
    if (p.rectYMax) setRectYMax(String(p.rectYMax));
    if (p.boundaryC) setBoundaryC(String(p.boundaryC));
    if (p.showIndependence !== undefined) setShowIndependence(Boolean(p.showIndependence));
    setSimResult(null);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-09');
    setSavedSnapshot(null);
  };

  const handleReset = () => {
    setModelType('discrete');
    setCell00('0.25');
    setCell01('0.25');
    setCell10('0.25');
    setCell11('0.25');
    setRegionType('rectangle');
    setRectXMin('0');
    setRectXMax('1');
    setRectYMin('0');
    setRectYMax('1');
    setBoundaryC('0.5');
    setShowIndependence(false);
    setSimResult(null);
  };

  // Curriculum Presets
  const applyPreset = (preset: 'indep_2x2' | 'diag_dependent' | 'triangular_boundary' | 'triangular_rect') => {
    setSimResult(null);
    if (preset === 'indep_2x2') {
      setModelType('discrete');
      setCell00('0.25');
      setCell01('0.25');
      setCell10('0.25');
      setCell11('0.25');
      setRegionType('rectangle');
      setShowIndependence(true);
    } else if (preset === 'diag_dependent') {
      setModelType('discrete');
      setCell00('0.40');
      setCell01('0.10');
      setCell10('0.10');
      setCell11('0.40');
      setRegionType('rectangle');
      setShowIndependence(true);
    } else if (preset === 'triangular_boundary') {
      setModelType('continuous_triangular');
      setRegionType('boundary');
      setBoundaryC('0.5');
      setShowIndependence(true);
    } else if (preset === 'triangular_rect') {
      setModelType('continuous_triangular');
      setRegionType('rectangle');
      setRectXMin('0');
      setRectXMax('0.5');
      setRectYMin('0.5');
      setRectYMax('1.0');
      setShowIndependence(false);
    }
  };

  return (
    <LabShell
      labId="PL-09"
      labTitle="Joint and Marginals Lab"
      labSubtitle="How do joint discrete tables and continuous densities collapse via marginalization into individual distributions, and how are non-rectangular regions integrated?"
      sourceAttribution={{
        part: 'Part 3',
        chapter: 'Chapters 16–18: Joint distributions, continuous joint densities, and marginal densities',
        isIllustrative: true,
      }}
      linkedModuleIds={['M16', 'M17', 'M18']}
      linkedConceptIds={['C-000031', 'C-000032', 'C-000033', 'C-000034', 'C-000035', 'C-000036']}
      isStale={modelType === 'discrete' && !isDiscreteValid}
      errorCode={modelType === 'discrete' && !isDiscreteValid ? discreteCalc.error_code || 'E-PROB-SUM' : undefined}
      errorMessage={modelType === 'discrete' && !isDiscreteValid ? discreteCalc.message || 'Invalid parameters.' : undefined}
      repairEligible={modelType === 'discrete' && !isDiscreteValid}
      onApplyRepair={handleNormalizeRepair}
      snapshotName={snapshotName}
      onSnapshotNameChange={setSnapshotName}
      savedSnapshot={savedSnapshot}
      onSaveSnapshot={handleSaveSnapshot}
      onRestoreSnapshot={handleRestoreSnapshot}
      onDeleteSnapshot={handleDeleteSnapshot}
      onReset={handleReset}
      onNavigate={onNavigate}
      renderSnapshotComparison={(saved) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', background: '#eff6ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#1d4ed8' }}>Active Configuration</h4>
            <div>Model: <strong>{modelType.toUpperCase()}</strong></div>
            <div>Probability: <strong>{(regionQueryResult?.value?.probability ?? 0).toFixed(4)}</strong></div>
            <div>Independence: <strong>{indepResult?.value?.isIndependent ? 'Independent' : 'Dependent'}</strong></div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Saved: {saved.name}</h4>
            <div>Model: <strong>{String(saved.parameters.modelType ?? '').toUpperCase()}</strong></div>
            <div>Probability: <strong>{saved.results?.theoreticalProb ?? 'N/A'}</strong></div>
            <div>Independence: <strong>{saved.results?.independenceVerdict ?? 'N/A'}</strong></div>
          </div>
        </div>
      )}
    >
      <div className="space-y-6">
        {/* Presets Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2">Presets:</span>
          <button
            onClick={() => applyPreset('indep_2x2')}
            className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            2x2 Independent
          </button>
          <button
            onClick={() => applyPreset('diag_dependent')}
            className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            2x2 Diagonal Dependent
          </button>
          <button
            onClick={() => applyPreset('triangular_boundary')}
            className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Continuous Triangular Boundary (Y &gt; X + c)
          </button>
          <button
            onClick={() => applyPreset('triangular_rect')}
            className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Continuous Triangular Rectangle
          </button>
        </div>

      {/* Main Grid: Controls & Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Model Mode Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              1. Bivariate Model Family
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setModelType('discrete');
                  setSimResult(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  modelType === 'discrete'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Discrete 2×2 Table
              </button>
              <button
                onClick={() => {
                  setModelType('continuous_triangular');
                  setSimResult(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  modelType === 'continuous_triangular'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Continuous Triangular
              </button>
            </div>

            {/* Discrete 2x2 Input Grid */}
            {modelType === 'discrete' && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Joint Mass Table p(x, y)</span>
                  <span className="font-mono text-indigo-400">Support: {'{0, 1} × {0, 1}'}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="grid grid-cols-3 text-center text-xs font-mono text-slate-400 pb-1 border-b border-slate-800">
                    <span>X \ Y</span>
                    <span>Y = 0</span>
                    <span>Y = 1</span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 text-center">X = 0</span>
                    <input
                      type="text"
                      value={cell00}
                      onChange={(e) => setCell00(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={cell01}
                      onChange={(e) => setCell01(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 text-center">X = 1</span>
                    <input
                      type="text"
                      value={cell10}
                      onChange={(e) => setCell10(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={cell11}
                      onChange={(e) => setCell11(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Continuous Triangular Description */}
            {modelType === 'continuous_triangular' && (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2 text-slate-300">
                <div className="font-semibold text-white">Triangular Joint Density Preset:</div>
                <div className="font-mono text-sky-300">
                  f(x, y) = 2 \quad (0 &lt; x &lt; y &lt; 1)
                </div>
                <div className="text-[11px] text-slate-400">
                  The joint density is constant (2.0) on the upper triangular region and 0 elsewhere. Total volume under the surface integrates to 1.
                </div>
              </div>
            )}
          </div>

          {/* Region Query Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              2. Probability Region Query
            </h3>

            {modelType === 'continuous_triangular' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRegionType('rectangle')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                    regionType === 'rectangle'
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rectangle [x] × [y]
                </button>
                <button
                  onClick={() => setRegionType('boundary')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                    regionType === 'boundary'
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Event Y &gt; X + c
                </button>
              </div>
            )}

            {/* Rectangle Bounds Inputs */}
            {(modelType === 'discrete' || regionType === 'rectangle') && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">X Min</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rectXMin}
                      onChange={(e) => setRectXMin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">X Max</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rectXMax}
                      onChange={(e) => setRectXMax(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Y Min</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rectYMin}
                      onChange={(e) => setRectYMin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Y Max</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rectYMax}
                      onChange={(e) => setRectYMax(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Continuous Boundary Event Slider */}
            {modelType === 'continuous_triangular' && regionType === 'boundary' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Threshold c (Y &gt; X + c)</span>
                  <span className="font-mono text-sky-400">{boundaryC}</span>
                </div>
                <input
                  type="range"
                  min="-0.2"
                  max="1.2"
                  step="0.05"
                  value={boundaryC}
                  onChange={(e) => setBoundaryC(e.target.value)}
                  className="w-full accent-sky-500"
                />
                <div className="text-[11px] text-slate-500">
                  Analytical formula: P(Y &gt; X + c) = (1 - c)² for 0 ≤ c ≤ 1.
                </div>
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Curriculum Presets</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => applyPreset('indep_2x2')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-indigo-400">Independent 2×2</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Equal 0.25 mass cells</div>
              </button>
              <button
                onClick={() => applyPreset('diag_dependent')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-rose-400">Dependent 2×2</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Correlated diagonals</div>
              </button>
              <button
                onClick={() => applyPreset('triangular_boundary')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-sky-400">Golden Event c=0.5</div>
                <div className="text-[10px] text-slate-500 mt-0.5">P(Y &gt; X + 0.5) = 0.25</div>
              </button>
              <button
                onClick={() => applyPreset('triangular_rect')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-emerald-400">Triangular Rect</div>
                <div className="text-[10px] text-slate-500 mt-0.5">[0, 0.5] × [0.5, 1.0]</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Visualizer & Calculation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>2D Joint Support & Probability Surface</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                    {modelType}
                  </span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {modelType === 'discrete'
                    ? 'Row and column marginals obtained via summation'
                    : 'Marginals: f_X(x) = 2(1 - x) and f_Y(y) = 2y'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIndependence(!showIndependence)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
                    showIndependence
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {showIndependence ? 'Hide Independence Test' : 'Compare Independence'}
                </button>
              </div>
            </div>

            {/* Visual 2D Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG 2D Canvas */}
              <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
                <svg className="w-64 h-64" viewBox="0 0 240 240">
                  {/* Grid lines and background */}
                  <rect x="30" y="30" width="180" height="180" fill="#0f172a" stroke="#334155" strokeWidth="1" />

                  {/* Axes */}
                  <line x1="30" y1="210" x2="220" y2="210" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="30" y1="210" x2="30" y2="20" stroke="#94a3b8" strokeWidth="2" />
                  <text x="220" y="225" fill="#94a3b8" fontSize="10" textAnchor="end">X</text>
                  <text x="18" y="25" fill="#94a3b8" fontSize="10">Y</text>

                  {/* Axis tick labels */}
                  <text x="30" y="225" fill="#64748b" fontSize="9" textAnchor="middle">0</text>
                  <text x="210" y="225" fill="#64748b" fontSize="9" textAnchor="middle">1</text>
                  <text x="20" y="213" fill="#64748b" fontSize="9" textAnchor="end">0</text>
                  <text x="20" y="33" fill="#64748b" fontSize="9" textAnchor="end">1</text>

                  {/* Continuous Triangular Model Rendering */}
                  {modelType === 'continuous_triangular' && (
                    <g>
                      {/* Base Support Triangle: 0 < x < y < 1. In SVG, (30, 210) is (0,0), (30, 30) is (0,1), (210, 30) is (1,1) */}
                      <polygon points="30,210 30,30 210,30" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

                      {/* Diagonal line y = x */}
                      <line x1="30" y1="210" x2="210" y2="30" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Highlight Query Region */}
                      {regionType === 'boundary' && (() => {
                        const c = Number(boundaryC);
                        if (c >= 1) return null;
                        if (c <= 0) {
                          return <polygon points="30,210 30,30 210,30" fill="#0284c7" opacity="0.5" />;
                        }
                        // Triangle: (0, c), (0, 1), (1-c, 1)
                        // In SVG:
                        // (0, c) -> x = 30, y = 210 - c * 180
                        // (0, 1) -> x = 30, y = 30
                        // (1-c, 1) -> x = 30 + (1-c)*180, y = 30
                        const yC = 210 - c * 180;
                        const xOneMinusC = 30 + (1 - c) * 180;
                        return (
                          <polygon
                            points={`30,${yC} 30,30 ${xOneMinusC},30`}
                            fill="#0284c7"
                            opacity="0.6"
                            stroke="#38bdf8"
                            strokeWidth="2"
                          />
                        );
                      })()}

                      {regionType === 'rectangle' && (() => {
                        const x1 = Math.max(0, parsedBounds.xMin);
                        const x2 = Math.min(1, parsedBounds.xMax);
                        const y1 = Math.max(0, parsedBounds.yMin);
                        const y2 = Math.min(1, parsedBounds.yMax);
                        if (x1 >= x2 || y1 >= y2) return null;
                        const svgX1 = 30 + x1 * 180;
                        const svgX2 = 30 + x2 * 180;
                        const svgY1 = 210 - y2 * 180;
                        const svgY2 = 210 - y1 * 180;
                        return (
                          <rect
                            x={svgX1}
                            y={svgY1}
                            width={svgX2 - svgX1}
                            height={svgY2 - svgY1}
                            fill="#10b981"
                            opacity="0.4"
                            stroke="#34d399"
                            strokeWidth="1.5"
                          />
                        );
                      })()}
                    </g>
                  )}

                  {/* Discrete Heatmap Grid */}
                  {modelType === 'discrete' && activeDiscrete && (
                    <g>
                      {activeDiscrete.table.xSupport.map((x, i) =>
                        activeDiscrete.table.ySupport.map((y, j) => {
                          const massVal = rationalToDecimal(activeDiscrete.table.masses[i][j]);
                          const svgX = 30 + x * 90;
                          const svgY = 120 - y * 90;
                          const isSelected =
                            x >= parsedBounds.xMin &&
                            x <= parsedBounds.xMax &&
                            y >= parsedBounds.yMin &&
                            y <= parsedBounds.yMax;

                          return (
                            <g key={`${x}-${y}`}>
                              <rect
                                x={svgX + 5}
                                y={svgY + 5}
                                width="80"
                                height="80"
                                fill={isSelected ? '#4f46e5' : '#1e1b4b'}
                                opacity={0.3 + massVal * 0.7}
                                stroke={isSelected ? '#818cf8' : '#312e81'}
                                strokeWidth="2"
                                rx="4"
                              />
                              <text
                                x={svgX + 45}
                                y={svgY + 40}
                                fill="#ffffff"
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {massVal.toFixed(3)}
                              </text>
                              <text
                                x={svgX + 45}
                                y={svgY + 55}
                                fill="#a5b4fc"
                                fontSize="9"
                                textAnchor="middle"
                              >
                                ({x}, {y})
                              </text>
                            </g>
                          );
                        })
                      )}
                    </g>
                  )}

                  {/* Simulated scatter points preview */}
                  {simResult &&
                    simResult.samplesPreview.slice(0, 30).map((pt, idx) => {
                      const sx = 30 + Math.max(0, Math.min(1, pt.x)) * 180;
                      const sy = 210 - Math.max(0, Math.min(1, pt.y)) * 180;
                      return <circle key={idx} cx={sx} cy={sy} r="2.5" fill="#f59e0b" opacity="0.8" />;
                    })}
                </svg>
              </div>

              {/* Calculated Outputs & Marginals Summary (5 Cols) */}
              <div className="md:col-span-5 space-y-4">
                {/* Selected Query Probability Banner */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">Selected Region Probability:</span>
                  <div className="text-2xl font-mono font-bold text-sky-400">
                    {regionQueryResult?.value ? regionQueryResult.value.probability.toFixed(4) : '0.0000'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {modelType === 'continuous_triangular' && regionType === 'boundary'
                      ? `P(Y > X + ${boundaryC}) = (1 - ${boundaryC})²`
                      : `P(${parsedBounds.xMin} ≤ X ≤ ${parsedBounds.xMax}, ${parsedBounds.yMin} ≤ Y ≤ ${parsedBounds.yMax})`}
                  </div>
                </div>

                {/* Marginal Distributions Summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-200">Marginal Distributions:</div>
                  {modelType === 'discrete' && activeDiscrete && (
                    <div className="space-y-1.5 font-mono text-slate-300">
                      <div>
                        p_X(0) = {rationalToDecimal(activeDiscrete.xMarginals[0], 4)}, p_X(1) ={' '}
                        {rationalToDecimal(activeDiscrete.xMarginals[1], 4)}
                      </div>
                      <div>
                        p_Y(0) = {rationalToDecimal(activeDiscrete.yMarginals[0], 4)}, p_Y(1) ={' '}
                        {rationalToDecimal(activeDiscrete.yMarginals[1], 4)}
                      </div>
                    </div>
                  )}

                  {modelType === 'continuous_triangular' && (
                    <div className="space-y-1.5 font-mono text-slate-300">
                      <div>f_X(x) = 2(1 - x) \quad (0 &lt; x &lt; 1)</div>
                      <div>f_Y(y) = 2y \quad (0 &lt; y &lt; 1)</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Independence Verification Panel (When Toggled) */}
            {showIndependence && indepResult?.value && (
              <div className="p-4 bg-slate-950 rounded-xl border border-purple-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-sm text-purple-300">Independence Factorization Test</span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                      indepResult.value.isIndependent
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                    }`}
                  >
                    {indepResult.value.isIndependent ? '✓ Variables are Independent' : '✗ Variables are Dependent'}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{indepResult.value.explanation}</p>

                {indepResult.value.comparisonMatrix && (
                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs border border-slate-800 rounded font-mono">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-2">Pair (x, y)</th>
                          <th className="p-2">Joint p(x, y)</th>
                          <th className="p-2">Product p_X(x) · p_Y(y)</th>
                          <th className="p-2">Discrepancy |Diff|</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {indepResult.value.comparisonMatrix.flat().map((cell, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2 text-slate-300">({cell.x}, {cell.y})</td>
                            <td className="p-2 text-indigo-300">{cell.jointProb.toFixed(4)}</td>
                            <td className="p-2 text-purple-300">{cell.productProb.toFixed(4)}</td>
                            <td className="p-2 text-slate-400">
                              {cell.diff === 0 ? '0.0000 (Exact)' : cell.diff.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simulation & Empirical Estimation Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Bivariate Monte Carlo Simulation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draw pairs (X, Y) using pseudo-random generator and verify empirical region frequencies against theoretical integrals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>Seed:</span>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="w-20 bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-white font-mono"
                  />
                </div>

                <select
                  value={sampleCount}
                  onChange={(e) => setSampleCount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-xs rounded px-2.5 py-1.5 text-white font-mono"
                >
                  <option value={100}>100 Pairs</option>
                  <option value={1000}>1,000 Pairs</option>
                  <option value={10000}>10,000 Pairs</option>
                </select>

                <button
                  onClick={() => handleRunSimulation(seed)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white transition"
                >
                  Run Simulation
                </button>
              </div>
            </div>

            {simResult && regionQueryResult && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Simulated <span className="font-mono font-bold text-white">{simResult.runCount}</span> trials (Seed:{' '}
                    <span className="font-mono text-sky-400">{simResult.seed}</span>)
                  </span>
                  <button
                    onClick={() => handleRunSimulation(simResult.seed)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium underline"
                  >
                    Replay Run
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded font-mono">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-2.5">Event</th>
                        <th className="p-2.5">Theoretical Probability</th>
                        <th className="p-2.5">Empirical Frequency</th>
                        <th className="p-2.5">Relative Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-300">Selected Region Query</td>
                        <td className="p-2.5 text-sky-300">
                          {regionQueryResult.value?.probability.toFixed(4)}
                        </td>
                        <td className="p-2.5 text-emerald-300">
                          {(
                            simResult.empiricalBoundaryProb ??
                            simResult.empiricalRectangleProb ??
                            0
                          ).toFixed(4)}
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {Math.abs(
                            ((simResult.empiricalBoundaryProb ??
                              simResult.empiricalRectangleProb ??
                              0) -
                              (regionQueryResult.value?.probability ?? 0)) /
                              (regionQueryResult.value?.probability || 1)
                          ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  </LabShell>
);
};
