import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CmsPage from './pages/CmsPage';
import Roster from './pages/Roster';
import Events from './pages/Events';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AccessDenied from './pages/AccessDenied';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequirePermission } from './components/auth/RequirePermission';
import StaticErrorPage from './pages/StaticErrorPage';
import { useTranslation } from 'react-i18next';
import { useUIStore } from './store/useUIStore';
import GlobalErrorPopup from './components/ui/GlobalErrorPopup';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { t, i18n } = useTranslation();
  const { error, setError } = useUIStore();

  useEffect(() => {
    document.title = t('app.title');
  }, [t, i18n.language]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <GlobalErrorPopup message={error} onDismiss={() => setError(null)} />
      <div className="flex flex-col min-h-screen relative">
        <Header />
        <main className="flex-1 flex flex-col relative">
          <Routes>
            <Route path="/" element={<CmsPage slug="home" />} />
            <Route path="/legacy-home" element={<Home />} />
            <Route path="/pages/:slug" element={<CmsPage />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RequirePermission 
                  permission="admin:view" 
                  fallback={<AccessDenied />}
                >
                  <Admin />
                </RequirePermission>
              </ProtectedRoute>
            } />
            <Route path="/error" element={<StaticErrorPage />} />
            <Route path="*" element={<StaticErrorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
