import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const Gallery = lazy(() => import("./pages/Gallery"));
const Booking = lazy(() => import("./pages/Booking"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}

function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
        <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-zinc-400 text-lg">Page not found</p>
      <a href="/" className="text-sm text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-500/10 transition-all">
        Back to Gallery
      </a>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-zinc-900 text-white">
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
        </BrowserRouter>
      </LanguageProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
