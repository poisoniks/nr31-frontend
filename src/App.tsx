import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Roster from './pages/Roster';
import Events from './pages/Events';
import Admin from './pages/Admin';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequirePermission } from './components/auth/RequirePermission';
import { useTranslation } from 'react-i18next';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.title');
  }, [t, i18n.language]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative">
        <Header />
        <main className="flex-1 flex flex-col relative z-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RequirePermission permission="admin:view" fallback={<div className="p-8 text-center text-nr-text">Access Denied</div>}>
                  <Admin />
                </RequirePermission>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
