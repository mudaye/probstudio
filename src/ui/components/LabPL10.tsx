import React, { useState, useMemo, useEffect } from 'react';
import {
  calculateTriangularConditionalDensity,
  calculateCommunicationChannel,
  simulateCommunicationChannel,
  calculateJacobianLinearTransform,
  TriangularConditionalResult,
  CommunicationChannelResult,
  ChannelSimulationResult,
  JacobianTransformResult,
} from '../../core/math/multivariate';

import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

export interface LabPL10Props {
  onNavigate?: (route: string, params?: Record<string, string>) => void;
  initialPreset?: string;
}

export const LabPL10: React.FC<LabPL10Props> = ({ onNavigate, initialPreset }) => {
  const [activeTab, setActiveTab] = useState<'conditional' | 'channel' | 'transform'>('conditional');

  // --- Tab 1: Conditional Distributions State ---
  const [givenAxis, setGivenAxis] = useState<'X' | 'Y'>('X');
  const [givenValue, setGivenValue] = useState<number>(0.5);
  const [queryCutoff, setQueryCutoff] = useState<number>(0.75);
  const [queryDirection, setQueryDirection] = useState<'greater' | 'less'>('greater');

  // --- Tab 2: Communication Channel State ---
  const [bit0Voltage] = useState<number>(0);
  const [bit1Voltage] = useState<number>(5);
  const [priorBit1, setPriorBit1] = useState<number>(0.5);
  const [noiseType, setNoiseType] = useState<'gaussian' | 'uniform'>('gaussian');
  const [noiseParam, setNoiseParam] = useState<number>(1.5);
  const [threshold, setThreshold] = useState<number>(2.5);
  const [simSampleSize, setSimSampleSize] = useState<number>(2000);
  const [simSeed, setSimSeed] = useState<number>(42);
  const [channelSim, setChannelSim] = useState<ChannelSimulationResult | null>(null);

  // --- Tab 3: Jacobian Transform State ---
  const [a11, setA11] = useState<number>(1);
  const [a12, setA12] = useState<number>(1);
  const [a21, setA21] = useState<number>(1);
  const [a22, setA22] = useState<number>(-1);

  // Snapshot State (LabShell managed)
  const [snapshotName, setSnapshotName] = useState<string>('Multivariate Baseline');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() =>
    LocalPersistenceService.getLabSnapshot('PL-10')
  );

  // --- Math Calculations ---
  const conditionalCalc = useMemo(() => {
    return calculateTriangularConditionalDensity(givenAxis, givenValue, queryCutoff, queryDirection);
  }, [givenAxis, givenValue, queryCutoff, queryDirection]);

  const channelCalc = useMemo(() => {
    return calculateCommunicationChannel({
      bit0Voltage,
      bit1Voltage,
      priorBit1,
      noiseType,
      noiseParam,
      threshold,
    });
  }, [bit0Voltage, bit1Voltage, priorBit1, noiseType, noiseParam, threshold]);

  const jacobianCalc = useMemo(() => {
    return calculateJacobianLinearTransform(a11, a12, a21, a22);
  }, [a11, a12, a21, a22]);

  const conditionalResult: TriangularConditionalResult | null =
    conditionalCalc.status === 'valid' ? conditionalCalc.value : null;

  const channelResult: CommunicationChannelResult | null =
    channelCalc.status === 'valid' ? channelCalc.value : null;

  const jacobianResult: JacobianTransformResult | null =
    jacobianCalc.status === 'valid' ? jacobianCalc.value : null;

  const validationError: string | null = useMemo(() => {
    if (activeTab === 'conditional' && conditionalCalc.status !== 'valid') {
      return conditionalCalc.message || 'Domain violation in conditional distribution.';
    }
    if (activeTab === 'channel' && channelCalc.status !== 'valid') {
      return channelCalc.message || 'Invalid channel configuration.';
    }
    if (activeTab === 'transform' && jacobianCalc.status !== 'valid') {
      return jacobianCalc.message || 'Singular transformation matrix.';
    }
    return null;
  }, [activeTab, conditionalCalc, channelCalc, jacobianCalc]);

  const isStale = validationError !== null;

  useEffect(() => {
    if (!initialPreset) return;
    if (initialPreset === 'conditional' || initialPreset === 'channel' || initialPreset === 'transform') {
      setActiveTab(initialPreset);
    }
  }, [initialPreset]);

  const handleRunSimulation = () => {
    const res = simulateCommunicationChannel(
      {
        bit0Voltage,
        bit1Voltage,
        priorBit1,
        noiseType,
        noiseParam,
        threshold,
      },
      simSampleSize,
      simSeed
    );
    if (res.status === 'valid' && res.value) {
      setChannelSim(res.value);
    }
  };

  const handleSaveSnapshot = () => {
    let summary = '';
    let keyMetric = '';
    if (activeTab === 'conditional' && conditionalResult) {
      summary = `Triangular Condition on ${givenAxis}=${givenValue.toFixed(2)}`;
      keyMetric = `P = ${conditionalResult.theoreticalProbability.toFixed(4)}`;
    } else if (activeTab === 'channel' && channelResult) {
      summary = `Binary Channel (${noiseType}, param=${noiseParam.toFixed(2)}, tau=${threshold.toFixed(2)})`;
      keyMetric = `BER = ${(channelResult.theoreticalBitErrorRate * 100).toFixed(2)}%`;
    } else if (activeTab === 'transform' && jacobianResult) {
      summary = `Jacobian Transform [[${a11}, ${a12}], [${a21}, ${a22}]]`;
      keyMetric = `|det J| = ${jacobianResult.absJacobianDeterminant.toFixed(4)}`;
    }

    const snap: LabComparisonSnapshot = {
      lab_id: 'PL-10',
      name: snapshotName || 'Multivariate Snapshot',
      timestamp: new Date().toISOString(),
      parameters: {
        activeTab,
        givenAxis,
        givenValue,
        queryCutoff,
        queryDirection,
        priorBit1,
        noiseType,
        noiseParam,
        threshold,
        a11,
        a12,
        a21,
        a22,
      },
      results: {
        activeTab,
        summary,
        keyMetric,
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const p = savedSnapshot.parameters;
    if (p.activeTab) setActiveTab(p.activeTab as 'conditional' | 'channel' | 'transform');
    if (p.givenAxis) setGivenAxis(p.givenAxis as 'X' | 'Y');
    if (typeof p.givenValue === 'number') setGivenValue(p.givenValue);
    if (typeof p.queryCutoff === 'number') setQueryCutoff(p.queryCutoff);
    if (p.queryDirection) setQueryDirection(p.queryDirection as 'greater' | 'less');
    if (typeof p.priorBit1 === 'number') setPriorBit1(p.priorBit1);
    if (p.noiseType) setNoiseType(p.noiseType as 'gaussian' | 'uniform');
    if (typeof p.noiseParam === 'number') setNoiseParam(p.noiseParam);
    if (typeof p.threshold === 'number') setThreshold(p.threshold);
    if (typeof p.a11 === 'number') setA11(p.a11);
    if (typeof p.a12 === 'number') setA12(p.a12);
    if (typeof p.a21 === 'number') setA21(p.a21);
    if (typeof p.a22 === 'number') setA22(p.a22);
    setChannelSim(null);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-10');
    setSavedSnapshot(null);
  };

  const handleResetDefaults = () => {
    setGivenAxis('X');
    setGivenValue(0.5);
    setQueryCutoff(0.75);
    setQueryDirection('greater');

    setPriorBit1(0.5);
    setNoiseType('gaussian');
    setNoiseParam(1.5);
    setThreshold(2.5);
    setChannelSim(null);

    setA11(1);
    setA12(1);
    setA21(1);
    setA22(-1);
  };

  return (
    <LabShell
      labId="PL-10"
      labTitle="Conditionals, Channels and 2D Transforms Lab"
      labSubtitle="How do conditional densities restrict supports, how does channel noise govern error rates, and how does the Jacobian determinant scale bivariate transformations?"
      sourceAttribution={{
        part: 'Part 3',
        chapter: 'Chapters 19–20, 22: Conditional distributions, communication channels, Bayes rules, and 2D Jacobian',
        isIllustrative: true,
      }}
      linkedModuleIds={['M19', 'M20', 'M22']}
      linkedConceptIds={['C-000037', 'C-000038', 'C-000039', 'C-000040', 'C-000043', 'C-000044']}
      isStale={isStale}
      errorCode={isStale ? 'E-PARAM-DOMAIN' : undefined}
      errorMessage={validationError ?? undefined}
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
            <div>Tab: <strong>{activeTab.toUpperCase()}</strong></div>
            <div>
              {activeTab === 'conditional' && conditionalResult && `P = ${conditionalResult.theoreticalProbability.toFixed(4)}`}
              {activeTab === 'channel' && channelResult && `BER = ${(channelResult.theoreticalBitErrorRate * 100).toFixed(2)}%`}
              {activeTab === 'transform' && jacobianResult && `|det J| = ${jacobianResult.absJacobianDeterminant.toFixed(4)}`}
            </div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Saved: {saved.name}</h4>
            <div>Summary: <strong>{String(saved.results?.summary ?? 'N/A')}</strong></div>
            <div>Metric: <strong>{String(saved.results?.keyMetric ?? 'N/A')}</strong></div>
          </div>
        </div>
      )}
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('conditional')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'conditional'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            1. Continuous Conditional Slicing
          </button>
          <button
            onClick={() => setActiveTab('channel')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'channel'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            2. Communication Channel &amp; Mixture Model
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'transform'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            3. 2D Transformations &amp; Jacobian
          </button>
        </div>

      {/* TAB 1: CONDITIONAL DISTRIBUTIONS */}
      {activeTab === 'conditional' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
              Conditional Slice Controls
            </h3>

            {/* Conditioning Axis */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Conditioning Variable
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGivenAxis('X')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    givenAxis === 'X'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Given X = x₀ (Vertical Slice)
                </button>
                <button
                  onClick={() => setGivenAxis('Y')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    givenAxis === 'Y'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Given Y = y₀ (Horizontal Slice)
                </button>
              </div>
            </div>

            {/* Slice Value */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Conditioning Value {givenAxis === 'X' ? 'x₀' : 'y₀'}:</span>
                <span className="text-emerald-700">{givenValue.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={givenValue}
                onChange={(e) => setGivenValue(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {givenAxis === 'X'
                  ? `Marginal f_X(x₀) = 2(1 - x₀) = ${(2 * (1 - givenValue)).toFixed(2)}`
                  : `Marginal f_Y(y₀) = 2 y₀ = ${(2 * givenValue).toFixed(2)}`}
              </p>
            </div>

            {/* Query Cutoff & Direction */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Conditional Probability Query
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setQueryDirection('greater')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded border ${
                    queryDirection === 'greater'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {givenAxis === 'X' ? 'P(Y > cutoff | X)' : 'P(X > cutoff | Y)'}
                </button>
                <button
                  onClick={() => setQueryDirection('less')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded border ${
                    queryDirection === 'less'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {givenAxis === 'X' ? 'P(Y ≤ cutoff | X)' : 'P(X ≤ cutoff | Y)'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Query Cutoff:</span>
                  <span className="text-emerald-700">{queryCutoff.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={queryCutoff}
                  onChange={(e) => setQueryCutoff(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Golden Vector Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setGivenAxis('X');
                    setGivenValue(0.5);
                    setQueryCutoff(0.75);
                    setQueryDirection('greater');
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  X=0.5, P(Y &gt; 0.75) = 0.5
                </button>
                <button
                  onClick={() => {
                    setGivenAxis('Y');
                    setGivenValue(0.8);
                    setQueryCutoff(0.4);
                    setQueryDirection('less');
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  Y=0.8, P(X ≤ 0.4) = 0.5
                </button>
              </div>
            </div>
          </div>

          {/* Visual Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">
                2D Triangular Joint Model & 1D Conditional Density Slice
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* 2D Joint SVG */}
                <div>
                  <div className="text-xs font-bold text-slate-600 text-center mb-2">
                    Joint Density f(x, y) = 2 on 0 &lt; x &lt; y &lt; 1
                  </div>
                  <svg viewBox="-30 -30 360 360" className="w-full h-64 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Axes */}
                    <line x1="0" y1="300" x2="310" y2="300" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="0" y1="300" x2="0" y2="-10" stroke="#94a3b8" strokeWidth="2" />
                    <text x="315" y="305" fontSize="12" fill="#64748b" fontWeight="bold">x</text>
                    <text x="-5" y="-15" fontSize="12" fill="#64748b" fontWeight="bold">y</text>

                    {/* Triangular Support Polygon: (0, 0) -> (0, 300) -> (300, 300) in cartesian */}
                    {/* SVG coords: x: x*300, y: 300 - y*300 */}
                    <polygon points="0,300 0,0 300,0" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />

                    {/* Diagonal boundary y = x */}
                    <line x1="0" y1="300" x2="300" y2="0" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,4" />

                    {/* Slice Line */}
                    {givenAxis === 'X' ? (
                      <line
                        x1={givenValue * 300}
                        y1={300 - givenValue * 300}
                        x2={givenValue * 300}
                        y2="0"
                        stroke="#10b981"
                        strokeWidth="3.5"
                      />
                    ) : (
                      <line
                        x1="0"
                        y1={300 - givenValue * 300}
                        x2={givenValue * 300}
                        y2={300 - givenValue * 300}
                        stroke="#10b981"
                        strokeWidth="3.5"
                      />
                    )}

                    {/* Axis Ticks */}
                    <text x="0" y="315" fontSize="10" fill="#64748b" textAnchor="middle">0</text>
                    <text x="300" y="315" fontSize="10" fill="#64748b" textAnchor="middle">1</text>
                    <text x="-12" y="304" fontSize="10" fill="#64748b" textAnchor="end">0</text>
                    <text x="-12" y="5" fontSize="10" fill="#64748b" textAnchor="end">1</text>
                  </svg>
                </div>

                {/* 1D Conditional Density Slice */}
                <div>
                  <div className="text-xs font-bold text-slate-600 text-center mb-2">
                    {givenAxis === 'X'
                      ? `Conditional Density f_{Y|X}(y | ${givenValue.toFixed(2)}) ~ Uniform(${givenValue.toFixed(2)}, 1)`
                      : `Conditional Density f_{X|Y}(x | ${givenValue.toFixed(2)}) ~ Uniform(0, ${givenValue.toFixed(2)})`}
                  </div>
                  <svg viewBox="-30 -30 360 260" className="w-full h-64 bg-slate-50 rounded-lg border border-slate-200">
                    {/* Axes */}
                    <line x1="0" y1="200" x2="310" y2="200" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="0" y1="200" x2="0" y2="10" stroke="#94a3b8" strokeWidth="2" />
                    <text x="315" y="205" fontSize="12" fill="#64748b" fontWeight="bold">
                      {givenAxis === 'X' ? 'y' : 'x'}
                    </text>
                    <text x="-5" y="5" fontSize="12" fill="#64748b" fontWeight="bold">density</text>

                    {conditionalResult && (
                      <>
                        {/* Shaded query area */}
                        {givenAxis === 'X' ? (
                          <rect
                            x={Math.max(givenValue, queryDirection === 'greater' ? queryCutoff : givenValue) * 300}
                            y={200 - Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                            width={
                              Math.max(
                                0,
                                (queryDirection === 'greater'
                                  ? 1 - Math.max(givenValue, queryCutoff)
                                  : Math.min(1, queryCutoff) - givenValue) * 300
                              )
                            }
                            height={Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                            fill="#10b981"
                            fillOpacity="0.3"
                          />
                        ) : (
                          <rect
                            x={queryDirection === 'greater' ? Math.max(0, queryCutoff) * 300 : 0}
                            y={200 - Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                            width={
                              Math.max(
                                0,
                                (queryDirection === 'greater'
                                  ? Math.max(0, givenValue - queryCutoff)
                                  : Math.min(givenValue, queryCutoff)) * 300
                              )
                            }
                            height={Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                            fill="#10b981"
                            fillOpacity="0.3"
                          />
                        )}

                        {/* Flat Uniform Density Bar */}
                        <line
                          x1={conditionalResult.conditionalSupport[0] * 300}
                          y1={200 - Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                          x2={conditionalResult.conditionalSupport[1] * 300}
                          y2={200 - Math.min(180, conditionalResult.conditionalDensityValue * 40)}
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {/* Cutoff vertical line */}
                        <line
                          x1={queryCutoff * 300}
                          y1="200"
                          x2={queryCutoff * 300}
                          y2="20"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                      </>
                    )}

                    <text x="0" y="215" fontSize="10" fill="#64748b" textAnchor="middle">0</text>
                    <text x="300" y="215" fontSize="10" fill="#64748b" textAnchor="middle">1</text>
                  </svg>
                </div>
              </div>

              {/* Analytical Summary Card */}
              {conditionalResult && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Analytical Result & Derivation
                  </div>
                  <div className="text-sm text-emerald-950 font-mono">
                    {conditionalResult.formulaLatex}
                  </div>
                  <div className="mt-2 text-xs text-emerald-800">
                    Notice that conditioning on {givenAxis} = {givenValue.toFixed(2)} normalizes the joint density
                    f(x, y) = 2 by the marginal density f_{givenAxis}({givenValue.toFixed(2)}) ={' '}
                    {conditionalResult.marginalDensityAtGiven.toFixed(2)}, yielding an exact uniform distribution over
                    [{conditionalResult.conditionalSupport[0].toFixed(2)}, {conditionalResult.conditionalSupport[1].toFixed(2)}].
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNICATION CHANNEL & MIXTURE MODEL */}
      {activeTab === 'channel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
              Signaling & Channel Controls
            </h3>

            {/* Prior Bit 1 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Prior Probability P(X = 1):</span>
                <span className="text-emerald-700">{priorBit1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={priorBit1}
                onChange={(e) => setPriorBit1(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>P(X = 0) = {(1 - priorBit1).toFixed(2)}</span>
                <span>P(X = 1) = {priorBit1.toFixed(2)}</span>
              </div>
            </div>

            {/* Noise Type & Parameter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Noise Model N
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setNoiseType('gaussian')}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    noiseType === 'gaussian'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Gaussian N(0, σ²)
                </button>
                <button
                  onClick={() => setNoiseType('uniform')}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    noiseType === 'uniform'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Uniform(-w, w)
                </button>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{noiseType === 'gaussian' ? 'Std Dev σ:' : 'Half-Width w:'}</span>
                <span className="text-emerald-700">{noiseParam.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={noiseType === 'gaussian' ? '0.5' : '0.5'}
                max={noiseType === 'gaussian' ? '3.0' : '4.0'}
                step="0.1"
                value={noiseParam}
                onChange={(e) => setNoiseParam(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Decision Threshold */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Decision Threshold τ:</span>
                <span className="text-emerald-700 font-bold">{threshold.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Decision Rule: Decide X̂ = 1 if Y &gt; {threshold.toFixed(2)}V, else X̂ = 0.
              </p>
            </div>

            {/* Simulation Controls */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                PRNG Bitstream Simulation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sample Count</label>
                  <select
                    value={simSampleSize}
                    onChange={(e) => setSimSampleSize(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                  >
                    <option value={500}>500 bits</option>
                    <option value={2000}>2,000 bits</option>
                    <option value={10000}>10,000 bits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Seed</label>
                  <input
                    type="number"
                    value={simSeed}
                    onChange={(e) => setSimSeed(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              </div>
              <button
                onClick={handleRunSimulation}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Run Channel Simulation
              </button>
            </div>
          </div>

          {/* Visualization & Metrics */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-2">
                Bimodal Mixture Density & Decision Boundary
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                f_Y(y) = (1 - p₁) f_{'{Y|0}'}(y) + p₁ f_{'{Y|1}'}(y). The shaded red region illustrates False Alarms; orange illustrates Misses.
              </p>

              {/* Mixture Curve SVG */}
              <svg viewBox="-40 -20 580 240" className="w-full h-64 bg-slate-50 rounded-lg border border-slate-200">
                {/* Horizontal axis from -3V to 8V */}
                {/* Scale: x from -3 to 8 (span 11). Width 500 => scale = 500 / 11 ~ 45.45 px/V */}
                <line x1="0" y1="180" x2="520" y2="180" stroke="#94a3b8" strokeWidth="2" />
                <line x1="136" y1="180" x2="136" y2="10" stroke="#cbd5e1" strokeDasharray="3,3" /> {/* 0V line */}
                <line x1="363" y1="180" x2="363" y2="10" stroke="#cbd5e1" strokeDasharray="3,3" /> {/* 5V line */}

                <text x="136" y="195" fontSize="10" fill="#64748b" textAnchor="middle">0V (Bit 0)</text>
                <text x="363" y="195" fontSize="10" fill="#64748b" textAnchor="middle">5V (Bit 1)</text>

                {/* Threshold vertical line */}
                {(() => {
                  const threshX = 136 + threshold * 45.45;
                  return (
                    <line
                      x1={threshX}
                      y1="10"
                      x2={threshX}
                      y2="180"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />
                  );
                })()}

                {/* Plot Conditional Curves */}
                {(() => {
                  const pts0: string[] = [];
                  const pts1: string[] = [];
                  const ptsMix: string[] = [];

                  for (let v = -3; v <= 8; v += 0.1) {
                    const px = 136 + v * 45.45;
                    let f0 = 0;
                    let f1 = 0;

                    if (noiseType === 'gaussian') {
                      f0 = (1 / (noiseParam * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(v - 0, 2) / (2 * noiseParam * noiseParam));
                      f1 = (1 / (noiseParam * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(v - 5, 2) / (2 * noiseParam * noiseParam));
                    } else {
                      f0 = Math.abs(v - 0) <= noiseParam ? 1 / (2 * noiseParam) : 0;
                      f1 = Math.abs(v - 5) <= noiseParam ? 1 / (2 * noiseParam) : 0;
                    }

                    const fMix = (1 - priorBit1) * f0 + priorBit1 * f1;

                    const py0 = 180 - f0 * 180;
                    const py1 = 180 - f1 * 180;
                    const pyMix = 180 - fMix * 180;

                    pts0.push(`${px.toFixed(1)},${py0.toFixed(1)}`);
                    pts1.push(`${px.toFixed(1)},${py1.toFixed(1)}`);
                    ptsMix.push(`${px.toFixed(1)},${pyMix.toFixed(1)}`);
                  }

                  return (
                    <>
                      <polyline points={pts0.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" />
                      <polyline points={pts1.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                      <polyline points={ptsMix.join(' ')} fill="none" stroke="#10b981" strokeWidth="3" />
                    </>
                  );
                })()}
              </svg>

              {/* Theoretical Metrics Table */}
              {channelResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">False Alarm P_FA</div>
                    <div className="text-lg font-bold text-red-600">
                      {(channelResult.theoreticalFalseAlarm * 100).toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-400">P(Y &gt; τ | Bit 0)</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">Miss Rate P_Miss</div>
                    <div className="text-lg font-bold text-amber-600">
                      {(channelResult.theoreticalMiss * 100).toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-400">P(Y ≤ τ | Bit 1)</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">Detection Rate P_Det</div>
                    <div className="text-lg font-bold text-blue-600">
                      {(channelResult.theoreticalDetection * 100).toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-400">1 - P_Miss</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <div className="text-[11px] text-emerald-700 font-semibold uppercase">Total Bit Error Rate</div>
                    <div className="text-lg font-bold text-emerald-800">
                      {(channelResult.theoreticalBitErrorRate * 100).toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-emerald-600">Optimal τ* = 2.50V</div>
                  </div>
                </div>
              )}

              {/* Simulation Result Preview */}
              {channelSim && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Empirical Simulation Outcome ({channelSim.sampleCount} bits)
                    </h4>
                    <span className="text-xs font-semibold text-emerald-700">
                      Empirical BER: {(channelSim.empiricalBitErrorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-3">
                    Empirical False Alarm: {(channelSim.empiricalFalseAlarm * 100).toFixed(2)}% | Empirical Miss: {(channelSim.empiricalMiss * 100).toFixed(2)}%
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex gap-1 text-[11px] font-mono">
                      {channelSim.transmittedBits.slice(0, 30).map((b, idx) => {
                        const rec = channelSim.receivedVoltages[idx];
                        const dec = channelSim.decisions[idx];
                        const isErr = b !== dec;
                        return (
                          <div
                            key={idx}
                            className={`p-1.5 rounded text-center min-w-[32px] border ${
                              isErr
                                ? 'bg-red-100 border-red-300 text-red-800 font-bold'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                            title={`Transmitted: ${b}\nReceived: ${rec.toFixed(2)}V\nDecided: ${dec}`}
                          >
                            <div>{b}</div>
                            <div className="text-[9px] text-slate-400">{dec}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 2D TRANSFORMATIONS & JACOBIAN */}
      {activeTab === 'transform' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
              Linear Transform Matrix A
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">a₁₁</label>
                <input
                  type="number"
                  step="0.5"
                  value={a11}
                  onChange={(e) => setA11(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">a₁₂</label>
                <input
                  type="number"
                  step="0.5"
                  value={a12}
                  onChange={(e) => setA12(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">a₂₁</label>
                <input
                  type="number"
                  step="0.5"
                  value={a21}
                  onChange={(e) => setA21(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">a₂₂</label>
                <input
                  type="number"
                  step="0.5"
                  value={a22}
                  onChange={(e) => setA22(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Standard Presets
              </label>
              <button
                onClick={() => {
                  setA11(1);
                  setA12(1);
                  setA21(1);
                  setA22(-1);
                }}
                className="w-full text-left px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Transcript Example: Sum & Difference [[1, 1], [1, -1]]
              </button>
              <button
                onClick={() => {
                  setA11(1);
                  setA12(0.5);
                  setA21(0);
                  setA22(1);
                }}
                className="w-full text-left px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Shear Mapping: [[1, 0.5], [0, 1]]
              </button>
              <button
                onClick={() => {
                  setA11(2);
                  setA12(0);
                  setA21(0);
                  setA22(1.5);
                }}
                className="w-full text-left px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Anisotropic Scaling: [[2, 0], [0, 1.5]]
              </button>
            </div>
          </div>

          {/* Visual Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">
                Domain Deformation & Jacobian Area Scaling
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Space X */}
                <div>
                  <div className="text-xs font-bold text-slate-600 text-center mb-2">
                    Input Domain (X₁, X₂) Unit Square [0, 1]²
                  </div>
                  <svg viewBox="-50 -50 300 300" className="w-full h-56 bg-slate-50 rounded-lg border border-slate-200">
                    <line x1="-30" y1="150" x2="220" y2="150" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="50" y1="220" x2="50" y2="-30" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Unit square: x from 50 to 150, y from 150 down to 50 */}
                    <rect x="50" y="50" width="100" height="100" fill="#3b82f6" fillOpacity="0.25" stroke="#2563eb" strokeWidth="2" />
                    <text x="150" y="165" fontSize="10" fill="#64748b" textAnchor="middle">1</text>
                    <text x="35" y="55" fontSize="10" fill="#64748b" textAnchor="end">1</text>
                    <text x="225" y="155" fontSize="11" fill="#64748b" fontWeight="bold">X₁</text>
                    <text x="45" y="-35" fontSize="11" fill="#64748b" fontWeight="bold">X₂</text>
                  </svg>
                </div>

                {/* Transformed Space Y */}
                <div>
                  <div className="text-xs font-bold text-slate-600 text-center mb-2">
                    Transformed Domain (Y₁, Y₂) = A·(X₁, X₂)
                  </div>
                  <svg viewBox="-150 -150 300 300" className="w-full h-56 bg-slate-50 rounded-lg border border-slate-200">
                    <line x1="-140" y1="0" x2="140" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="0" y1="140" x2="0" y2="-140" stroke="#94a3b8" strokeWidth="1.5" />
                    {jacobianResult && (
                      <polygon
                        points={jacobianResult.transformedUnitSquareVertices
                          .map(([vx, vy]) => `${(vx * 50).toFixed(1)},${(-vy * 50).toFixed(1)}`)
                          .join(' ')}
                        fill="#10b981"
                        fillOpacity="0.3"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                    )}
                    <text x="145" y="5" fontSize="11" fill="#64748b" fontWeight="bold">Y₁</text>
                    <text x="-5" y="-140" fontSize="11" fill="#64748b" fontWeight="bold">Y₂</text>
                  </svg>
                </div>
              </div>

              {/* Analytical Card */}
              {jacobianResult && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Transformation Analysis & Jacobian Determinant
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500">det(A):</span>{' '}
                      <span className="font-bold text-slate-800">{jacobianResult.determinantA.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Area Scaling |det(A)|:</span>{' '}
                      <span className="font-bold text-slate-800">{jacobianResult.areaScalingFactor.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Jacobian det(J):</span>{' '}
                      <span className="font-bold text-slate-800">{jacobianResult.jacobianDeterminant.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-semibold">|det(J)| = 1/|det(A)|:</span>{' '}
                      <span className="font-bold text-emerald-800">{jacobianResult.absJacobianDeterminant.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    Density Transformation Theorem:{' '}
                    <span className="font-mono font-semibold">
                      f_Y(y₁, y₂) = f_X(A⁻¹y) · |det(J)|
                    </span>
                    . For uniform inputs on the unit square, the transformed density is constant and equal to{' '}
                    <span className="font-bold font-mono">{jacobianResult.absJacobianDeterminant.toFixed(4)}</span> across
                    a region of total area <span className="font-bold font-mono">{jacobianResult.areaScalingFactor.toFixed(2)}</span>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </LabShell>
  );
};
export default LabPL10;
