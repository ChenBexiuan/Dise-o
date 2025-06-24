// Importaciones de React y librerías necesarias
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa el contexto de autenticación y el hook para usarlo
import { AuthProvider, useAuth } from '@/hooks/useAuth';

// Importa el contexto de trabajos (ofertas y postulaciones)
import { JobsProvider } from '@/hooks/useJobs';

// Componente para mostrar notificaciones tipo toast
import { Toaster } from '@/components/ui/toaster';

// Layout general que envuelve a todas las páginas
import Layout from '@/components/Layout';

// Importación de páginas principales del sistema
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Jobs from '@/pages/Jobs';
import Applications from '@/pages/Applications';
import CreateJob from '@/pages/CreateJob';
import ApproveJobs from '@/pages/ApproveJobs';
import ManageApplications from '@/pages/ManageApplications';
import Dashboard from '@/pages/Dashboard';

/**
 * Componente ProtectedRoute:
 * Envuelve rutas que requieren autenticación y/o permisos específicos (roles).
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Mientras se verifica si el usuario está autenticado, muestra un mensaje de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-lg">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene un rol permitido para esta ruta, redirige a /jobs
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/jobs" replace />;
  }

  // Si pasa todas las validaciones, muestra los componentes hijos (la ruta)
  return children;
};

/**
 * Componente AppRoutes:
 * Define todas las rutas de la aplicación.
 * Utiliza el contexto de autenticación para redirigir si es necesario.
 */
const AppRoutes = () => {
  const { user } = useAuth(); // Obtiene el usuario desde el contexto

  return (
    <Layout> {/* El layout general que incluye barra de navegación, etc. */}
      <Routes>
        {/* Ruta pública principal */}
        <Route path="/" element={<Home />} />

        {/* Rutas de login y registro: redirigen a /jobs si el usuario ya inició sesión */}
        <Route
          path="/login"
          element={user ? <Navigate to="/jobs" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/jobs" replace /> : <Register />}
        />

        {/* Página principal de empleos, visible para todos */}
        <Route path="/jobs" element={<Jobs />} />

        {/* Rutas protegidas por rol */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-job"
          element={
            <ProtectedRoute allowedRoles={['manager', 'hr']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approve-jobs"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <ApproveJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-applications"
          element={
            <ProtectedRoute allowedRoles={['manager', 'hr']}>
              <ManageApplications />
            </ProtectedRoute>
          }
        />

        {/* Ruta comodín: redirige a la página de inicio si la URL no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

/**
 * Componente App principal:
 * Aquí se integran todos los proveedores de contexto, el router y el sistema de rutas.
 */
const App = () => {
  return (
    <AuthProvider> {/* Proveedor de autenticación (maneja login, token, usuario) */}
      <JobsProvider> {/* Proveedor del contexto de empleos y postulaciones */}
        <Router> {/* Router para navegación con React Router */}
          <AppRoutes /> {/* Componente con todas las rutas de la aplicación */}
          <Toaster /> {/* Sistema de notificaciones visuales */}
        </Router>
      </JobsProvider>
    </AuthProvider>
  );
};

export default App;
