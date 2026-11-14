import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToLatex,
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
import { MathView } from '../components/MathView';
import { LocalPersistenceService } from '../../core/storage/persistence';

const DEFAULT_OUTCOMES = ['HH', 'HT', 'TH', 'TT'];
const DEFAULT_MASSES_STR = ['1/4', '1/4', '1/4', '1/4'];
const DEFAULT_EVENT_A = ['HH', 'HT'];
const DEFAULT_EVENT_B = ['HH', 'TH'];

interface Snapshot {
  name: string;
  timestamp: string;
  operation: SetOperation;
  resultEvent: readonly string[];
  probDisplay: string;
  probLatex: string;
}

export const PlaygroundScreen: React.FC = () => {
  const [outcomes] = useState<string[]>(DEFAULT_OUTCOMES);
  const [massesInput, setMassesInput] = useState<string[]>(DEFAULT_MASSES_STR);
  const [eventA, setEventA] = useState<string[]>(DEFAULT_EVENT_A);
  const [eventB, setEventB] = useState<string[]>(DEFAULT_EVENT_B);
  const [operation, setOperation] = useState<SetOperation>('intersection');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-01',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-01: Event and Probability Builder',
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

  const [activeResult, isStale] = useMemo(() => {
    if (parsedSpaceResult.valid && parsedSpaceResult.space) {
      const res = calculateEventOperation(parsedSpaceResult.space, eventA, eventB, operation);
      setLastValidResult(res);
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
    setSnapshot(null);
  };

  const handleSaveSnapshot = () => {
    if (!activeResult || !activeResult.probabilityResult.value) return;
    setSnapshot({
      name: `Snapshot (${operation})`,
      timestamp: new Date().toLocaleTimeString(),
      operation,
      resultEvent: activeResult.resultEvent,
      probDisplay: rationalToString(activeResult.probabilityResult.value),
      probLatex: rationalToLatex(activeResult.probabilityResult.value),
    });
  };

  const opSymbols: Record<SetOperation, string> = {
    intersection: 'A \\cap B',
    union: 'A \\cup B',
    complement: 'A^c = \\Omega \\setminus A',
    difference: 'A \\setminus B',
  };

  return (
    <div className="playground-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="tag-label">Playground &bull; Guided Lab PL-01</span>
          <h1 className="card-title" style={{ marginTop: '0.25rem' }}>Event and Probability Builder</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            A-003 Approved Lab
          </span>
          <button className="btn-secondary btn-sm" onClick={handleResetDefaults}>
            ↺ Reset Defaults
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          <strong>Learning question:</strong> How do events relate to outcomes, and how do event operations and valid probability assignments affect event probabilities?
        </p>
      </div>

      {/* Validation warning if invalid masses */}
      {!parsedSpaceResult.valid && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Invalid probability assignment:</strong> {parsedSpaceResult.error}
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Showing results from the <em>last valid settings</em> (Stale Result).
            </div>
          </div>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setMassesInput(DEFAULT_MASSES_STR)}
          >
            Apply Fair 1/4 Each
          </button>
        </div>
      )}

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

            {/* Snapshot Actions */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-secondary btn-sm" onClick={handleSaveSnapshot}>
                📸 Save Comparison Snapshot
              </button>
              {snapshot && (
                <button className="btn-secondary btn-sm" onClick={() => setSnapshot(null)}>
                  Clear Snapshot
                </button>
              )}
            </div>
          </div>

          {/* Comparison Snapshot Card */}
          {snapshot && (
            <div className="card" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8' }}>
                  {snapshot.name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#9333ea' }}>{snapshot.timestamp}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#581c87' }}>
                Outcomes: <code>&#123;{snapshot.resultEvent.join(', ') || '∅'}&#125;</code>
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <MathView math={`P(${opSymbols[snapshot.operation]}) = ${snapshot.probLatex}`} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
