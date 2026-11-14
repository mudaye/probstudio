import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToLatex,
  addRational,
  divRational,
  compareRational,
  Rational,
} from '../../core/math/rational';
import {
  FiniteSampleSpace,
  SetOperation,
} from '../../core/math/types';
import {
  calculateEventOperation,
  calculateEventProbability,
  validateSampleSpace,
  SetOperationResult,
} from '../../core/math/events';
import { MathView } from './MathView';
import { VennDiagram } from './VennDiagram';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

const DEFAULT_OUTCOMES = ['HH', 'HT', 'TH', 'TT'];
const DEFAULT_MASSES_STR = ['1/4', '1/4', '1/4', '1/4'];
const DEFAULT_EVENT_A = ['HH', 'HT'];
const DEFAULT_EVENT_B = ['HH', 'TH'];

interface LabPL01Props {
  initialPreset?: string;
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}

export const LabPL01: React.FC<LabPL01Props> = ({ initialPreset, onNavigate }) => {
  const [outcomes] = useState<string[]>(DEFAULT_OUTCOMES);
  const [massesInput, setMassesInput] = useState<string[]>(DEFAULT_MASSES_STR);
  const [eventA, setEventA] = useState<string[]>(DEFAULT_EVENT_A);
  const [eventB, setEventB] = useState<string[]>(DEFAULT_EVENT_B);
  const [operation, setOperation] = useState<SetOperation>('intersection');

  const [snapshotName, setSnapshotName] = useState<string>('Fair Coins Intersection');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() => {
    return LocalPersistenceService.getLabSnapshot('PL-01');
  });

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-01',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-01: Event and Probability Builder',
    });
  }, []);

  // Handle deep-linked presets
  useEffect(() => {
    if (initialPreset === 'biased') {
      setMassesInput(['1/2', '1/4', '1/8', '1/8']);
      setSnapshotName('Biased Toss Preset');
    } else if (initialPreset === 'disjoint') {
      setEventA(['HH']);
      setEventB(['TT']);
      setOperation('intersection');
      setSnapshotName('Disjoint Events Preset');
    }
  }, [initialPreset]);

  // Normalization check & repair preview
  const repairInfo = useMemo(() => {
    let sum = createRational(0n, 1n);
    let allNonNeg = true;
    const parsed: Rational[] = [];
    for (const mStr of massesInput) {
      const r = parseRational(mStr);
      if (!r || r.num < 0n) {
        allNonNeg = false;
        break;
      }
      parsed.push(r);
      sum = addRational(sum, r);
    }
    const isSumOne = allNonNeg && compareRational(sum, createRational(1n, 1n)) === 0;
    const eligible = allNonNeg && !isSumOne && sum.num > 0n;
    const preview = eligible
      ? parsed.map((m, i) => ({
          label: outcomes[i],
          oldVal: massesInput[i],
          newVal: rationalToString(divRational(m, sum)),
        }))
      : [];
    return { eligible, sum, preview, parsed };
  }, [massesInput, outcomes]);

  const handleApplyRepair = () => {
    if (!repairInfo.eligible) return;
    const newMasses = repairInfo.parsed.map((m) => rationalToString(divRational(m, repairInfo.sum)));
    setMassesInput(newMasses);
  };

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
        error: val.message || 'Invalid probability distribution.',
        space: null,
      };
    }

    return { valid: true, error: null, space };
  }, [outcomes, massesInput]);

  // Keep last valid result for "stale result" display when inputs are temporarily invalid
  const [lastValidResult, setLastValidResult] = useState<SetOperationResult | null>(() => {
    const q = createRational(1n, 4n);
    const initialSpace: FiniteSampleSpace = {
      outcomes: DEFAULT_OUTCOMES,
      masses: [q, q, q, q],
    };
    return calculateEventOperation(initialSpace, DEFAULT_EVENT_A, DEFAULT_EVENT_B, 'intersection');
  });

  useEffect(() => {
    if (parsedSpaceResult.valid && parsedSpaceResult.space) {
      setLastValidResult(calculateEventOperation(parsedSpaceResult.space, eventA, eventB, operation));
    }
  }, [parsedSpaceResult, eventA, eventB, operation]);

  const [activeResult, isStale] = useMemo(() => {
    if (parsedSpaceResult.valid && parsedSpaceResult.space) {
      const res = calculateEventOperation(parsedSpaceResult.space, eventA, eventB, operation);
      return [res, false] as const;
    }
    return [lastValidResult, true] as const;
  }, [parsedSpaceResult, eventA, eventB, operation, lastValidResult]);

  const toggleOutcomeInEvent = (outcome: string, eventType: 'A' | 'B') => {
    if (eventType === 'A') {
      setEventA((prev) =>
        prev.includes(outcome) ? prev.filter((x) => x !== outcome) : [...prev, outcome]
      );
    } else {
      setEventB((prev) =>
        prev.includes(outcome) ? prev.filter((x) => x !== outcome) : [...prev, outcome]
      );
    }
  };

  const handleMassChange = (index: number, val: string) => {
    setMassesInput((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleResetDefaults = () => {
    setMassesInput(DEFAULT_MASSES_STR);
    setEventA(DEFAULT_EVENT_A);
    setEventB(DEFAULT_EVENT_B);
    setOperation('intersection');
    setSnapshotName('Fair Coins Default');
  };

  const handleSaveSnapshot = () => {
    if (!activeResult || !activeResult.probabilityResult.value) return;
    const snap: LabComparisonSnapshot = {
      lab_id: 'PL-01',
      snapshot_id: `snap_pl01_${Date.now()}`,
      name: snapshotName.trim() || 'PL-01 Snapshot',
      timestamp: new Date().toLocaleString(),
      settings: {
        outcomes,
        massesInput,
        eventA,
        eventB,
        operation,
      },
      theoreticalOutputs: {
        operation,
        resultEvent: activeResult.resultEvent,
        probStr: rationalToString(activeResult.probabilityResult.value),
        probLatex: rationalToLatex(activeResult.probabilityResult.value),
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const s = savedSnapshot.settings;
    if (s.massesInput) setMassesInput(s.massesInput);
    if (s.eventA) setEventA(s.eventA);
    if (s.eventB) setEventB(s.eventB);
    if (s.operation) setOperation(s.operation);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-01');
    setSavedSnapshot(null);
  };

  const opSymbols: Record<SetOperation, string> = {
    intersection: 'A \\cap B',
    union: 'A \\cup B',
    complement: 'A^c = \\Omega \\setminus A',
    difference: 'A \\setminus B',
  };

  return (
    <LabShell
      labId="PL-01"
      labTitle="Event and Probability Builder"
      labSubtitle="How do events relate to outcomes, and how do event operations and valid probability assignments affect event probabilities?"
      sourceAttribution={{
        part: 'Part 1',
        chapter: 'Chapters 1–2: Sample Spaces & Axioms',
        isIllustrative: true,
      }}
      linkedModuleIds={['M01']}
      linkedConceptIds={['C-000001', 'C-000002', 'C-000003', 'C-000004']}
      isStale={isStale}
      errorCode={parsedSpaceResult.valid ? undefined : 'E-PROB-SUM'}
      errorMessage={parsedSpaceResult.error ?? undefined}
      repairEligible={repairInfo.eligible}
      repairPreview={repairInfo.preview}
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
            <div>Operation: <strong>{operation.toUpperCase()}</strong></div>
            <div>Event A: <code>&#123;{eventA.join(', ') || '∅'}&#125;</code></div>
            <div>Event B: <code>&#123;{eventB.join(', ') || '∅'}&#125;</code></div>
            {activeResult && activeResult.probabilityResult.value && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #dbeafe' }}>
                <div>Result: <code>&#123;{activeResult.resultEvent.join(', ') || '∅'}&#125;</code></div>
                <div>Probability: <strong>{rationalToString(activeResult.probabilityResult.value)}</strong></div>
              </div>
            )}
          </div>
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '6px', padding: '1rem', background: '#faf5ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#7e22ce' }}>Saved: "{saved.name}"</h4>
            <div>Operation: <strong>{saved.settings.operation?.toUpperCase()}</strong></div>
            <div>Event A: <code>&#123;{saved.settings.eventA?.join(', ') || '∅'}&#125;</code></div>
            <div>Event B: <code>&#123;{saved.settings.eventB?.join(', ') || '∅'}&#125;</code></div>
            {saved.theoreticalOutputs && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f3e8ff' }}>
                <div>Result: <code>&#123;{saved.theoreticalOutputs.resultEvent?.join(', ') || '∅'}&#125;</code></div>
                <div>Probability: <strong>{saved.theoreticalOutputs.probStr}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}
    >
      {/* Main Grid: Left Controls, Right Real-Time Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Sample Space & Events */}
        <div>
          {/* Sample space masses table */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              1. Sample Space & Probability Masses
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Edit individual outcome masses. Sum must equal 1.
            </p>
            <table className="table-custom" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Outcome (ω)</th>
                  <th>Mass p(ω)</th>
                  <th>In Event A</th>
                  <th>In Event B</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((item, idx) => (
                  <tr key={item}>
                    <td><code>{item}</code></td>
                    <td>
                      <input
                        type="text"
                        value={massesInput[idx]}
                        onChange={(e) => handleMassChange(idx, e.target.value)}
                        style={{
                          width: '70px',
                          padding: '0.25rem 0.4rem',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={eventA.includes(item)}
                        onChange={() => toggleOutcomeInEvent(item, 'A')}
                        aria-label={`Include ${item} in event A`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={eventB.includes(item)}
                        onChange={() => toggleOutcomeInEvent(item, 'B')}
                        aria-label={`Include ${item} in event B`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Event Operation Selector */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              2. Event Operation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="operation"
                  checked={operation === 'intersection'}
                  onChange={() => setOperation('intersection')}
                />
                <span><strong>Intersection</strong>: <MathView math="A \cap B" /> (both occur)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="operation"
                  checked={operation === 'union'}
                  onChange={() => setOperation('union')}
                />
                <span><strong>Union</strong>: <MathView math="A \cup B" /> (either or both occur)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="operation"
                  checked={operation === 'complement'}
                  onChange={() => setOperation('complement')}
                />
                <span><strong>Complement</strong>: <MathView math="A^c = \Omega \setminus A" /> (A does not occur)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="operation"
                  checked={operation === 'difference'}
                  onChange={() => setOperation('difference')}
                />
                <span><strong>Difference</strong>: <MathView math="A \setminus B" /> (A occurs and B does not)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Exact Math Output & Visual Venn/Table */}
        <div>
          <div className="card" style={{ borderTop: `4px solid ${isStale ? 'var(--warning)' : 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Theoretical Exact Result
              </h3>
              {isStale && <span className="badge badge-supplementary">Stale Result</span>}
            </div>

            {activeResult && activeResult.probabilityResult.value && (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Resulting Event Outcomes: <code>&#123;{activeResult.resultEvent.join(', ') || '∅ (Empty Set)'}&#125;</code>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <MathView
                    math={`P(${opSymbols[operation]}) = ${rationalToLatex(activeResult.probabilityResult.value)}`}
                    block
                  />
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Exact Rational: <strong>{rationalToString(activeResult.probabilityResult.value)}</strong>
                  {' '}&bull;{' '}
                  Precision: <code>{activeResult.probabilityResult.precision}</code>
                </div>
              </div>
            )}

            {/* Individual Event Probabilities */}
            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>EVENT A</div>
                <div style={{ fontSize: '0.85rem' }}>&#123;{eventA.join(', ') || '∅'}&#125;</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {parsedSpaceResult.space ? (
                    <MathView
                      math={`P(A) = ${calculateEventProbability(parsedSpaceResult.space, eventA).latex_value}`}
                    />
                  ) : '—'}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>EVENT B</div>
                <div style={{ fontSize: '0.85rem' }}>&#123;{eventB.join(', ') || '∅'}&#125;</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {parsedSpaceResult.space ? (
                    <MathView
                      math={`P(B) = ${calculateEventProbability(parsedSpaceResult.space, eventB).latex_value}`}
                    />
                  ) : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Venn Diagram */}
          {activeResult && (
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Interactive Venn Diagram
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Visual partition of sample space outcomes. Blue border highlights outcomes satisfying the active operation.
              </p>
              <VennDiagram
                outcomes={outcomes}
                eventA={eventA}
                eventB={eventB}
                resultEvent={activeResult.resultEvent}
                operation={operation}
                onToggleOutcome={toggleOutcomeInEvent}
              />
            </div>
          )}
        </div>
      </div>
    </LabShell>
  );
};
