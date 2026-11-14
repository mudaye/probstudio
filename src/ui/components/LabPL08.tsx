import React, { useState, useMemo, useEffect } from 'react';
import {
  SourceModelType,
  SourceModelConfig,
  TransformationType,
  TransformationConfig,
  calculateTransformedMoments,
  calculateMarkovBound,
  calculateChebyshevBound,
  calculateJensenBound,
  simulateMoments,
  TransformedMomentsResult,
  EmpiricalMomentsResult,
} from '../../core/math/moments';
import { LocalPersistenceService } from '../../core/storage/persistence';

interface PL08Snapshot {
  timestamp: string;
  name: string;
  sourceDesc: string;
  transformDesc: string;
  meanX: string;
  varX: string;
  meanY: string;
  varY: string;
  inequalityDesc?: string;
  inequalityBound?: string;
  simMeanY?: string;
  simVarY?: string;
}

export type InequalityMode = 'none' | 'markov' | 'chebyshev' | 'jensen';

export const LabPL08: React.FC = () => {
  // Source Model State
  const [sourceType, setSourceType] = useState<SourceModelType>('bernoulli');
  const [paramP, setParamP] = useState<string>('0.5');
  const [paramN, setParamN] = useState<string>('10');
  const [paramLambda, setParamLambda] = useState<string>('2.0');
  const [paramA, setParamA] = useState<string>('0');
  const [paramB, setParamB] = useState<string>('6');
  const [paramMu, setParamMu] = useState<string>('0');
  const [paramSigma, setParamSigma] = useState<string>('1');

  // Transformation State
  const [transformType, setTransformType] = useState<TransformationType>('affine');
  const [affineA, setAffineA] = useState<string>('2');
  const [affineB, setAffineB] = useState<string>('1');

  // Inequality State
  const [inequalityMode, setInequalityMode] = useState<InequalityMode>('none');
  const [thresholdMarkov, setThresholdMarkov] = useState<string>('2.0');
  const [thresholdChebyshev, setThresholdChebyshev] = useState<string>('2.0');
  const [jensenFunc, setJensenFunc] = useState<'square' | 'exponential'>('square');

  // Simulation State
  const [sampleCount, setSampleCount] = useState<number>(1000);
  const [seed, setSeed] = useState<number>(42);
  const [simResult, setSimResult] = useState<EmpiricalMomentsResult | null>(null);

  // Snapshot State
  const [snapshotName, setSnapshotName] = useState<string>('Baseline Model');
  const [snapshot, setSnapshot] = useState<PL08Snapshot | null>(null);

  // Stale state cache
  const [lastValidResult, setLastValidResult] = useState<TransformedMomentsResult | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-08',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-08: Transformation, Expectation and Variance Lab',
    });
  }, []);

  // Parse active source model configuration
  const sourceConfig: SourceModelConfig = useMemo(() => {
    switch (sourceType) {
      case 'bernoulli':
        return { type: 'bernoulli', p: Number(paramP) };
      case 'binomial':
        return { type: 'binomial', n: Number(paramN), p: Number(paramP) };
      case 'geometric':
        return { type: 'geometric', p: Number(paramP) };
      case 'poisson':
        return { type: 'poisson', lambda: Number(paramLambda) };
      case 'uniform':
        return { type: 'uniform', a: Number(paramA), b: Number(paramB) };
      case 'exponential':
        return { type: 'exponential', lambda: Number(paramLambda) };
      case 'gaussian':
        return { type: 'gaussian', mu: Number(paramMu), sigma: Number(paramSigma) };
    }
  }, [sourceType, paramP, paramN, paramLambda, paramA, paramB, paramMu, paramSigma]);

  const transformConfig: TransformationConfig = useMemo(() => {
    return {
      type: transformType,
      affineA: Number(affineA),
      affineB: Number(affineB),
    };
  }, [transformType, affineA, affineB]);

  // Compute Moments
  const momentsCalc = useMemo(() => {
    return calculateTransformedMoments(sourceConfig, transformConfig);
  }, [sourceConfig, transformConfig]);

  const isCalculationValid = momentsCalc.status === 'valid' && !!momentsCalc.value;

  useEffect(() => {
    if (isCalculationValid && momentsCalc.value) {
      setLastValidResult(momentsCalc.value);
    }
  }, [isCalculationValid, momentsCalc.value]);

  const activeResult: TransformedMomentsResult | null = isCalculationValid
    ? momentsCalc.value!
    : lastValidResult;

  // Compute Inequality Result
  const markovCalc = useMemo(() => {
    if (inequalityMode !== 'markov') return null;
    return calculateMarkovBound(sourceConfig, Number(thresholdMarkov));
  }, [inequalityMode, sourceConfig, thresholdMarkov]);

  const chebyshevCalc = useMemo(() => {
    if (inequalityMode !== 'chebyshev') return null;
    return calculateChebyshevBound(sourceConfig, Number(thresholdChebyshev));
  }, [inequalityMode, sourceConfig, thresholdChebyshev]);

  const jensenCalc = useMemo(() => {
    if (inequalityMode !== 'jensen') return null;
    return calculateJensenBound(sourceConfig, jensenFunc);
  }, [inequalityMode, sourceConfig, jensenFunc]);

  // Handle Simulation
  const handleRunSimulation = (overrideSeed?: number) => {
    if (!isCalculationValid) return;
    const runSeed = overrideSeed !== undefined ? overrideSeed : Math.floor(Math.random() * 1000000);
    if (overrideSeed === undefined) {
      setSeed(runSeed);
    }

    const tMarkov = inequalityMode === 'markov' ? Number(thresholdMarkov) : undefined;
    const tChebyshev = inequalityMode === 'chebyshev' ? Number(thresholdChebyshev) : undefined;

    const res = simulateMoments(
      sourceConfig,
      transformConfig,
      sampleCount,
      runSeed,
      tMarkov,
      tChebyshev
    );
    setSimResult(res);
  };

  // Snapshot Handlers
  const handleSaveSnapshot = () => {
    if (!activeResult) return;
    const s: PL08Snapshot = {
      timestamp: new Date().toLocaleTimeString(),
      name: snapshotName || 'Snapshot',
      sourceDesc: `${sourceType.toUpperCase()}`,
      transformDesc: activeResult.transformationFormula,
      meanX: activeResult.sourceMoments.mean.toFixed(3),
      varX: activeResult.sourceMoments.variance.toFixed(3),
      meanY: activeResult.transformedMoments.mean.toFixed(3),
      varY: activeResult.transformedMoments.variance.toFixed(3),
      simMeanY: simResult ? simResult.empiricalMeanY.toFixed(3) : undefined,
      simVarY: simResult ? simResult.empiricalVarY.toFixed(3) : undefined,
    };
    setSnapshot(s);
  };

  const handleReset = () => {
    if (window.confirm('Reset all controls to baseline Bernoulli(0.5) and Affine(2X + 1)?')) {
      setSourceType('bernoulli');
      setParamP('0.5');
      setTransformType('affine');
      setAffineA('2');
      setAffineB('1');
      setInequalityMode('none');
      setThresholdMarkov('2.0');
      setThresholdChebyshev('2.0');
      setJensenFunc('square');
      setSimResult(null);
    }
  };

  // Preset Configurations
  const applyPreset = (preset: 'coin_affine' | 'standard_normal_sq' | 'exponential_markov' | 'uniform_scaling') => {
    setSimResult(null);
    if (preset === 'coin_affine') {
      setSourceType('bernoulli');
      setParamP('0.5');
      setTransformType('affine');
      setAffineA('2');
      setAffineB('-1');
      setInequalityMode('none');
    } else if (preset === 'standard_normal_sq') {
      setSourceType('gaussian');
      setParamMu('0');
      setParamSigma('1');
      setTransformType('square');
      setInequalityMode('chebyshev');
      setThresholdChebyshev('2');
    } else if (preset === 'exponential_markov') {
      setSourceType('exponential');
      setParamLambda('1');
      setTransformType('identity');
      setInequalityMode('markov');
      setThresholdMarkov('2');
    } else if (preset === 'uniform_scaling') {
      setSourceType('uniform');
      setParamA('0');
      setParamB('4');
      setTransformType('affine');
      setAffineA('3');
      setAffineB('2');
      setInequalityMode('jensen');
      setJensenFunc('square');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">PL-08: Transformation, Expectation and Variance Lab</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
              Part 2 Core
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Explore how transformations change random variables, verify the Law of the Unconscious Statistician (LOTUS), and test Markov, Chebyshev, and Jensen concentration bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Validation Stale Alert */}
      {!isCalculationValid && (
        <div className="p-4 bg-amber-950/60 border border-amber-800/80 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-600 text-white">
              {momentsCalc.error_code || 'INVALID_INPUT'}
            </span>
            <span className="text-amber-200 text-sm font-medium">
              {momentsCalc.message || 'Invalid parameters.'} Showing stale results from last valid model.
            </span>
          </div>
          <span className="text-xs text-amber-400 uppercase tracking-wide font-mono">Stale Result</span>
        </div>
      )}

      {/* Main Grid: Left Controls & Right Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Source Distribution Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              1. Source Distribution (X)
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Family</label>
              <select
                value={sourceType}
                onChange={(e) => {
                  setSourceType(e.target.value as SourceModelType);
                  setSimResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <optgroup label="Discrete Models">
                  <option value="bernoulli">Bernoulli(p)</option>
                  <option value="binomial">Binomial(n, p)</option>
                  <option value="geometric">Geometric(p) [Support k ≥ 1]</option>
                  <option value="poisson">Poisson(λ)</option>
                </optgroup>
                <optgroup label="Continuous Models">
                  <option value="uniform">Uniform(a, b)</option>
                  <option value="exponential">Exponential(λ)</option>
                  <option value="gaussian">Gaussian(μ, σ)</option>
                </optgroup>
              </select>
            </div>

            {/* Dynamic Parameter Inputs */}
            {(sourceType === 'bernoulli' || sourceType === 'binomial' || sourceType === 'geometric') && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Success Probability (p)</span>
                  <span className="font-mono text-indigo-400">{paramP}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={paramP}
                  onChange={(e) => setParamP(e.target.value)}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}

            {sourceType === 'binomial' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Number of Trials (n)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={paramN}
                  onChange={(e) => setParamN(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
            )}

            {(sourceType === 'poisson' || sourceType === 'exponential') && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Rate Parameter (λ)</span>
                  <span className="font-mono text-indigo-400">{paramLambda}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={paramLambda}
                  onChange={(e) => setParamLambda(e.target.value)}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}

            {sourceType === 'uniform' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Lower (a)</label>
                  <input
                    type="number"
                    value={paramA}
                    onChange={(e) => setParamA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Upper (b)</label>
                  <input
                    type="number"
                    value={paramB}
                    onChange={(e) => setParamB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
              </div>
            )}

            {sourceType === 'gaussian' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Mean (μ)</label>
                  <input
                    type="number"
                    value={paramMu}
                    onChange={(e) => setParamMu(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Std Dev (σ)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={paramSigma}
                    onChange={(e) => setParamSigma(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Transformation Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              2. Transformation Y = g(X)
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTransformType('identity')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  transformType === 'identity'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Identity
              </button>
              <button
                onClick={() => setTransformType('affine')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  transformType === 'affine'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Affine aX + b
              </button>
              <button
                onClick={() => setTransformType('square')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  transformType === 'square'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Square X²
              </button>
            </div>

            {transformType === 'affine' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Multiplier (a)</label>
                  <input
                    type="number"
                    value={affineA}
                    onChange={(e) => setAffineA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Shift (b)</label>
                  <input
                    type="number"
                    value={affineB}
                    onChange={(e) => setAffineB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Curriculum Presets</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => applyPreset('coin_affine')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-indigo-400">Spin Coin 2X - 1</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Bernoulli to {'{-1, 1}'}</div>
              </button>
              <button
                onClick={() => applyPreset('standard_normal_sq')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-emerald-400">Chi-Square Z²</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Gaussian(0,1) squared</div>
              </button>
              <button
                onClick={() => applyPreset('exponential_markov')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-amber-400">Markov Tail Bound</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Exp(1) at a = 2</div>
              </button>
              <button
                onClick={() => applyPreset('uniform_scaling')}
                className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded transition text-slate-300"
              >
                <div className="font-semibold text-purple-400">Jensen Convexity</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Uniform(0,4) Square</div>
              </button>
            </div>
          </div>

          {/* Inequality View Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              3. Concentration Inequality View
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInequalityMode('none')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  inequalityMode === 'none'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                None
              </button>
              <button
                onClick={() => setInequalityMode('markov')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  inequalityMode === 'markov'
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Markov's Inequality
              </button>
              <button
                onClick={() => setInequalityMode('chebyshev')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  inequalityMode === 'chebyshev'
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Chebyshev's Inequality
              </button>
              <button
                onClick={() => setInequalityMode('jensen')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                  inequalityMode === 'jensen'
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Jensen's Inequality
              </button>
            </div>

            {inequalityMode === 'markov' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Tail Threshold a (P(X ≥ a))</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={thresholdMarkov}
                  onChange={(e) => setThresholdMarkov(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
            )}

            {inequalityMode === 'chebyshev' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Deviation Threshold a (P(|X - μ| ≥ a))</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={thresholdChebyshev}
                  onChange={(e) => setThresholdChebyshev(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
            )}

            {inequalityMode === 'jensen' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Convex Function φ(t)</label>
                <select
                  value={jensenFunc}
                  onChange={(e) => setJensenFunc(e.target.value as 'square' | 'exponential')}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-white font-mono"
                >
                  <option value="square">φ(t) = t² (Square)</option>
                  <option value="exponential">φ(t) = e^t (Exponential MGF)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Moments Comparison Table Card */}
          {activeResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Theoretical Moments & LOTUS Comparison
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Transformation:{' '}
                    <span className="font-mono text-indigo-400 font-bold">
                      {activeResult.transformationFormula}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                  {activeResult.sourceMoments.supportDescription}
                </div>
              </div>

              {/* Moments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source X Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-semibold text-slate-200 text-sm">Source Variable X</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                      Input
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mean E[X] (μ):</span>
                      <span className="font-mono font-bold text-white text-base">
                        {activeResult.sourceMoments.mean.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Variance Var(X) (σ²):</span>
                      <span className="font-mono font-bold text-slate-200">
                        {activeResult.sourceMoments.variance.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Std Deviation (σ):</span>
                      <span className="font-mono text-slate-300">
                        {activeResult.sourceMoments.sd.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Second Moment E[X²]:</span>
                      <span className="font-mono text-slate-300">
                        {activeResult.sourceMoments.eX2.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transformed Y Card */}
                <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-semibold text-indigo-300 text-sm">Transformed Y = g(X)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-600 text-white font-mono">
                      LOTUS Result
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mean E[Y]:</span>
                      <span className="font-mono font-bold text-indigo-300 text-base">
                        {activeResult.transformedMoments.mean.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Variance Var(Y):</span>
                      <span className="font-mono font-bold text-slate-200">
                        {activeResult.transformedMoments.variance.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Std Deviation SD(Y):</span>
                      <span className="font-mono text-slate-300">
                        {activeResult.transformedMoments.sd.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Second Moment E[Y²]:</span>
                      <span className="font-mono text-slate-300">
                        {activeResult.transformedMoments.eY2.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytical Formulas Display */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5">
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Expectation Formula: </span>
                  <span className="font-mono text-indigo-300">{activeResult.expectationFormula}</span>
                </div>
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Variance Formula: </span>
                  <span className="font-mono text-emerald-300">{activeResult.varianceFormula}</span>
                </div>
              </div>

              {/* Visual Moment Gauge */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Visual Distribution Scale (Mean ± 1σ)
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <svg className="w-full h-20" viewBox="0 0 500 80">
                    {/* Background baseline */}
                    <line x1="20" y1="40" x2="480" y2="40" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Scale interval for X */}
                    {(() => {
                      const minVal = Math.min(
                        activeResult.sourceMoments.mean - 2 * activeResult.sourceMoments.sd,
                        activeResult.transformedMoments.mean - 2 * activeResult.transformedMoments.sd,
                        0
                      );
                      const maxVal = Math.max(
                        activeResult.sourceMoments.mean + 2 * activeResult.sourceMoments.sd,
                        activeResult.transformedMoments.mean + 2 * activeResult.transformedMoments.sd,
                        5
                      );
                      const scale = (val: number) => {
                        const clamped = Math.max(minVal, Math.min(maxVal, val));
                        return 40 + ((clamped - minVal) / (maxVal - minVal || 1)) * 420;
                      };

                      const xMu = scale(activeResult.sourceMoments.mean);
                      const xMinusSigma = scale(activeResult.sourceMoments.mean - activeResult.sourceMoments.sd);
                      const xPlusSigma = scale(activeResult.sourceMoments.mean + activeResult.sourceMoments.sd);

                      const yMu = scale(activeResult.transformedMoments.mean);
                      const yMinusSigma = scale(
                        activeResult.transformedMoments.mean - activeResult.transformedMoments.sd
                      );
                      const yPlusSigma = scale(
                        activeResult.transformedMoments.mean + activeResult.transformedMoments.sd
                      );

                      return (
                        <g>
                          {/* X Interval Range */}
                          <line x1={xMinusSigma} y1="28" x2={xPlusSigma} y2="28" stroke="#6366f1" strokeWidth="4" />
                          <circle cx={xMu} cy="28" r="6" fill="#818cf8" />
                          <text x={xMu} y="18" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">
                            E[X] = {activeResult.sourceMoments.mean.toFixed(2)}
                          </text>

                          {/* Y Interval Range */}
                          <line x1={yMinusSigma} y1="56" x2={yPlusSigma} y2="56" stroke="#10b981" strokeWidth="4" />
                          <circle cx={yMu} cy="56" r="6" fill="#34d399" />
                          <text x={yMu} y="74" fill="#6ee7b7" fontSize="10" textAnchor="middle" fontWeight="bold">
                            E[Y] = {activeResult.transformedMoments.mean.toFixed(2)}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span className="text-indigo-400 font-medium">● Source X (Mean ± 1σ)</span>
                    <span className="text-emerald-400 font-medium">● Transformed Y (Mean ± 1σ)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inequality Verification Card */}
          {inequalityMode !== 'none' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Inequality Verification</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                    {inequalityMode}
                  </span>
                </h3>
              </div>

              {/* Markov View */}
              {inequalityMode === 'markov' && markovCalc && (
                <div>
                  {markovCalc.status !== 'valid' || !markovCalc.value ? (
                    <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
                      <div className="font-bold text-sm mb-1">{markovCalc.error_code}</div>
                      <div>{markovCalc.message}</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-slate-400">Statement:</div>
                          <div className="text-sm font-semibold text-amber-300 font-mono mt-0.5">
                            P(X ≥ {markovCalc.value.thresholdA}) ≤ E[X] / {markovCalc.value.thresholdA}
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-xs text-slate-400 block">True P(X ≥ a)</span>
                            <span className="font-bold font-mono text-white text-base">
                              {markovCalc.value.trueProbability.toFixed(4)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block">Markov Bound</span>
                            <span className="font-bold font-mono text-amber-400 text-base">
                              {markovCalc.value.markovBound.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Probability Gauge Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Comparison Meter</span>
                          <span className="text-emerald-400 font-semibold">
                            {markovCalc.value.boundSatisfied ? '✓ Bound Verified' : 'Bound Exceeded'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            className="bg-amber-600 h-full absolute left-0 top-0 opacity-40"
                            style={{ width: `${Math.min(100, markovCalc.value.markovBound * 100)}%` }}
                            title="Markov Upper Bound"
                          />
                          <div
                            className="bg-indigo-500 h-full absolute left-0 top-0"
                            style={{ width: `${Math.min(100, markovCalc.value.trueProbability * 100)}%` }}
                            title="True Probability"
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>0%</span>
                          <span className="text-indigo-400">Solid: True Probability</span>
                          <span className="text-amber-400">Shaded: Markov Bound</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chebyshev View */}
              {inequalityMode === 'chebyshev' && chebyshevCalc && (
                <div>
                  {chebyshevCalc.status !== 'valid' || !chebyshevCalc.value ? (
                    <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
                      <div>{chebyshevCalc.message}</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-slate-400">Statement:</div>
                          <div className="text-sm font-semibold text-sky-300 font-mono mt-0.5">
                            P(|X - μ| ≥ {chebyshevCalc.value.thresholdA}) ≤ Var(X) / {chebyshevCalc.value.thresholdA}²
                          </div>
                          <div className="text-xs text-slate-400 mt-1 font-mono">
                            Equivalent to {chebyshevCalc.value.kStandardDeviations.toFixed(2)}σ dev: Bound = 1/k² ={' '}
                            {(1 / Math.pow(chebyshevCalc.value.kStandardDeviations, 2)).toFixed(4)}
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-xs text-slate-400 block">True P(|X - μ| ≥ a)</span>
                            <span className="font-bold font-mono text-white text-base">
                              {chebyshevCalc.value.trueProbability.toFixed(4)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block">Chebyshev Bound</span>
                            <span className="font-bold font-mono text-sky-400 text-base">
                              {chebyshevCalc.value.chebyshevBound.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Probability Gauge Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Comparison Meter</span>
                          <span className="text-emerald-400 font-semibold">
                            {chebyshevCalc.value.boundSatisfied ? '✓ Bound Verified' : 'Bound Exceeded'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            className="bg-sky-600 h-full absolute left-0 top-0 opacity-40"
                            style={{ width: `${Math.min(100, chebyshevCalc.value.chebyshevBound * 100)}%` }}
                            title="Chebyshev Upper Bound"
                          />
                          <div
                            className="bg-indigo-500 h-full absolute left-0 top-0"
                            style={{ width: `${Math.min(100, chebyshevCalc.value.trueProbability * 100)}%` }}
                            title="True Probability"
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>0%</span>
                          <span className="text-indigo-400">Solid: True Probability</span>
                          <span className="text-sky-400">Shaded: Chebyshev Bound</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jensen View */}
              {inequalityMode === 'jensen' && jensenCalc && (
                <div>
                  {jensenCalc.status !== 'valid' || !jensenCalc.value ? (
                    <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
                      <div>{jensenCalc.message}</div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800/80 pb-2">
                        <div>
                          <span className="text-xs text-slate-400">Convex Function: </span>
                          <span className="font-mono text-purple-300 font-semibold">{jensenCalc.value.convexFormula}</span>
                        </div>
                        <div className="text-xs font-semibold text-emerald-400">
                          {jensenCalc.value.boundSatisfied ? '✓ φ(E[X]) ≤ E[φ(X)] Verified' : 'Violation'}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-400 block">φ(E[X])</span>
                          <span className="font-bold font-mono text-white text-base">
                            {jensenCalc.value.phiOfExpectation.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-400 block">E[φ(X)]</span>
                          <span className="font-bold font-mono text-purple-400 text-base">
                            {jensenCalc.value.expectationOfPhi.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-400 block">Jensen Gap</span>
                          <span className="font-bold font-mono text-emerald-400 text-base">
                            +{jensenCalc.value.jensenGap.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {jensenCalc.value.convexFunction === 'square' && (
                        <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          💡 Notice that for the square function φ(t) = t², the Jensen gap is exactly{' '}
                          <span className="font-mono text-emerald-300">E[X²] - (E[X])² = Var(X) ≥ 0</span>!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Simulation & Empirical Estimation Panel (M15) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Deterministic Simulation & LLN Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draw pseudo-random samples from source X, transform to Y = g(X), and compare sample moments against analytical expectations.
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
                  <option value={100}>100 Trials</option>
                  <option value={1000}>1,000 Trials</option>
                  <option value={10000}>10,000 Trials</option>
                </select>

                <button
                  onClick={() => handleRunSimulation(seed)}
                  disabled={!isCalculationValid}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  Run Simulation
                </button>
              </div>
            </div>

            {simResult && activeResult && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Simulated <span className="font-mono font-bold text-white">{simResult.runCount}</span> trials (Seed:{' '}
                    <span className="font-mono text-indigo-400">{simResult.seed}</span>)
                  </span>
                  <button
                    onClick={() => handleRunSimulation(simResult.seed)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                  >
                    Replay Run
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Theoretical (Analytical)</th>
                        <th className="py-2.5 px-3">Empirical (Simulated)</th>
                        <th className="py-2.5 px-3">Relative Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-300">Mean E[X]</td>
                        <td className="py-2.5 px-3 text-indigo-300">{activeResult.sourceMoments.mean.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-emerald-300">{simResult.empiricalMeanX.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {Math.abs(
                            (simResult.empiricalMeanX - activeResult.sourceMoments.mean) /
                              (activeResult.sourceMoments.mean || 1)
                          ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-300">Mean E[Y]</td>
                        <td className="py-2.5 px-3 text-indigo-300">{activeResult.transformedMoments.mean.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-emerald-300">{simResult.empiricalMeanY.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {Math.abs(
                            (simResult.empiricalMeanY - activeResult.transformedMoments.mean) /
                              (activeResult.transformedMoments.mean || 1)
                          ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-300">Variance Var(Y)</td>
                        <td className="py-2.5 px-3 text-indigo-300">
                          {activeResult.transformedMoments.variance.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-300">{simResult.empiricalVarY.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {Math.abs(
                            (simResult.empiricalVarY - activeResult.transformedMoments.variance) /
                              (activeResult.transformedMoments.variance || 1)
                          ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                        </td>
                      </tr>
                      {simResult.empiricalMarkovProb !== undefined && markovCalc?.value && (
                        <tr className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-amber-300">Markov Tail P(X ≥ a)</td>
                          <td className="py-2.5 px-3 text-indigo-300">
                            {markovCalc.value.trueProbability.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300">
                            {simResult.empiricalMarkovProb.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {Math.abs(
                              (simResult.empiricalMarkovProb - markovCalc.value.trueProbability) /
                                (markovCalc.value.trueProbability || 1)
                            ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                          </td>
                        </tr>
                      )}
                      {simResult.empiricalChebyshevProb !== undefined && chebyshevCalc?.value && (
                        <tr className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-sky-300">Chebyshev Dev P(|X-μ| ≥ a)</td>
                          <td className="py-2.5 px-3 text-indigo-300">
                            {chebyshevCalc.value.trueProbability.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300">
                            {simResult.empiricalChebyshevProb.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {Math.abs(
                              (simResult.empiricalChebyshevProb - chebyshevCalc.value.trueProbability) /
                                (chebyshevCalc.value.trueProbability || 1)
                            ).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Snapshot Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Comparison Snapshot
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Snapshot Name"
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                />
                <button
                  onClick={handleSaveSnapshot}
                  disabled={!activeResult}
                  className="px-3 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  Save Snapshot
                </button>
              </div>
            </div>

            {snapshot && (
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="font-bold text-slate-200">{snapshot.name}</div>
                  <div className="text-[11px] text-slate-500">Saved at {snapshot.timestamp}</div>
                  <div className="font-mono text-indigo-400 mt-1">
                    {snapshot.sourceDesc} → {snapshot.transformDesc}
                  </div>
                </div>
                <div className="flex gap-4 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">E[Y]</span>
                    <span className="text-slate-200 font-bold">{snapshot.meanY}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Var(Y)</span>
                    <span className="text-slate-200 font-bold">{snapshot.varY}</span>
                  </div>
                  {snapshot.simMeanY && (
                    <div>
                      <span className="text-emerald-500 block text-[10px]">Sim E[Y]</span>
                      <span className="text-emerald-400 font-bold">{snapshot.simMeanY}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
