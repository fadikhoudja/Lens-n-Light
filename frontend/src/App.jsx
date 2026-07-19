import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Gallery = lazy(() => import("./pages/Gallery"));
const Booking = lazy(() => import("./pages/Booking"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));

function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-muted/30 border-t-warm rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageTransition({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.classList.remove("page-enter");
      void el.offsetWidth;
      el.classList.add("page-enter");
    }
  }, [children]);
  return <div ref={ref} className="page-enter">{children}</div>;
}

function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 font-[family-name:var(--font-display)]">
      <h1 className="text-6xl text-warm/60 italic">404</h1>
      <p className="text-ink-muted">Page not found</p>
      <Link to="/" className="text-sm text-warm border border-warm/30 px-4 py-2 rounded-full btn hover:bg-warm/10 bg-transparent">
        Back to Gallery
      </Link>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
      <LanguageProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="min-h-screen text-ink">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={
                  <PageLayout>
                    <Gallery />
                  </PageLayout>
                } />
                <Route path="/book" element={
                  <PageLayout>
                    <Booking />
                  </PageLayout>
                } />
                <Route path="/admin/login" element={
                  <PageLayout>
                    <Login />
                  </PageLayout>
                } />
                <Route path="/admin" element={
                  <PageLayout>
                    <ProtectedRoute>
                      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
                        <Admin />
                      </div>
                    </ProtectedRoute>
                  </PageLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </HashRouter>
      </LanguageProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
