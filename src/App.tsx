import React, { useState } from 'react';
import { DashboardScreen } from './ui/screens/DashboardScreen';
import { PracticeScreen } from './ui/screens/PracticeScreen';
import { ConceptScreen } from './ui/screens/ConceptScreen';
import { PlaygroundScreen } from './ui/screens/PlaygroundScreen';

type RouteType = 'dashboard' | 'practice' | 'atlas' | 'playground';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>('dashboard');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Context preservation across navigation
  const [practiceInput, setPracticeInput] = useState<string>('');

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route as RouteType);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-title">Probability Revision Studio</span>
          <span className="navbar-badge">Prototype Slice</span>
        </div>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <button
                className={`nav-button ${currentRoute === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentRoute === 'practice' ? 'active' : ''}`}
                onClick={() => navigateTo('practice')}
              >
                Practice Gym
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentRoute === 'atlas' ? 'active' : ''}`}
                onClick={() => navigateTo('atlas')}
              >
                Concept Atlas
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${currentRoute === 'playground' ? 'active' : ''}`}
                onClick={() => navigateTo('playground')}
              >
                Playground (PL-01)
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Feature View */}
      <main className="main-content">
        {currentRoute === 'dashboard' && <DashboardScreen onNavigate={navigateTo} />}
        {currentRoute === 'practice' && (
          <PracticeScreen
            onNavigate={navigateTo}
            savedInput={practiceInput}
            onSaveInput={setPracticeInput}
            initialModuleId={routeParams.moduleId}
          />
        )}
        {currentRoute === 'atlas' && (
          <ConceptScreen
            onNavigate={navigateTo}
            returnTo={routeParams.returnTo}
            initialModuleId={routeParams.moduleId}
          />
        )}
        {currentRoute === 'playground' && <PlaygroundScreen />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Probability Revision Studio &bull; Stage 0 Prototype Vertical Slice &bull; Review of Basic Probability Series
      </footer>
    </div>
  );
};
