import React, { useState, useEffect } from 'react';
import { DashboardScreen } from './ui/screens/DashboardScreen';
import { PracticeScreen } from './ui/screens/PracticeScreen';
import { ConceptScreen } from './ui/screens/ConceptScreen';
import { PlaygroundScreen } from './ui/screens/PlaygroundScreen';

type RouteType = 'dashboard' | 'practice' | 'atlas' | 'playground';

function parseHash(): { route: RouteType; params: Record<string, string> } {
  if (typeof window === 'undefined') return { route: 'dashboard', params: {} };
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!rawHash) return { route: 'dashboard', params: {} };

  const [pathPart, queryPart] = rawHash.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const routeName = (segments[0] || 'dashboard') as RouteType;

  const params: Record<string, string> = {};
  if (segments.length > 1) {
    if (routeName === 'playground') params.labId = segments[1];
    if (routeName === 'atlas') params.conceptId = segments[1];
    if (routeName === 'practice') params.exerciseId = segments[1];
  }

  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
  }

  const validRoutes: RouteType[] = ['dashboard', 'practice', 'atlas', 'playground'];
  if (validRoutes.includes(routeName)) {
    return { route: routeName, params };
  }
  return { route: 'dashboard', params: {} };
}

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>(() => parseHash().route);
  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => parseHash().params);

  // Context preservation across navigation
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [lastActiveLab, setLastActiveLab] = useState<string>(() => parseHash().params.labId || 'PL-01');

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    const r = route as RouteType;
    setCurrentRoute(r);

    const mergedParams = { ...params };
    if (r === 'playground' && !mergedParams.labId) {
      mergedParams.labId = lastActiveLab;
    }
    setRouteParams(mergedParams);

    if (mergedParams.labId) {
      setLastActiveLab(mergedParams.labId);
    }

    // Sync to window.location.hash
    let newHash = `#/${r}`;
    if (r === 'playground' && mergedParams.labId) {
      newHash = `#/${r}/${mergedParams.labId}`;
    } else if (r === 'atlas' && mergedParams.conceptId) {
      newHash = `#/${r}/${mergedParams.conceptId}`;
    } else if (r === 'practice' && mergedParams.exerciseId) {
      newHash = `#/${r}/${mergedParams.exerciseId}`;
    }
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseHash();
      setCurrentRoute(parsed.route);
      setRouteParams(parsed.params);
      if (parsed.params.labId) {
        setLastActiveLab(parsed.params.labId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Global Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-title">ProbStudio</span>
          <span className="navbar-badge">Interactive Learning & Lab</span>
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
                onClick={() => navigateTo('playground', { labId: lastActiveLab })}
              >
                Playground Labs
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
            initialExerciseId={routeParams.exerciseId}
          />
        )}
        {currentRoute === 'atlas' && (
          <ConceptScreen
            onNavigate={navigateTo}
            returnTo={routeParams.returnTo}
            initialModuleId={routeParams.moduleId}
            initialConceptId={routeParams.conceptId}
          />
        )}
        {currentRoute === 'playground' && (
          <PlaygroundScreen
            initialLabId={routeParams.labId || lastActiveLab}
            initialPreset={routeParams.preset}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        ProbStudio &bull; Review of Basic Probability Series &bull; Deterministic Mathematical Laboratory
      </footer>
    </div>
  );
};
