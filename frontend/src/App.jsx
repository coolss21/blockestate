// App.jsx - Main application with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import CitizenDashboard from './pages/citizen/Dashboard';
import MyProperties from './pages/citizen/MyProperties';
import Apply from './pages/citizen/Apply';
import Applications from './pages/citizen/Applications';
import Disputes from './pages/citizen/Disputes';
import RegistrarDashboard from './pages/registrar/Dashboard';
import Inbox from './pages/registrar/Inbox';
import Search from './pages/registrar/Search';
import Certificate from './pages/registrar/Certificate';
import ApplicationDetails from './pages/registrar/ApplicationDetails';
import AllProperties from './pages/registrar/AllProperties';
import CourtDashboard from './pages/court/Dashboard';
import Cases from './pages/court/Cases';
import RegisterCase from './pages/court/RegisterCase';
import Hearings from './pages/court/Hearings';
import CaseDetails from './pages/court/CaseDetails';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import SystemConfig from './pages/admin/SystemConfig';
import AuditLogs from './pages/admin/AuditLogs';
import VerifyQR from './pages/VerifyQR';
import PublicCertificate from './pages/public/PublicCertificate';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-qr" element={<VerifyQR />} />
          <Route path="/certificate/:propertyId" element={<PublicCertificate />} />

          {/* Citizen routes */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/properties"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/apply"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/applications"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/disputes"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Disputes />
              </ProtectedRoute>
            }
          />

          {/* Registrar routes */}
          <Route
            path="/registrar/dashboard"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'admin']}>
                <RegistrarDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/inbox"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'admin']}>
                <Inbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/search"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'court', 'admin']}>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/certificate"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'admin']}>
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/properties"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'admin']}>
                <AllProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'admin']}>
                <ApplicationDetails />
              </ProtectedRoute>
            }
          />

          {/* Court routes */}
          <Route
            path="/court/dashboard"
            element={
              <ProtectedRoute allowedRoles={['court', 'admin']}>
                <CourtDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/court/cases"
            element={
              <ProtectedRoute allowedRoles={['court', 'admin']}>
                <Cases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/court/register-case"
            element={
              <ProtectedRoute allowedRoles={['court', 'admin']}>
                <RegisterCase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/court/cases/:id"
            element={
              <ProtectedRoute allowedRoles={['court', 'admin']}>
                <CaseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/court/hearings"
            element={
              <ProtectedRoute allowedRoles={['court', 'admin']}>
                <Hearings />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
