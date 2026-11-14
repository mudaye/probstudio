import React, { useMemo } from 'react';
import { SetOperation } from '../../core/math/types';
import { classifyVennOutcomes } from '../../core/math/venn';

interface VennDiagramProps {
  outcomes: readonly string[];
  eventA: readonly string[];
  eventB: readonly string[];
  resultEvent: readonly string[];
  operation: SetOperation;
  onToggleOutcome?: (outcome: string, event: 'A' | 'B') => void;
}

export const VennDiagram: React.FC<VennDiagramProps> = ({
  outcomes,
  eventA,
  eventB,
  resultEvent,
  operation,
  onToggleOutcome,
}) => {
  const classification = useMemo(() => {
    return classifyVennOutcomes(outcomes, eventA, eventB);
  }, [outcomes, eventA, eventB]);

  const resultSet = useMemo(() => new Set(resultEvent), [resultEvent]);

  // Labels for the active operation
  const opTitles: Record<SetOperation, string> = {
    intersection: 'Intersection (A ∩ B)',
    union: 'Union (A ∪ B)',
    complement: 'Complement (Aᶜ = Ω \\ A)',
    difference: 'Difference (A \\ B)',
  };

  const renderOutcomeBadge = (
    outcome: string,
    x: number,
    y: number
  ) => {
    const isIncluded = resultSet.has(outcome);
    return (
      <g
        key={outcome}
        transform={`translate(${x}, ${y})`}
        style={{ cursor: onToggleOutcome ? 'pointer' : 'default' }}
        onClick={() => {
          if (onToggleOutcome) {
            // Default toggle in Event A if clicked
            onToggleOutcome(outcome, 'A');
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Outcome ${outcome}: ${isIncluded ? 'Included in result' : 'Not in result'}`}
      >
        <rect
          x="-22"
          y="-14"
          width="44"
          height="28"
          rx="6"
          fill={isIncluded ? '#dbeafe' : '#ffffff'}
          stroke={isIncluded ? '#2563eb' : '#cbd5e1'}
          strokeWidth={isIncluded ? '2' : '1'}
          filter={isIncluded ? 'drop-shadow(0 2px 4px rgba(37,99,235,0.2))' : undefined}
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="12"
          fontWeight={isIncluded ? '700' : '600'}
          fill={isIncluded ? '#1e3a8a' : '#475569'}
          fontFamily="system-ui, sans-serif"
        >
          {outcome}
        </text>
        {isIncluded && (
          <circle cx="16" cy="-10" r="4" fill="#2563eb" />
        )}
      </g>
    );
  };

  // Helper to render multiple outcomes stacked/spaced inside a region
  const renderRegionOutcomes = (
    regionOutcomes: readonly string[],
    centerX: number,
    centerY: number
  ) => {
    if (regionOutcomes.length === 0) {
      return (
        <text
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="11"
          fill="#94a3b8"
          fontStyle="italic"
        >
          ∅ (empty)
        </text>
      );
    }

    // Space outcomes vertically or in a 2x2 grid if more than 2
    if (regionOutcomes.length === 1) {
      return renderOutcomeBadge(regionOutcomes[0], centerX, centerY);
    }

    if (regionOutcomes.length === 2) {
      return (
        <>
          {renderOutcomeBadge(regionOutcomes[0], centerX, centerY - 20)}
          {renderOutcomeBadge(regionOutcomes[1], centerX, centerY + 20)}
        </>
      );
    }

    // Grid layout for 3 or 4 outcomes
    return (
      <>
        {regionOutcomes.map((out, idx) => {
          const offsetX = (idx % 2 === 0 ? -26 : 26);
          const offsetY = (idx < 2 ? -18 : 18);
          return renderOutcomeBadge(out, centerX + offsetX, centerY + offsetY);
        })}
      </>
    );
  };

  return (
    <div className="venn-diagram-container">
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 440 260"
        className="venn-svg"
        role="img"
        aria-label={`Interactive Venn Diagram representing Sample Space Omega and events A and B. Current operation: ${opTitles[operation]}.`}
      >
        <title>Venn Diagram: {opTitles[operation]}</title>

        {/* Definitions for clip paths and gradients */}
        <defs>
          <clipPath id="circleA-clip">
            <circle cx="160" cy="130" r="82" />
          </clipPath>
          <clipPath id="circleB-clip">
            <circle cx="280" cy="130" r="82" />
          </clipPath>
        </defs>

        {/* Universal Sample Space Box (Omega) */}
        <rect
          x="10"
          y="10"
          width="420"
          height="240"
          rx="10"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <text
          x="24"
          y="32"
          fontSize="14"
          fontWeight="700"
          fill="#475569"
          fontFamily="system-ui, sans-serif"
        >
          Sample Space (Ω)
        </text>

        {/* Operation Shading Backdrop */}
        {operation === 'complement' && (
          <rect
            x="10"
            y="10"
            width="420"
            height="240"
            rx="10"
            fill="rgba(254, 240, 138, 0.25)"
          />
        )}

        {/* Circle A (Left Event) */}
        <circle
          cx="160"
          cy="130"
          r="82"
          fill={
            operation === 'union' || operation === 'difference'
              ? 'rgba(191, 219, 254, 0.4)'
              : 'rgba(239, 246, 255, 0.7)'
          }
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Circle B (Right Event) */}
        <circle
          cx="280"
          cy="130"
          r="82"
          fill={
            operation === 'union'
              ? 'rgba(187, 247, 208, 0.4)'
              : 'rgba(240, 253, 244, 0.7)'
          }
          stroke="#22c55e"
          strokeWidth="2"
        />

        {/* Highlighted Intersection Lens */}
        <g clipPath="url(#circleA-clip)">
          <circle
            cx="280"
            cy="130"
            r="82"
            fill={
              operation === 'intersection'
                ? 'rgba(147, 197, 253, 0.7)'
                : operation === 'difference'
                ? 'rgba(241, 245, 249, 0.8)'
                : 'rgba(219, 234, 254, 0.4)'
            }
          />
        </g>

        {/* Set Labels */}
        <text
          x="120"
          y="42"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#1d4ed8"
          fontFamily="system-ui, sans-serif"
        >
          Event A ({eventA.length})
        </text>

        <text
          x="320"
          y="42"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#15803d"
          fontFamily="system-ui, sans-serif"
        >
          Event B ({eventB.length})
        </text>

        {/* Outcomes in Region 1: Only in Event A (A \ B) */}
        {renderRegionOutcomes(classification.onlyA, 115, 130)}

        {/* Outcomes in Region 2: Both in A and B (A ∩ B) */}
        {renderRegionOutcomes(classification.bothAB, 220, 130)}

        {/* Outcomes in Region 3: Only in Event B (B \ A) */}
        {renderRegionOutcomes(classification.onlyB, 325, 130)}

        {/* Outcomes in Region 4: Outside both A and B ((A ∪ B)^c) */}
        {renderRegionOutcomes(classification.neitherAB, 385, 205)}

        <text
          x="385"
          y="238"
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          (A ∪ B)ᶜ
        </text>
      </svg>

      {/* Accessible Textual Equivalent (LAB-COMMON-ACCESS-01) */}
      <div className="venn-legend-accessible">
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Venn Region Breakdown ({opTitles[operation]}):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <strong>Only in A:</strong> &#123;{classification.onlyA.join(', ') || '∅'}&#125;
          </div>
          <div style={{ background: '#eff6ff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
            <strong>Both (A ∩ B):</strong> &#123;{classification.bothAB.join(', ') || '∅'}&#125;
          </div>
          <div style={{ background: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
            <strong>Only in B:</strong> &#123;{classification.onlyB.join(', ') || '∅'}&#125;
          </div>
          <div style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <strong>Outside Both:</strong> &#123;{classification.neitherAB.join(', ') || '∅'}&#125;
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#1e40af' }}>
          <strong>Resulting Event:</strong> &#123;{resultEvent.join(', ') || '∅'}&#125; (Highlighted with blue border)
        </div>
      </div>
    </div>
  );
};
