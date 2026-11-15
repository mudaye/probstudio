import React, { useState } from 'react';
import { PARTS, MODULES, ModuleInfo } from '../../core/content/modules';

interface ModuleNavDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string | null) => void;
  title?: string;
  subtitle?: string;
  onNavigate?: (route: string, params?: Record<string, string>) => void;
}

export const ModuleNavDrawer: React.FC<ModuleNavDrawerProps> = ({
  isOpen,
  onToggle,
  selectedModuleId,
  onSelectModule,
  title = 'Curriculum Modules',
  subtitle = 'Optional filter & index',
  onNavigate,
}) => {
  // Accordion state: by default, Part 1 is expanded
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({
    P1: true,
    P2: false,
    P3: false,
  });

  const togglePart = (partId: string) => {
    setExpandedParts((prev) => ({
      ...prev,
      [partId]: !prev[partId],
    }));
  };

  const handleModuleClick = (mod: ModuleInfo) => {
    if (selectedModuleId === mod.id) {
      // Toggle off if already selected
      onSelectModule(null);
    } else {
      onSelectModule(mod.id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop when open as overlay */}
      {isOpen && (
        <div
          className="drawer-backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`module-drawer ${isOpen ? 'open' : 'collapsed'}`}
        aria-label="Curriculum Modules Navigation"
      >
        {!isOpen ? (
          <div
            className="drawer-collapsed-bar"
            onClick={onToggle}
            title="Click to expand module filter menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }}
          >
            <button
              type="button"
              className="drawer-collapsed-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label="Expand module drawer"
              title="Expand module drawer"
            >
              <span style={{ fontSize: '1.15rem' }}>📑</span>
            </button>
            {selectedModuleId && (
              <span
                className="drawer-collapsed-badge"
                title={`Active Filter: ${selectedModuleId}`}
              >
                {selectedModuleId}
              </span>
            )}
            <div className="drawer-collapsed-label">
              <span>Filter Modules</span>
            </div>
          </div>
        ) : (
          <>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div>
                <h2 className="drawer-title">{title}</h2>
                <div className="drawer-subtitle">{subtitle}</div>
              </div>
              <button
                className="drawer-close-btn"
                onClick={onToggle}
                aria-label="Collapse module drawer"
                title="Collapse module drawer"
              >
                ✕
              </button>
            </div>

            <div className="drawer-content">
              {/* Clear / All Modules Option */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <button
                  className={`all-modules-btn ${selectedModuleId === null ? 'selected' : ''}`}
                  onClick={() => onSelectModule(null)}
                >
                  <span>🌐 All Modules (Full Catalogue)</span>
                  {selectedModuleId === null && <span className="active-dot">•</span>}
                </button>
              </div>

              {/* Accordion list of Parts */}
              <div className="parts-list">
                {PARTS.map((part) => {
                  const partModules = MODULES.filter((m) => m.partId === part.id);
                  const isExpanded = expandedParts[part.id] ?? false;
                  const hasSelectedModule = partModules.some((m) => m.id === selectedModuleId);

                  return (
                    <div key={part.id} className="part-accordion-item">
                      {/* Part Header */}
                      <button
                        className={`part-header-btn ${hasSelectedModule ? 'has-active' : ''}`}
                        onClick={() => togglePart(part.id)}
                        aria-expanded={isExpanded}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="accordion-arrow">{isExpanded ? '▼' : '▶'}</span>
                          <span className="part-header-title">{part.title}</span>
                        </div>
                        <span className="part-badge">{partModules.length}</span>
                      </button>

                      {/* Part Modules List */}
                      {isExpanded && (
                        <ul className="part-modules-list" role="list">
                          {partModules.map((mod) => {
                            const isSelected = selectedModuleId === mod.id;
                            return (
                              <li key={mod.id}>
                                <button
                                  className={`module-item-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => handleModuleClick(mod)}
                                  aria-current={isSelected ? 'true' : undefined}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                    <span className={`mod-id-badge ${mod.status === 'active' ? 'active' : 'planned'}`}>
                                      {mod.id}
                                    </span>
                                    <span className="mod-title-text" title={mod.title}>
                                      {mod.title}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {mod.labAssociation && onNavigate && (
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onNavigate('playground', { labId: mod.labAssociation! });
                                        }}
                                        title={`Launch Laboratory ${mod.labAssociation}`}
                                        style={{
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          background: '#faf5ff',
                                          color: '#7c3aed',
                                          border: '1px solid #d8b4fe',
                                          padding: '1px 5px',
                                          borderRadius: '3px',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        🧪 {mod.labAssociation}
                                      </span>
                                    )}
                                    {mod.status === 'active' ? (
                                      <span className="status-indicator active" title="Active content available" />
                                    ) : (
                                      <span className="status-indicator planned" title="Planned module" />
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
