import React, { useState, useEffect } from 'react';
import { LabPL01 } from '../components/LabPL01';
import { LabPL02 } from '../components/LabPL02';
import { LabPL03 } from '../components/LabPL03';
import { LabPL04 } from '../components/LabPL04';
import { LabPL05 } from '../components/LabPL05';
import { LabPL06 } from '../components/LabPL06';
import { LabPL07 } from '../components/LabPL07';
import { LabPL08 } from '../components/LabPL08';
import { LabPL09 } from '../components/LabPL09';
import { LabPL10 } from '../components/LabPL10';
import { LabPL11 } from '../components/LabPL11';
import { CustomExperimentBuilder } from '../components/CustomExperimentBuilder';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LocalPersistenceService } from '../../core/storage/persistence';

export type LabTabId =
  | 'PL-01'
  | 'PL-02'
  | 'PL-03'
  | 'PL-04'
  | 'PL-05'
  | 'PL-06'
  | 'PL-07'
  | 'PL-08'
  | 'PL-09'
  | 'PL-10'
  | 'PL-11'
  | 'EXP-BUILDER';

interface PlaygroundScreenProps {
  initialLabId?: string;
  initialPreset?: string;
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}

const LABS_METADATA: { id: LabTabId; badge: string; title: string; part: string }[] = [
  { id: 'PL-01', badge: 'PL-01', title: 'Event & Probability Builder', part: 'P1' },
  { id: 'PL-02', badge: 'PL-02', title: 'Conditional & Bayes Lab', part: 'P1' },
  { id: 'PL-03', badge: 'PL-03', title: 'Independence Laboratory', part: 'P1' },
  { id: 'PL-04', badge: 'PL-04', title: 'Random Variable Mapper', part: 'P1' },
  { id: 'PL-05', badge: 'PL-05', title: 'CDF & PMF Explorer', part: 'P1' },
  { id: 'PL-06', badge: 'PL-06', title: 'Distribution Explorer', part: 'P1' },
  { id: 'PL-07', badge: 'PL-07', title: 'Continuous Explorer', part: 'P2' },
  { id: 'PL-08', badge: 'PL-08', title: 'Transform & Moments', part: 'P2' },
  { id: 'PL-09', badge: 'PL-09', title: 'Joint & Marginals', part: 'P3' },
  { id: 'PL-10', badge: 'PL-10', title: 'Conditionals, Channel & Transforms', part: 'P3' },
  { id: 'PL-11', badge: 'PL-11', title: 'Central Limit Theorem & IID Sums', part: 'P2/P3' },
  { id: 'EXP-BUILDER', badge: 'BUILDER', title: 'Custom Experiment Builder', part: 'Universal' },
];

export const PlaygroundScreen: React.FC<PlaygroundScreenProps> = ({
  initialLabId = 'PL-01',
  initialPreset,
  onNavigate,
}) => {
  const [activeLab, setActiveLab] = useState<LabTabId>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/#\/playground\/([A-Za-z0-9_-]+)/);
      if (match && LABS_METADATA.some((m) => m.id === match[1])) {
        return match[1] as LabTabId;
      }
    }
    if (LABS_METADATA.some((m) => m.id === initialLabId)) {
      return initialLabId as LabTabId;
    }
    return 'PL-01';
  });

  const handleSelectLab = (id: LabTabId) => {
    setActiveLab(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#/playground/${id}`);
    }
  };

  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialLabId && LABS_METADATA.some((m) => m.id === initialLabId)) {
      setActiveLab(initialLabId as LabTabId);
    }
  }, [initialLabId]);

  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/#\/playground\/([A-Za-z0-9_-]+)/);
      if (match && LABS_METADATA.some((m) => m.id === match[1])) {
        setActiveLab(match[1] as LabTabId);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Export all snapshots & learner data to downloadable JSON
  const handleExportAll = () => {
    const jsonStr = LocalPersistenceService.exportLearnerStateJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `probability_studio_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import snapshots & learner data from file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const res = LocalPersistenceService.importLearnerStateJson(text);
        if (res.success) {
          setImportStatus(`Successfully restored ${res.importedSnapshots ?? 0} snapshots and ${res.importedAttempts} exercise attempts!`);
          setTimeout(() => setImportStatus(null), 5000);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      } catch (err) {
        setImportStatus('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="playground-screen">
      {/* Top Banner with Lab Selector & Snapshot Backup */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)' }}>
            PROBABILITY PLAYGROUND &bull; 11 GUIDED LABORATORIES & EXPERIMENT BUILDER
          </span>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Interactive, deterministic mathematical workbench conforming to A-003 and A-004 specifications.
          </div>
        </div>

        {/* Global Persistence Export/Import */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExportAll}
            className="btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            title="Export all lab snapshots and attempts to JSON"
          >
            💾 Export All Snapshots
          </button>
          <label
            className="btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}
            title="Import lab snapshots and attempts from JSON"
          >
            📂 Import State
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {importStatus && (
        <div
          style={{
            background: importStatus.startsWith('Import failed') ? '#fef2f2' : '#f0fdf4',
            color: importStatus.startsWith('Import failed') ? '#991b1b' : '#166534',
            border: `1px solid ${importStatus.startsWith('Import failed') ? '#fecaca' : '#bbf7d0'}`,
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '14px',
          }}
        >
          {importStatus}
        </div>
      )}

      {/* Guided Lab Selector Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          paddingBottom: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {LABS_METADATA.map((lab) => {
          const isActive = activeLab === lab.id;
          const isBuilder = lab.id === 'EXP-BUILDER';
          return (
            <button
              key={lab.id}
              onClick={() => handleSelectLab(lab.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: isActive
                  ? isBuilder ? '1px solid #7c3aed' : '1px solid #2563eb'
                  : '1px solid #cbd5e1',
                background: isActive
                  ? isBuilder ? '#faf5ff' : '#eff6ff'
                  : '#ffffff',
                color: isActive
                  ? isBuilder ? '#6b21a8' : '#1d4ed8'
                  : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  background: isActive
                    ? isBuilder ? '#7c3aed' : '#2563eb'
                    : '#94a3b8',
                  color: '#fff',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '0.72rem',
                }}
              >
                {lab.badge}
              </span>
              <span>{lab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Lab */}
      <ErrorBoundary key={activeLab} fallbackTitle={`Lab ${activeLab} encountered an unexpected issue`}>
        {activeLab === 'PL-01' && <LabPL01 initialPreset={initialPreset} onNavigate={onNavigate} />}
        {activeLab === 'PL-02' && <LabPL02 initialPreset={initialPreset} onNavigate={onNavigate} />}
        {activeLab === 'PL-03' && <LabPL03 />}
        {activeLab === 'PL-04' && <LabPL04 />}
        {activeLab === 'PL-05' && <LabPL05 />}
        {activeLab === 'PL-06' && <LabPL06 />}
        {activeLab === 'PL-07' && <LabPL07 />}
        {activeLab === 'PL-08' && <LabPL08 />}
        {activeLab === 'PL-09' && <LabPL09 />}
        {activeLab === 'PL-10' && <LabPL10 />}
        {activeLab === 'PL-11' && <LabPL11 onNavigate={onNavigate} />}
        {activeLab === 'EXP-BUILDER' && <CustomExperimentBuilder onNavigate={onNavigate} />}
      </ErrorBoundary>
    </div>
  );
};
