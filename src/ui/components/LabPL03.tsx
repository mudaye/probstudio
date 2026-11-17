import React, { useState, useMemo, useEffect } from 'react';
import {
  createRational,
  parseRational,
  rationalToString,
  rationalToDecimal,
  rationalToLatex,
  Rational,
} from '../../core/math/rational';
import {
  FiniteSampleSpace,
} from '../../core/math/types';
import {
  validateSampleSpace,
  calculateEventProbability,
} from '../../core/math/events';
import {
  calculatePairwiseIndependence,
  calculateMutualIndependence,
  calculateConditionalIndependence,
} from '../../core/math/independence';
import { MathView } from './MathView';
import { LabShell } from './LabShell';
import { LocalPersistenceService, LabComparisonSnapshot } from '../../core/storage/persistence';

export type LabPL03Mode = 'pairwise' | 'mutual' | 'conditional';

interface LabPL03Props {
  onNavigate?: (route: string, params?: Record<string, string>) => void;
  initialPreset?: string;
}

export const LabPL03: React.FC<LabPL03Props> = ({ onNavigate }) => {
  // Outcomes & masses
  const [outcomes, setOutcomes] = useState<string[]>(['HH', 'HT', 'TH', 'TT']);
  const [massesInput, setMassesInput] = useState<string[]>(['1/4', '1/4', '1/4', '1/4']);

  // Events A, B, C
  const [eventA, setEventA] = useState<string[]>(['HH', 'HT']); // First toss H
  const [eventB, setEventB] = useState<string[]>(['HH', 'TH']); // Second toss H
  const [eventC, setEventC] = useState<string[]>(['HH', 'TT']); // Tosses match

  const [mode, setMode] = useState<LabPL03Mode>('pairwise');
  const [conditioningEventChoice, setConditioningEventChoice] = useState<'A' | 'B' | 'C'>('C');
  
  const [snapshotName, setSnapshotName] = useState<string>('Baseline Independence Setup');
  const [savedSnapshot, setSavedSnapshot] = useState<LabComparisonSnapshot | null>(() =>
    LocalPersistenceService.getLabSnapshot('PL-03')
  );

  useEffect(() => {
    LocalPersistenceService.recordActivity({
      target_id: 'PL-03',
      activity_type: 'lab_interaction',
      description: 'Opened Guided Lab PL-03: Independence Laboratory',
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
        error: val.message || 'Invalid probability distribution: outcome masses must sum to 1.',
        space: null,
      };
    }

    return { valid: true, error: null, space };
  }, [outcomes, massesInput]);

  // Last valid space fallback for stale result handling
  const [lastValidSpace, setLastValidSpace] = useState<FiniteSampleSpace>(() => {
    const q = createRational(1n, 4n);
    return {
      outcomes: ['HH', 'HT', 'TH', 'TT'],
      masses: [q, q, q, q],
    };
  });

  useEffect(() => {
    if (parsedSpaceResult.valid && parsedSpaceResult.space) {
      setLastValidSpace(parsedSpaceResult.space);
    }
  }, [parsedSpaceResult]);

  const activeSpace = parsedSpaceResult.valid && parsedSpaceResult.space ? parsedSpaceResult.space : lastValidSpace;
  const isStale = !parsedSpaceResult.valid;

  // Toggle outcome membership
  const toggleOutcome = (outcome: string, targetEvent: 'A' | 'B' | 'C') => {
    const updater = (prev: string[]) =>
      prev.includes(outcome) ? prev.filter((x) => x !== outcome) : [...prev, outcome];
    if (targetEvent === 'A') setEventA(updater);
    else if (targetEvent === 'B') setEventB(updater);
    else setEventC(updater);
  };

  const handleMassChange = (index: number, val: string) => {
    setMassesInput((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Presets
  const applyPreset1 = () => {
    // Default: Pairwise but not mutual
    setOutcomes(['HH', 'HT', 'TH', 'TT']);
    setMassesInput(['1/4', '1/4', '1/4', '1/4']);
    setEventA(['HH', 'HT']);
    setEventB(['HH', 'TH']);
    setEventC(['HH', 'TT']);
    setMode('pairwise');
  };

  const applyPreset2 = () => {
    // 3 Mutually Independent Coins
    const o = ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'];
    setOutcomes(o);
    setMassesInput(Array(8).fill('1/8'));
    setEventA(['HHH', 'HHT', 'HTH', 'HTT']); // Coin 1 H
    setEventB(['HHH', 'HHT', 'THH', 'THT']); // Coin 2 H
    setEventC(['HHH', 'HTH', 'THH', 'TTH']); // Coin 3 H
    setMode('mutual');
  };

  const applyPreset3 = () => {
    // Conditional test preset
    applyPreset1();
    setMode('conditional');
    setConditioningEventChoice('C');
  };

  const applyPresetZeroEvidence = () => {
    applyPreset1();
    setEventC([]); // empty event
    setMode('conditional');
    setConditioningEventChoice('C');
  };

  // Pairwise Calculations
  const pairwiseAB = useMemo(
    () => calculatePairwiseIndependence(activeSpace, eventA, eventB),
    [activeSpace, eventA, eventB]
  );
  const pairwiseAC = useMemo(
    () => calculatePairwiseIndependence(activeSpace, eventA, eventC),
    [activeSpace, eventA, eventC]
  );
  const pairwiseBC = useMemo(
    () => calculatePairwiseIndependence(activeSpace, eventB, eventC),
    [activeSpace, eventB, eventC]
  );

  // Complement of B
  const eventBComp = useMemo(
    () => outcomes.filter((x) => !eventB.includes(x)),
    [outcomes, eventB]
  );
  const pairwiseA_BComp = useMemo(
    () => calculatePairwiseIndependence(activeSpace, eventA, eventBComp),
    [activeSpace, eventA, eventBComp]
  );

  // Mutual Calculations
  const mutualResult = useMemo(() => {
    return calculateMutualIndependence(activeSpace, [
      { name: 'A', outcomes: eventA },
      { name: 'B', outcomes: eventB },
      { name: 'C', outcomes: eventC },
    ]);
  }, [activeSpace, eventA, eventB, eventC]);

  // Conditional Independence Calculation
  const condEventOutcomes = conditioningEventChoice === 'A' ? eventA : conditioningEventChoice === 'B' ? eventB : eventC;
  const condOther1 = conditioningEventChoice === 'A' ? eventB : eventA;
  const condOther2 = conditioningEventChoice === 'C' ? eventB : eventC;
  const condOther1Name = conditioningEventChoice === 'A' ? 'B' : 'A';
  const condOther2Name = conditioningEventChoice === 'C' ? 'B' : 'C';

  const conditionalResult = useMemo(() => {
    return calculateConditionalIndependence(activeSpace, condOther1, condOther2, condEventOutcomes);
  }, [activeSpace, condOther1, condOther2, condEventOutcomes]);

  const handleSaveSnapshot = () => {
    const snap: LabComparisonSnapshot = {
      snapshot_id: `PL03-SNAP-${Date.now()}`,
      lab_id: 'PL-03',
      name: snapshotName.trim() || 'Independence Snapshot',
      timestamp: new Date().toISOString(),
      parameters: {
        mode,
        outcomes,
        massesInput,
        eventA,
        eventB,
        eventC,
        conditioningEventChoice,
      },
      results: {
        isPairwiseIndependent: pairwiseAB.isIndependent,
        isMutuallyIndependent: mutualResult.isMutuallyIndependent,
        isConditionallyIndependent: conditionalResult.isConditionallyIndependent,
      },
    };
    LocalPersistenceService.saveLabSnapshot(snap);
    setSavedSnapshot(snap);
  };

  const handleRestoreSnapshot = () => {
    if (!savedSnapshot) return;
    const p = savedSnapshot.parameters;
    if (p.mode) setMode(p.mode as LabPL03Mode);
    if (p.outcomes) setOutcomes(p.outcomes);
    if (p.massesInput) setMassesInput(p.massesInput);
    if (p.eventA) setEventA(p.eventA);
    if (p.eventB) setEventB(p.eventB);
    if (p.eventC) setEventC(p.eventC);
    if (p.conditioningEventChoice) setConditioningEventChoice(p.conditioningEventChoice);
  };

  const handleDeleteSnapshot = () => {
    LocalPersistenceService.deleteLabSnapshot('PL-03');
    setSavedSnapshot(null);
  };

  return (
    <LabShell
      labId="PL-03"
      labTitle="Independence Laboratory"
      labSubtitle="Which independence claims hold for the selected events, and how can pairwise, mutual, and conditional independence differ?"
      sourceAttribution={{
        part: 'Part 1',
        chapter: 'Chapter 4: Independence and conditional independence',
        isIllustrative: true,
      }}
      linkedModuleIds={['M04']}
      linkedConceptIds={['C-000005', 'C-000006']}
      isStale={!parsedSpaceResult.valid}
      errorCode={parsedSpaceResult.valid ? undefined : 'E-PROB-SUM'}
      errorMessage={parsedSpaceResult.error ?? undefined}
      snapshotName={snapshotName}
      onSnapshotNameChange={setSnapshotName}
      savedSnapshot={savedSnapshot}
      onSaveSnapshot={handleSaveSnapshot}
      onRestoreSnapshot={handleRestoreSnapshot}
      onDeleteSnapshot={handleDeleteSnapshot}
      onReset={applyPreset1}
      onNavigate={onNavigate}
      renderSnapshotComparison={(saved) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', background: '#eff6ff' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#1d4ed8' }}>Active Configuration</h4>
            <div>Mode: <strong>{mode.toUpperCase()}</strong></div>
            <div>Pairwise: <strong>{pairwiseAB.isIndependent ? 'Independent' : 'Dependent'}</strong></div>
            <div>Mutual: <strong>{mutualResult.isMutuallyIndependent ? 'Independent' : 'Dependent'}</strong></div>
            <div>Conditional: <strong>{conditionalResult.isConditionallyIndependent ? 'Independent' : 'Dependent'}</strong></div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Saved: {saved.name}</h4>
            <div>Mode: <strong>{String(saved.parameters?.mode).toUpperCase()}</strong></div>
            <div>Pairwise: <strong>{saved.results?.isPairwiseIndependent ? 'Independent' : 'Dependent'}</strong></div>
            <div>Mutual: <strong>{saved.results?.isMutuallyIndependent ? 'Independent' : 'Dependent'}</strong></div>
            <div>Conditional: <strong>{saved.results?.isConditionallyIndependent ? 'Independent' : 'Dependent'}</strong></div>
          </div>
        </div>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Presets */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--surface, #ffffff)',
            borderRadius: '8px',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Presets:</span>
          <button
            onClick={applyPreset1}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Pairwise but Not Mutual (Classic 2-Coin)
          </button>
          <button
            onClick={applyPreset2}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            3 Mutually Independent Coins
          </button>
          <button
            onClick={applyPreset3}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              border: '1px solid #94a3b8',
              background: '#f1f5f9',
              cursor: 'pointer',
            }}
          >
            Conditional Independence Test (A ⊥̸ B | C)
          </button>
          <button
            onClick={applyPresetZeroEvidence}
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
            Zero Conditioning Mass (E-COND-ZERO)
          </button>
        </div>
      </div>

      {/* Validation warning if invalid masses */}
      {isStale && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '6px',
            color: '#b45309',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>Invalid probability assignment:</strong> {parsedSpaceResult.error}
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              Showing results from the <em>last valid settings</em> (Stale Result).
            </div>
          </div>
          <button
            onClick={applyPreset1}
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #d97706',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Restore Fair 1/4 Each
          </button>
        </div>
      )}

      {/* Main Grid: Controls (Left) & Theoretical Verification (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 400px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Sample Space & Event Editor */}
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
            1. Sample Space & Event Memberships
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
            Select which outcomes belong to events A, B, and C.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Outcome (ω)</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>Mass p(ω)</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>In A</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>In B</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>In C</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((item, idx) => (
                <tr key={item} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px', fontWeight: 600 }}>
                    <code>{item}</code>
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="text"
                      value={massesInput[idx]}
                      onChange={(e) => handleMassChange(idx, e.target.value)}
                      style={{
                        width: '55px',
                        padding: '2px 4px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={eventA.includes(item)}
                      onChange={() => toggleOutcome(item, 'A')}
                      aria-label={`Include ${item} in event A`}
                    />
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={eventB.includes(item)}
                      onChange={() => toggleOutcome(item, 'B')}
                      aria-label={`Include ${item} in event B`}
                    />
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={eventC.includes(item)}
                      onChange={() => toggleOutcome(item, 'C')}
                      aria-label={`Include ${item} in event C`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Event Probability Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: '#1d4ed8' }}>Event A</div>
              <div>{calculateEventProbability(activeSpace, eventA).display_value}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: '#166534' }}>Event B</div>
              <div>{calculateEventProbability(activeSpace, eventB).display_value}</div>
            </div>
            <div style={{ background: '#faf5ff', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: '#7e22ce' }}>Event C</div>
              <div>{calculateEventProbability(activeSpace, eventC).display_value}</div>
            </div>
          </div>

          {/* Test Mode Selector */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
              2. Independence Test Mode
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mode === 'pairwise' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: mode === 'pairwise' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: mode === 'pairwise' ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="test_mode"
                  checked={mode === 'pairwise'}
                  onChange={() => setMode('pairwise')}
                />
                Pairwise Independence (<MathView math="P(X \cap Y) = P(X)P(Y)" />)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mode === 'mutual' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: mode === 'mutual' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: mode === 'mutual' ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="test_mode"
                  checked={mode === 'mutual'}
                  onChange={() => setMode('mutual')}
                />
                Mutual (Total) Independence (All Subsets of &#123;A, B, C&#125;)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: mode === 'conditional' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: mode === 'conditional' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: mode === 'conditional' ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="test_mode"
                  checked={mode === 'conditional'}
                  onChange={() => setMode('conditional')}
                />
                Conditional Independence (<MathView math="P(A \cap B \mid C) = P(A \mid C)P(B \mid C)" />)
              </label>
            </div>
          </div>

          {/* Conditional Event Selector if in conditional mode */}
          {mode === 'conditional' && (
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Conditioning Event:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['C', 'A', 'B'] as const).map((evName) => (
                  <button
                    key={evName}
                    onClick={() => setConditioningEventChoice(evName)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: conditioningEventChoice === evName ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: conditioningEventChoice === evName ? '#dbeafe' : '#ffffff',
                      color: conditioningEventChoice === evName ? '#1e40af' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Event {evName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Snapshot Button */}
          <button
            onClick={handleSaveSnapshot}
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📸 Take Snapshot
          </button>
        </div>

        {/* Right Column: Theoretical Exact Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Results Card */}
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
                {mode === 'pairwise' && 'Pairwise Independence Verification'}
                {mode === 'mutual' && 'Mutual (Total) Independence Verification'}
                {mode === 'conditional' && `Conditional Independence Given Event ${conditioningEventChoice}`}
              </h3>
              <span
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#475569',
                }}
              >
                Engine: {mode === 'pairwise' ? 'CAL-IND-001' : mode === 'mutual' ? 'CAL-IND-002' : 'CAL-IND-003'}
              </span>
            </div>

            {/* Mode A: Pairwise Independence Table */}
            {mode === 'pairwise' && (
              <div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Two events <MathView math="X" /> and <MathView math="Y" /> are independent iff the joint probability matches the product of marginals: <MathView math="P(X \cap Y) = P(X)P(Y)" />.
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Event Pair</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Joint <MathView math="P(X \cap Y)" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Product <MathView math="P(X)P(Y)" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Difference <MathView math="\Delta" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pair A and B */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>A and B</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAB.probIntersection)} ({(rationalToDecimal(pairwiseAB.probIntersection, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAB.probProduct)} ({(rationalToDecimal(pairwiseAB.probProduct, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAB.difference)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: pairwiseAB.isIndependent ? '#dcfce7' : '#fee2e2',
                            color: pairwiseAB.isIndependent ? '#166534' : '#991b1b',
                          }}
                        >
                          {pairwiseAB.isIndependent ? '✓ INDEPENDENT' : '✗ DEPENDENT'}
                        </span>
                      </td>
                    </tr>

                    {/* Pair A and C */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>A and C</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAC.probIntersection)} ({(rationalToDecimal(pairwiseAC.probIntersection, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAC.probProduct)} ({(rationalToDecimal(pairwiseAC.probProduct, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseAC.difference)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: pairwiseAC.isIndependent ? '#dcfce7' : '#fee2e2',
                            color: pairwiseAC.isIndependent ? '#166534' : '#991b1b',
                          }}
                        >
                          {pairwiseAC.isIndependent ? '✓ INDEPENDENT' : '✗ DEPENDENT'}
                        </span>
                      </td>
                    </tr>

                    {/* Pair B and C */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>B and C</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseBC.probIntersection)} ({(rationalToDecimal(pairwiseBC.probIntersection, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseBC.probProduct)} ({(rationalToDecimal(pairwiseBC.probProduct, 4) * 100).toFixed(1)}%)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseBC.difference)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: pairwiseBC.isIndependent ? '#dcfce7' : '#fee2e2',
                            color: pairwiseBC.isIndependent ? '#166534' : '#991b1b',
                          }}
                        >
                          {pairwiseBC.isIndependent ? '✓ INDEPENDENT' : '✗ DEPENDENT'}
                        </span>
                      </td>
                    </tr>

                    {/* Pair A and Complement of B */}
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                        A and Bᶜ (Complement Invariance)
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseA_BComp.probIntersection)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseA_BComp.probProduct)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {rationalToString(pairwiseA_BComp.difference)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: pairwiseA_BComp.isIndependent ? '#dcfce7' : '#fee2e2',
                            color: pairwiseA_BComp.isIndependent ? '#166534' : '#991b1b',
                          }}
                        >
                          {pairwiseA_BComp.isIndependent ? '✓ INDEPENDENT' : '✗ DEPENDENT'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Mode B: Mutual Independence */}
            {mode === 'mutual' && (
              <div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Mutual independence requires that <em>every</em> subset of size <MathView math="k \ge 2" /> factorizes: <MathView math="P(\cap_{i \in S} A_i) = \prod_{i \in S} P(A_i)" />.
                </p>

                {/* Verdict Banner */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    background: mutualResult.isMutuallyIndependent
                      ? '#dcfce7'
                      : mutualResult.isPairwiseIndependent
                      ? '#eff6ff'
                      : '#fee2e2',
                    border: mutualResult.isMutuallyIndependent
                      ? '1px solid #86efac'
                      : mutualResult.isPairwiseIndependent
                      ? '1px solid #bfdbfe'
                      : '1px solid #fca5a5',
                    color: mutualResult.isMutuallyIndependent
                      ? '#166534'
                      : mutualResult.isPairwiseIndependent
                      ? '#1e40af'
                      : '#991b1b',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {mutualResult.isMutuallyIndependent
                      ? '✓ Fully Mutually Independent'
                      : mutualResult.isPairwiseIndependent
                      ? '⚡ Pairwise Independent, but NOT Mutually Independent'
                      : '✗ Dependent'}
                  </div>
                  <div style={{ fontSize: '0.84rem' }}>{mutualResult.message}</div>
                </div>

                {/* Sub-family conditions table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Sub-family Condition</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Joint <MathView math="P(\cap)" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Product <MathView math="\prod P" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Difference <MathView math="\Delta" /></th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Condition Met?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mutualResult.checks.map((chk) => (
                      <tr key={chk.eventNames.join(',')} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>
                          <MathView math={`P(${chk.eventNames.join(' \\cap ')}) \\stackrel{?}{=} ${chk.eventNames.map((n) => `P(${n})`).join('')}`} />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{rationalToString(chk.jointProb)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{rationalToString(chk.productProb)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{rationalToString(chk.difference)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: chk.isSatisfied ? '#dcfce7' : '#fee2e2',
                              color: chk.isSatisfied ? '#166534' : '#991b1b',
                            }}
                          >
                            {chk.isSatisfied ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mode C: Conditional Independence */}
            {mode === 'conditional' && (
              <div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Testing whether <MathView math={`${condOther1Name} \\perp ${condOther2Name} \\mid ${conditioningEventChoice}`} />.
                </p>

                {conditionalResult.status === 'undefined' ? (
                  <div style={{ padding: '14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      ⚠️ {conditionalResult.error_code}: Result Undefined
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Conditioning event <MathView math={`P(${conditioningEventChoice}) = 0`} />. Conditional probability and conditional independence cannot be evaluated on an impossible event.
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Verdict */}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        background: conditionalResult.isConditionallyIndependent ? '#dcfce7' : '#fee2e2',
                        border: conditionalResult.isConditionallyIndependent ? '1px solid #86efac' : '1px solid #fca5a5',
                        color: conditionalResult.isConditionallyIndependent ? '#166534' : '#991b1b',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {conditionalResult.isConditionallyIndependent
                          ? `✓ Events ${condOther1Name} and ${condOther2Name} ARE conditionally independent given ${conditioningEventChoice}.`
                          : `✗ Events ${condOther1Name} and ${condOther2Name} are NOT conditionally independent given ${conditioningEventChoice}.`}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Joint Conditional <MathView math={`P(${condOther1Name} \\cap ${condOther2Name} \\mid ${conditioningEventChoice})`} />
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>
                          {rationalToString(conditionalResult.probIntersectionGivenC.exact_rational!)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {(rationalToDecimal(conditionalResult.probIntersectionGivenC.exact_rational!, 4) * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Product of Conditionals <MathView math={`P(${condOther1Name}\\mid ${conditioningEventChoice}) P(${condOther2Name}\\mid ${conditioningEventChoice})`} />
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>
                          {rationalToString(conditionalResult.condProduct!)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {(rationalToDecimal(conditionalResult.condProduct!, 4) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Breakdown LaTeX */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <MathView
                        math={`\\begin{aligned} &P(${condOther1Name} \\mid ${conditioningEventChoice}) = ${rationalToLatex(conditionalResult.probAGivenC.exact_rational!)}, \\quad P(${condOther2Name} \\mid ${conditioningEventChoice}) = ${rationalToLatex(conditionalResult.probBGivenC.exact_rational!)} \\\\[4pt] &\\Delta = P(${condOther1Name} \\cap ${condOther2Name} \\mid ${conditioningEventChoice}) - P(${condOther1Name} \\mid ${conditioningEventChoice})P(${condOther2Name} \\mid ${conditioningEventChoice}) = ${rationalToLatex(conditionalResult.difference!)} \\end{aligned}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Key Mathematical Insight Callout */}
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
              💡 Mathematical Insight: Pairwise vs. Mutual & Conditional Independence
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              In the default two-coin toss setup, <MathView math="A" /> (first toss H), <MathView math="B" /> (second toss H), and <MathView math="C" /> (tosses match) are <em>pairwise independent</em>: knowing any single event gives no information about either of the other two. However, knowing both <MathView math="A" /> and <MathView math="C" /> completely determines <MathView math="B" />! Hence, the triple is <strong>not mutually independent</strong>, and conditioning on <MathView math="C" /> breaks the unconditional independence between <MathView math="A" /> and <MathView math="B" />.
            </p>
          </div>
        </div>
      </div>
    </LabShell>
  );
};
