import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import fetchApi from '@/services/api';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);          // Estado del usuario autenticado
  const [token, setToken] = useState(null);        // Estado del token JWT
  const [loading, setLoading] = useState(true);    // Estado de carga inicial

  // Al montar el componente, cargar usuario y token desde localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error al cargar datos de autenticación:", error);
      localStorage.clear();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false); // Finaliza la carga inicial
    }
  }, []);

  // Sincronizar el logout entre múltiples pestañas (cuando se borra el token)
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'token' && event.newValue === null) {
        // Si se borra el token en otra pestaña, cerrar sesión en esta también
        console.log("Token eliminado en otra pestaña. Cerrando sesión...");
        setUser(null);
        setToken(null);
        toast({
          title: 'Sesión cerrada',
          description: 'Tu sesión ha sido cerrada desde otra pestaña o ventana.',
        });
      }
    };

    window.addEventListener('storage', syncLogout); // Escuchar cambios en localStorage

    return () => {
      window.removeEventListener('storage', syncLogout); // Limpiar el listener
    };
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    const authData = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { accessToken, userId, username, role } = authData;
    const userData = { id: userId, name: username, email, role };

    // Guardar en estado y localStorage
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);

    toast({
      title: 'Inicio de sesión exitoso',
      description: `¡Bienvenido de vuelta, ${username}!`
    });
  };

  // Función para registrar un nuevo usuario
  const register = async (registerData) => {
    const responseMessage = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
    toast({
      title: 'Registro exitoso',
      description: responseMessage || '¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.'
    });
  };

  // Función para cerrar sesión
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Esto dispara el syncLogout en otras pestañas
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado tu sesión exitosamente.',
    });
  }, []);

  // Valores que provee el contexto
  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token, // Booleano de autenticación
    loading,
    login,
    register,
    logout,
  };

  // Renderizar el proveedor con los valores
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
