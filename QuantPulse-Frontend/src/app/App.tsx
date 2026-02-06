import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { HomePage } from '@/app/pages/HomePage';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { StatisticsPage } from '@/app/pages/StatisticsPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { SignInPage } from '@/app/pages/SignInPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { RiskMapPage } from '@/app/pages/RiskMapPage';
import { FintechBackground } from '@/app/components/FintechBackground';
import { AuthProvider } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen text-zinc-100 font-sans antialiased selection:bg-blue-500/30">
        <FintechBackground />
        <div className="relative z-10">
          <BrowserRouter>
            <Routes>
              {/* Routes with Layout (includes navigation) */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="risk-map" element={
                  <ProtectedRoute>
                    <RiskMapPage />
                  </ProtectedRoute>
                } />
                <Route path="statistics" element={
                  <ProtectedRoute>
                    <StatisticsPage />
                  </ProtectedRoute>
                } />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Auth routes without main layout */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </AuthProvider>
  );
}
