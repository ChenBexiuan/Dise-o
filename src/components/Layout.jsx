import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Briefcase, FileText, Plus, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/images/Logo.jpg'; 

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { to: '/jobs', label: 'Trabajos', icon: Briefcase }
    ];

    if (user.role === 'candidate') {
      baseItems.push({ to: '/applications', label: 'Mis Postulaciones', icon: FileText });
    }

    if (user.role === 'manager') {
      baseItems.push(
        { to: '/create-job', label: 'Crear Trabajo', icon: Plus },
        { to: '/manage-applications', label: 'Gestionar Postulaciones', icon: Users }
      );
    }

    if (user.role === 'hr') {
      baseItems.push(
        { to: '/create-job', label: 'Crear Trabajo', icon: Plus },
        { to: '/approve-jobs', label: 'Aprobar Trabajos', icon: CheckCircle },
        { to: '/manage-applications', label: 'Gestionar Postulaciones', icon: Users }
      );
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md"
                >
                 <img src={logo} alt="Sodimac Logo" className="w-6 h-6" />
                </motion.div>
                <span className="text-xl font-bold text-primary">SODIMAC Reclutamiento</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {getNavItems().map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:block text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block text-sm">{user.name}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}

              {!user && (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="text-center py-6 border-t border-border mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SODIMAC. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Layout;