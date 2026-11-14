import React, { useState } from 'react';
import { LabPL01 } from '../components/LabPL01';
import { LabPL02 } from '../components/LabPL02';
import { LabPL03 } from '../components/LabPL03';
import { LabPL04 } from '../components/LabPL04';
import { LabPL05 } from '../components/LabPL05';
import { LabPL06 } from '../components/LabPL06';
import { LabPL07 } from '../components/LabPL07';
import { LabPL08 } from '../components/LabPL08';
import { LabPL09 } from '../components/LabPL09';

export type GuidedLabId = 'PL-01' | 'PL-02' | 'PL-03' | 'PL-04' | 'PL-05' | 'PL-06' | 'PL-07' | 'PL-08' | 'PL-09';

export const PlaygroundScreen: React.FC = () => {
  const [activeLab, setActiveLab] = useState<GuidedLabId>('PL-01');

  return (
    <div className="playground-screen">
      {/* Guided Lab Selector Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingBottom: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginRight: '8px' }}>
          Select Laboratory:
        </span>
        <button
          onClick={() => setActiveLab('PL-01')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-01' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-01' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-01' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-01' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-01</span>
          <span>Event & Probability Builder</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-02')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-02' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-02' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-02' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-02' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-02</span>
          <span>Conditional & Bayes Lab</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-03')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-03' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-03' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-03' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-03' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-03</span>
          <span>Independence Laboratory</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-04')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-04' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-04' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-04' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-04' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-04</span>
          <span>Random Variable Mapper</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-05')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-05' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-05' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-05' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-05' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-05</span>
          <span>CDF & PMF Explorer</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-06')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-06' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-06' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-06' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-06' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-06</span>
          <span>Distribution Explorer</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-07')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-07' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-07' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-07' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-07' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-07</span>
          <span>Continuous Explorer</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-08')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-08' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-08' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-08' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-08' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-08</span>
          <span>Transform & Moments</span>
        </button>

        <button
          onClick={() => setActiveLab('PL-09')}
          style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeLab === 'PL-09' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeLab === 'PL-09' ? '#eff6ff' : '#ffffff',
            color: activeLab === 'PL-09' ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ background: activeLab === 'PL-09' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>PL-09</span>
          <span>Joint & Marginals</span>
        </button>
      </div>

      {/* Render Active Lab */}
      {activeLab === 'PL-01' && <LabPL01 />}
      {activeLab === 'PL-02' && <LabPL02 />}
      {activeLab === 'PL-03' && <LabPL03 />}
      {activeLab === 'PL-04' && <LabPL04 />}
      {activeLab === 'PL-05' && <LabPL05 />}
      {activeLab === 'PL-06' && <LabPL06 />}
      {activeLab === 'PL-07' && <LabPL07 />}
      {activeLab === 'PL-08' && <LabPL08 />}
      {activeLab === 'PL-09' && <LabPL09 />}
    </div>
  );
};
