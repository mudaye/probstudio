import React, { useState } from 'react';

export type HelpScreenType = 'atlas' | 'practice' | 'playground' | 'settings';

interface ContextualHelpBarProps {
  screen: HelpScreenType;
  title?: string;
  defaultExpanded?: boolean;
}

const HELP_CONTENT: Record<
  HelpScreenType,
  { defaultTitle: string; badge: string; points: { icon: string; title: string; desc: string }[] }
> = {
  atlas: {
    defaultTitle: 'Concept Atlas Context Guide',
    badge: 'Theory & Rigor',
    points: [
      {
        icon: '📖',
        title: '3-Part Deep Dives',
        desc: 'Each concept pairs intuitive reasoning with formal axiomatic definitions and real-world examples.',
      },
      {
        icon: '🧪',
        title: 'Linked Laboratories',
        desc: 'Click 🧪 lab badges to jump directly into the interactive simulation workbench for that concept.',
      },
      {
        icon: '🔖',
        title: 'Spaced Revision Flagging',
        desc: 'Click "Mark for Review" to push any challenging concept directly to your Dashboard review queue.',
      },
      {
        icon: '📑',
        title: 'Curriculum Filtering',
        desc: 'Filter by Module (M01–M22) using the left drawer or top filter button to focus on one topic at a time.',
      },
    ],
  },
  practice: {
    defaultTitle: 'Practice Gym Context Guide',
    badge: 'Deterministic CAS',
    points: [
      {
        icon: '🧮',
        title: 'Exact Rational Math',
        desc: 'Submit answers as exact fractions (e.g. 3/8, 1/2) or integers. Calculations are evaluated deterministically without rounding drift.',
      },
      {
        icon: '💡',
        title: 'Hints & Scaffolding',
        desc: 'Use progressive hints when stuck. Hint counts are tracked to calibrate authentic mastery progression.',
      },
      {
        icon: '🎯',
        title: 'Confidence Calibration',
        desc: 'After checking answers, select "I can explain this", "Partly", or "I need help" to guide spaced practice.',
      },
      {
        icon: '⏰',
        title: 'Review Due Filter',
        desc: 'Toggle "⏰ Review Due Only" in the toolbar to practice problems associated with concepts requiring reinforcement.',
      },
    ],
  },
  playground: {
    defaultTitle: 'Playground Labs Context Guide',
    badge: 'Simulation & Sandboxes',
    points: [
      {
        icon: '🔬',
        title: 'Live Parameter Tuning',
        desc: 'Drag sliders to watch PDFs, PMFs, staircase CDFs, and Venn diagrams update dynamically in real time.',
      },
      {
        icon: '📸',
        title: 'Laboratory Snapshots',
        desc: 'Save named experiments to compare current vs. baseline distributions side-by-side.',
      },
      {
        icon: '🎲',
        title: 'Deterministic PRNG',
        desc: 'Monte Carlo simulations use fixed seeds for fully repeatable, reproducible empirical trials.',
      },
      {
        icon: '⚖️',
        title: 'Normalization Repair',
        desc: 'When editing discrete masses or contingency tables, use the Normalize tool to enforce probability axioms.',
      },
    ],
  },
  settings: {
    defaultTitle: 'Settings & Storage Context Guide',
    badge: 'Local-First Data',
    points: [
      {
        icon: '💾',
        title: 'Local Browser Storage',
        desc: 'All learning progress, attempts, and lab snapshots remain completely private on your local machine.',
      },
      {
        icon: '📥',
        title: 'JSON Portability',
        desc: 'Export your complete state as a single JSON backup or import it onto another device anytime.',
      },
      {
        icon: '📋',
        title: 'Attempt Audit Log',
        desc: 'Review exact historical answers, mathematical derivations, timestamps, and CAS calculation IDs.',
      },
      {
        icon: '🔄',
        title: 'Safe Reset',
        desc: 'You can selectively clear or restore data whenever you wish to restart curriculum trials.',
      },
    ],
  },
};

export const ContextualHelpBar: React.FC<ContextualHelpBarProps> = ({
  screen,
  title,
  defaultExpanded = false,
}) => {
  const storageKey = `probstudio_context_help_${screen}`;
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    return defaultExpanded;
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const config = HELP_CONTENT[screen];
  const displayTitle = title || config.defaultTitle;

  return (
    <aside
      aria-label={displayTitle}
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1rem',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.55rem 0.9rem',
          background: isExpanded ? '#f1f5f9' : '#f8fafc',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={toggleExpand}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1rem' }}>💡</span>
          <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>
            {displayTitle}
          </strong>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            {config.badge}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          aria-expanded={isExpanded}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 500,
          }}
        >
          <span>{isExpanded ? 'Hide Tips' : 'Show Tips'}</span>
          <span style={{ fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            padding: '0.85rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.85rem',
            background: '#ffffff',
          }}
        >
          {config.points.map((pt, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-start',
                fontSize: '0.8rem',
              }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{pt.icon}</span>
              <div>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                  {pt.title}
                </strong>
                <span style={{ color: '#64748b', lineHeight: 1.4 }}>{pt.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
