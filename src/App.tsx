import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PageLoader from './components/PageLoader';

// Lazy load pages for better performance
const CustomerUpload = lazy(() => import('./pages/CustomerUpload'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminQueue = lazy(() => import('./pages/AdminQueue'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

const CustomerAuth = lazy(() => import('./pages/CustomerAuth'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerUpload />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<CustomerAuth />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/queue" replace />} />
            <Route path="queue" element={<AdminQueue />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
