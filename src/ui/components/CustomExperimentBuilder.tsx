import React, { useState, useMemo, useEffect } from 'react';
import {
  analyzeCustomExperiment,
  CustomOutcomeInput,
  CustomRandomVariableInput,
} from '../../core/math/customExperiment';
import {
  rationalToString,
} from '../../core/math/rational';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

const DEFAULT_OUTCOMES: CustomOutcomeInput[] = [
  { name: 'w1', massStr: '1/4' },
  { name: 'w2', massStr: '1/4' },
  { name: 'w3', massStr: '1/4' },
  { name: 'w4', massStr: '1/4' },
];

const DEFAULT_MAPPING: Record<string, string> = {
  w1: '0',
  w2: '1',
  w3: '1',
  w4: '2',
};

export const CustomExperimentBuilder: React.FC<{
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}> = ({ onNavigate }) => {
  const [outcomes, setOutcomes] = useState<CustomOutcomeInput[]>(DEFAULT_OUTCOMES);
  const [rvName, setRvName] = useState<string>('X');
  const [rvMapping, setRvMapping] = useState<Record<string, string>>(DEFAULT_MAPPING);

  // Events A and B
  const [eventAOutcomes, setEventAOutcomes] = useState<string[]>(['w2', 'w3']);
  const [eventBOutcomes, setEventBOutcomes] = useState<string[]>(['w1', 'w2', 'w3']);

  // Snapshot
  const [snapshotName, setSnapshotName] = useState<string>('Binomial-like 4 Outcomes');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() => {
    return LocalPersistenceService.getLabSnapshot('EXP-BUILDER');
  });

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'EXP-BUILDER',
      activity_type: 'lab_interaction',
      description: 'Opened Custom Finite Experiment Builder',
    });
  }, []);

  // Sync rvMapping keys if outcomes change
  const activeRv: CustomRandomVariableInput = useMemo(() => {
    const mapping: Record<string, string> = {};
    for (const o of outcomes) {
      mapping[o.name] = rvMapping[o.name] ?? '0';
    }
    return { name: rvName, mapping };
  }, [outcomes, rvMapping, rvName]);

  // Analyze experiment
  const analysisResult = useMemo(() => {
    return analyzeCustomExperiment(
      outcomes,
      activeRv,
      eventAOutcomes.filter((a) => outcomes.some((o) => o.name === a)),
      eventBOutcomes.filter((b) => outcomes.some((o) => o.name === b))
    );
  }, [outcomes, activeRv, eventAOutcomes, eventBOutcomes]);

  const analysis = analysisResult.value;
  const isStale = analysisResult.status !== 'valid';

  // Presets
  const applyPreset = (presetType: 'coin2' | 'die6' | 'urn3') => {
    if (presetType === 'coin2') {
      const o: CustomOutcomeInput[] = [
        { name: 'Heads', massStr: '1/2' },
        { name: 'Tails', massStr: '1/2' },
      ];
      setOutcomes(o);
      setRvMapping({ Heads: '1', Tails: '0' });
      setEventAOutcomes(['Heads']);
      setEventBOutcomes(['Heads', 'Tails']);
      setSnapshotName('Fair Coin Preset');
    } else if (presetType === 'die6') {
      const o: CustomOutcomeInput[] = [
        { name: '1', massStr: '1/6' },
        { name: '2', massStr: '1/6' },
        { name: '3', massStr: '1/6' },
        { name: '4', massStr: '1/6' },
        { name: '5', massStr: '1/6' },
        { name: '6', massStr: '1/6' },
      ];
      setOutcomes(o);
      setRvMapping({ '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6' });
      setEventAOutcomes(['2', '4', '6']); // Even
      setEventBOutcomes(['4', '5', '6']); // High
      setSnapshotName('Fair Die 6 Preset');
    } else if (presetType === 'urn3') {
      const o: CustomOutcomeInput[] = [
        { name: 'Red', massStr: '3/10' },
        { name: 'Green', massStr: '5/10' },
        { name: 'Blue', massStr: '2/10' },
      ];
      setOutcomes(o);
      setRvMapping({ Red: '5', Green: '10', Blue: '-2' });
      setEventAOutcomes(['Red']);
      setEventBOutcomes(['Red', 'Green']);
      setSnapshotName('Colored Urn Preset');
    }
  };

  const handleOutcomeChange = (index: number, field: 'name' | 'massStr', value: string) => {
    const updated = [...outcomes];
    const oldName = updated[index].name;
    updated[index] = { ...updated[index], [field]: value };
    setOutcomes(updated);

    if (field === 'name' && value !== oldName) {
      const newMapping = { ...rvMapping };
      newMapping[value] = newMapping[oldName] ?? '0';
      delete newMapping[oldName];
      setRvMapping(newMapping);
    }
  };

  const handleAddOutcome = () => {
    const newIdx = outcomes.length + 1;
    const newName = `w${newIdx}`;
    setOutcomes([...outcomes, { name: newName, massStr: '0' }]);
    setRvMapping({ ...rvMapping, [newName]: '0' });
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length <= 1) return;
    const removedName = outcomes[index].name;
    const updated = outcomes.filter((_, i) => i !== index);
    setOutcomes(updated);

    const newMap = { ...rvMapping };
    delete newMap[removedName];
    setRvMapping(newMap);

    setEventAOutcomes(eventAOutcomes.filter((x) => x !== removedName));
    setEventBOutcomes(eventBOutcomes.filter((x) => x !== removedName));
  };

  // Normalization Repair
  const handleApplyRepair = () => {
    if (!analysis?.repairedMassesPreview) return;
    const newOutcomes = analysis.repairedMassesPreview.map((p) => ({
      name: p.outcome,
      massStr: rationalToString(p.newMass),
    }));
    setOutcomes(newOutcomes);
  };

  // Snapshot Actions
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) return;
    const snap: LabComparisonSnapshot = {
      lab_id: 'EXP-BUILDER',
      snapshot_id: `snap_builder_${Date.now()}`,
      name: snapshotName.trim(),
      timestamp: new Date().toLocaleString(),
      settings: {
        outcomes,
        rvName,
        rvMapping,
        eventAOutcomes,
        eventBOutcomes,
      },
      theoreticalOutputs: analysis
        ? {
            totalMass: rationalToString(analysis.sampleSpaceTotalMass),
            expVal: analysis.expectation?.decimal,
            varVal: analysis.variance?.decimal,
            pA: analysis.eventAProb ? rationalToString(analysis.eventAProb) : null,
            pB: analysis.eventBProb ? rationalToString(analysis.eventBProb) : null,
          }
        : undefined,
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const s = savedSnapshot.settings;
    if (s.outcomes) setOutcomes(s.outcomes);
    if (s.rvName) setRvName(s.rvName);
    if (s.rvMapping) setRvMapping(s.rvMapping);
    if (s.eventAOutcomes) setEventAOutcomes(s.eventAOutcomes);
    if (s.eventBOutcomes) setEventBOutcomes(s.eventBOutcomes);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('EXP-BUILDER');
    setSavedSnapshot(null);
  };

  const handleResetDefaults = () => {
    setOutcomes(DEFAULT_OUTCOMES);
    setRvName('X');
    setRvMapping(DEFAULT_MAPPING);
    setEventAOutcomes(['w2', 'w3']);
    setEventBOutcomes(['w1', 'w2', 'w3']);
    setSnapshotName('Default 4 Outcomes');
  };

  const repairPreviewData = analysis?.repairedMassesPreview?.map((p) => ({
    label: p.outcome,
    oldVal: rationalToString(p.oldMass),
    newVal: rationalToString(p.newMass),
  }));

  return (
    <LabShell
      labId="EXP-BUILDER"
      labTitle="Custom Finite Experiment Builder"
      labSubtitle="Author custom sample spaces Ω, assign exact rational outcome masses, define arbitrary random variables X(ω), and inspect induced PMFs and moments."
      sourceAttribution={{
        part: 'Part 1 & Part 2',
        chapter: 'Foundations & Discrete Random Variables',
        isIllustrative: true,
      }}
      linkedModuleIds={['M01', 'M05', 'M07']}
      linkedConceptIds={['C-000001', 'C-000018', 'C-000021']}
      isStale={isStale}
      errorCode={analysisResult.error_code}
      errorMessage={analysisResult.message}
      repairEligible={analysis?.repairEligible ?? false}
      repairPreview={repairPreviewData}
      onApplyRepair={handleApplyRepair}
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
            <div>Outcomes Count: <strong>{outcomes.length}</strong></div>
            <div>Random Variable: <strong>{rvName}</strong></div>
            <div>E[{rvName}]: <strong>{analysis?.expectation?.decimal.toFixed(4) ?? '—'}</strong></div>
            <div>Var({rvName}): <strong>{analysis?.variance?.decimal.toFixed(4) ?? '—'}</strong></div>
          </div>
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '6px', padding: '1rem', background: '#faf5ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#7e22ce' }}>Saved: "{saved.name}"</h4>
            <div>Outcomes Count: <strong>{saved.settings.outcomes?.length}</strong></div>
            <div>Random Variable: <strong>{saved.settings.rvName}</strong></div>
            <div>E[{saved.settings.rvName}]: <strong>{saved.theoreticalOutputs?.expVal ?? '—'}</strong></div>
            <div>Var({saved.settings.rvName}): <strong>{saved.theoreticalOutputs?.varVal ?? '—'}</strong></div>
          </div>
        </div>
      )}
    >
      {/* Preset Fast Selection */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Load Model Preset:</span>
        <button className="btn-secondary btn-sm" onClick={() => applyPreset('coin2')}>
          🪙 Fair Coin {`{Heads, Tails}`}
        </button>
        <button className="btn-secondary btn-sm" onClick={() => applyPreset('die6')}>
          🎲 6-Sided Die {`{1..6}`}
        </button>
        <button className="btn-secondary btn-sm" onClick={() => applyPreset('urn3')}>
          🎨 Colored Urn {`{Red, Green, Blue}`}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Sample Space & Mapping Inputs */}
        <div>
          {/* Sample Space Outcomes Card */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                1. Sample Space Outcomes & Masses (Ω)
              </h3>
              <button
                onClick={handleAddOutcome}
                className="btn-primary btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.78rem' }}
              >
                + Add Outcome
              </button>
            </div>

            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Outcome (ω)</th>
                  <th style={{ padding: '6px 8px' }}>Mass P(ω)</th>
                  <th style={{ padding: '6px 8px' }}>X(ω) Map</th>
                  <th style={{ padding: '6px 8px', width: '30px' }}></th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((o, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        value={o.name}
                        onChange={(e) => handleOutcomeChange(idx, 'name', e.target.value)}
                        style={{ width: '70px', padding: '3px 6px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        value={o.massStr}
                        onChange={(e) => handleOutcomeChange(idx, 'massStr', e.target.value)}
                        placeholder="e.g. 1/4"
                        style={{ width: '80px', padding: '3px 6px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        value={rvMapping[o.name] ?? ''}
                        onChange={(e) => setRvMapping({ ...rvMapping, [o.name]: e.target.value })}
                        placeholder="e.g. 2"
                        style={{ width: '60px', padding: '3px 6px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {outcomes.length > 1 && (
                        <button
                          onClick={() => handleRemoveOutcome(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
                          title="Remove outcome"
                        >
                          &times;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total mass check */}
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>
                Total Mass: <strong>{analysis ? rationalToString(analysis.sampleSpaceTotalMass) : '—'}</strong>
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: analysis?.isNormalized ? '#f0fdf4' : '#fffbeb',
                  color: analysis?.isNormalized ? '#15803d' : '#b45309',
                  border: `1px solid ${analysis?.isNormalized ? '#bbf7d0' : '#fde68a'}`,
                }}
              >
                {analysis?.isNormalized ? '✓ Normalized (Sum = 1)' : '⚠️ Unnormalized'}
              </span>
            </div>
          </div>

          {/* Event Builder & Conditional Probability Card */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
              2. Subsets & Conditioning (Events A and B)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Event A */}
              <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8', marginBottom: '4px' }}>
                  Select Event A Outcomes:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {outcomes.map((o) => (
                    <label key={o.name} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        type="checkbox"
                        checked={eventAOutcomes.includes(o.name)}
                        onChange={(e) => {
                          if (e.target.checked) setEventAOutcomes([...eventAOutcomes, o.name]);
                          else setEventAOutcomes(eventAOutcomes.filter((x) => x !== o.name));
                        }}
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                  P(A) = {analysis?.eventAProb ? rationalToString(analysis.eventAProb) : '—'}
                </div>
              </div>

              {/* Event B */}
              <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#15803d', marginBottom: '4px' }}>
                  Select Event B Outcomes:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {outcomes.map((o) => (
                    <label key={o.name} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        type="checkbox"
                        checked={eventBOutcomes.includes(o.name)}
                        onChange={(e) => {
                          if (e.target.checked) setEventBOutcomes([...eventBOutcomes, o.name]);
                          else setEventBOutcomes(eventBOutcomes.filter((x) => x !== o.name));
                        }}
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                  P(B) = {analysis?.eventBProb ? rationalToString(analysis.eventBProb) : '—'}
                </div>
              </div>
            </div>

            {/* Set Operations & Bayes/Conditioning Display */}
            {analysis && (
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>P(A ∩ B): <strong>{analysis.intersectionProb ? rationalToString(analysis.intersectionProb) : '0'}</strong></span>
                  <span>P(A ∪ B): <strong>{analysis.unionProb ? rationalToString(analysis.unionProb) : '0'}</strong></span>
                </div>
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Conditional Probability P(A|B):</span>
                  {analysis.conditionalAGivenB?.defined ? (
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>
                      {rationalToString(analysis.conditionalAGivenB.rational!)}
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      Undefined [E-COND-ZERO] (P(B) = 0)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Induced Random Variable Analysis */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Induced Random Variable {rvName} & Moments
              </h3>
              <span className="badge badge-source">CAL-RV-001</span>
            </div>

            {/* Induced PMF Table */}
            {analysis?.inducedPmf && analysis.inducedPmf.length > 0 ? (
              <div>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>Value x</th>
                      <th style={{ padding: '6px 8px' }}>Exact P(X = x)</th>
                      <th style={{ padding: '6px 8px' }}>Decimal</th>
                      <th style={{ padding: '6px 8px' }}>CDF F_X(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.inducedPmf.map((pt, idx) => {
                      const cdfStep = analysis.cdfSteps?.[idx];
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>{pt.valLatex}</td>
                          <td style={{ padding: '6px 8px' }}>{rationalToString(pt.mass)}</td>
                          <td style={{ padding: '6px 8px' }}>{pt.massDecimal.toFixed(4)}</td>
                          <td style={{ padding: '6px 8px' }}>{cdfStep ? rationalToString(cdfStep.fx) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Induced PMF Bar Chart (SVG) */}
                <div style={{ margin: '1rem 0' }}>
                  <svg
                    viewBox="0 0 450 140"
                    style={{ width: '100%', height: 'auto', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  >
                    {/* Bars */}
                    {analysis.inducedPmf.map((pt, idx) => {
                      const count = analysis.inducedPmf!.length;
                      const slotW = 380 / count;
                      const bx = 40 + idx * slotW + (slotW - 32) / 2;
                      const barH = Math.min(100, pt.massDecimal * 100);
                      const by = 110 - barH;

                      return (
                        <g key={idx}>
                          <rect
                            x={bx}
                            y={by}
                            width={32}
                            height={barH}
                            fill="#60a5fa"
                            stroke="#2563eb"
                            strokeWidth="1"
                            rx="2"
                          />
                          <text x={bx + 16} y={by - 4} fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="700">
                            {rationalToString(pt.mass)}
                          </text>
                          <text x={bx + 16} y={124} fontSize="11" fill="#334155" textAnchor="middle" fontWeight="600">
                            {pt.valLatex}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="110" x2="430" y2="110" stroke="#94a3b8" strokeWidth="1" />
                  </svg>
                </div>

                {/* Summary Moments Card */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>EXPECTATION E[X]</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                        {analysis.expectation ? rationalToString(analysis.expectation.rational) : '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        ≈ {analysis.expectation ? analysis.expectation.decimal.toFixed(4) : ''}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>VARIANCE Var(X)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                        {analysis.variance ? rationalToString(analysis.variance.rational) : '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        StdDev σ ≈ {analysis.stdDev !== undefined ? analysis.stdDev.toFixed(4) : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                Ensure all outcome masses sum to 1 and random variable mappings are valid numbers.
              </div>
            )}
          </div>
        </div>
      </div>
    </LabShell>
  );
};
