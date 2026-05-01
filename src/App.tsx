import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Certificates from './pages/Certificates';
import Community from './pages/Community';
import Help from './pages/Help';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminNewCourse from './pages/AdminNewCourse';
import AdminEditCourse from './pages/AdminEditCourse';
import AdminCategories from './pages/AdminCategories';
import AdminNewAgent from './pages/AdminNewAgent';
import AdminCourses from './pages/AdminCourses';
import AdminStudents from './pages/AdminStudents';
import AdminAdministrators from './pages/AdminAdministrators';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import { PWAInstallBanner, OnlineStatusIndicator } from './components/PWAInstallBanner';

function PrivateRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function LoginRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname;
    if (from) return <Navigate to={from} replace />;
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Login />;
}

function AgentPage({ children }: { children: React.ReactNode }) {
  return <PrivateRoute><DashboardGuard>{children}</DashboardGuard></PrivateRoute>;
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return <PrivateRoute adminOnly>{children}</PrivateRoute>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <OnlineStatusIndicator />
      <PWAInstallBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRedirect />} />

        {/* Agent Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<AgentPage><Dashboard /></AgentPage>} />
          <Route path="/dashboard/cursos" element={<AgentPage><MyCourses /></AgentPage>} />
          <Route path="/dashboard/certificados" element={<AgentPage><Certificates /></AgentPage>} />
          <Route path="/dashboard/comunidade" element={<AgentPage><Community /></AgentPage>} />
          <Route path="/dashboard/ajuda" element={<AgentPage><Help /></AgentPage>} />
          <Route path="/dashboard/curso/:id" element={<AgentPage><CourseDetail /></AgentPage>} />
          <Route path="/dashboard/perfil" element={<AgentPage><Profile /></AgentPage>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<Layout isAdmin />}>
          <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
          <Route path="/admin/cursos" element={<AdminPage><AdminCourses /></AdminPage>} />
          <Route path="/admin/cursos/novo" element={<AdminPage><AdminNewCourse /></AdminPage>} />
          <Route path="/admin/cursos/:id/editar" element={<AdminPage><AdminEditCourse /></AdminPage>} />
          <Route path="/admin/categorias" element={<AdminPage><AdminCategories /></AdminPage>} />
          <Route path="/admin/alunos" element={<AdminPage><AdminStudents /></AdminPage>} />
          <Route path="/admin/alunos/novo" element={<AdminPage><AdminNewAgent /></AdminPage>} />
          <Route path="/admin/administradores" element={<AdminPage><AdminAdministrators /></AdminPage>} />
          <Route path="/admin/analytics" element={<AdminPage><AdminAnalytics /></AdminPage>} />
          <Route path="/admin/relatorios" element={<AdminPage><AdminReports /></AdminPage>} />
          <Route path="/admin/config" element={<AdminPage><AdminSettings /></AdminPage>} />
          <Route path="/admin/perfil" element={<AdminPage><Profile /></AdminPage>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
