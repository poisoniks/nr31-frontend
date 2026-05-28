import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequirePermission } from './components/auth/RequirePermission';
import { useTranslation } from 'react-i18next';
import { useUIStore } from './store/useUIStore';
import GlobalErrorPopup from './components/ui/GlobalErrorPopup';
import PageLoader from './components/ui/PageLoader';

// Lazy load page components
const CmsPage = lazy(() => import('./pages/CmsPage'));
const Roster = lazy(() => import('./pages/Roster'));
const Events = lazy(() => import('./pages/Events'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const StaticErrorPage = lazy(() => import('./pages/StaticErrorPage'));
const KbExplorer = lazy(() => import('./pages/kb/KbExplorer'));
const KbArticle = lazy(() => import('./pages/kb/KbArticle'));
const KbArticleEditor = lazy(() => import('./pages/kb/KbArticleEditor'));

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CmsPage slug="home" />} />
              <Route path="/pages/:slug" element={<CmsPage />} />
              <Route path="/roster" element={<Roster />} />
              <Route path="/events" element={<Events />} />
              <Route path="/kb" element={<KbExplorer />} />
              <Route path="/kb/article/:slug" element={<KbArticle />} />
              <Route path="/kb/article/:slug/edit" element={
                <ProtectedRoute>
                  <RequirePermission 
                    permission="kb:write" 
                    fallback={<AccessDenied />}
                  >
                    <KbArticleEditor />
                  </RequirePermission>
                </ProtectedRoute>
              } />
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
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/error" element={<StaticErrorPage />} />
              <Route path="*" element={<StaticErrorPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
