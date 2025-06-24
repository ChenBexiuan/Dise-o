// Importaciones necesarias
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast'; // Para mostrar notificaciones
import fetchApi from '@/services/api'; // Función personalizada para hacer peticiones fetch
import { useAuth } from './useAuth'; // Hook para acceder al usuario autenticado

// Creamos el contexto
const JobsContext = createContext();

// Hook personalizado para consumir el contexto de trabajos
export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs debe ser usado dentro de un JobsProvider'); // Validación de uso correcto
  }
  return context;
};

// Componente proveedor del contexto
export const JobsProvider = ({ children }) => {
  // Estados locales
  const [jobs, setJobs] = useState([]); // Lista de trabajos
  const [applications, setApplications] = useState([]); // Lista de postulaciones
  const [loading, setLoading] = useState(false); // Estado de carga

  const { user } = useAuth(); // Obtenemos el usuario actual desde el contexto de autenticación

  // Función para obtener datos del backend
  const fetchData = useCallback(async () => {
    // Si no hay usuario, solo se cargan los trabajos públicos
    if (!user || !user.id) {
      setLoading(true);
      try {
        const jobsData = await fetchApi('/jobs'); // Petición a trabajos públicos
        setJobs(jobsData || []);
      } catch (error) {
        console.error("Error al cargar trabajos públicos:", error);
        toast({
          title: 'Error de red',
          description: 'No se pudieron cargar las ofertas de trabajo.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false); // Finaliza la carga
      }
      return;
    }

    // Si hay usuario, se cargan trabajos y postulaciones según el rol
    setLoading(true);
    try {
      const jobsData = await fetchApi('/jobs'); // Carga trabajos
      setJobs(jobsData || []);

      // Candidato: obtener solo sus postulaciones
      if (user.role === 'candidate') {
        const applicationsData = await fetchApi(`/applications/candidate/${user.id}`);
        setApplications(applicationsData || []);
      } 
      // RRHH o manager: obtener todas las postulaciones
      else if (user.role === 'manager' || user.role === 'hr') {
        const applicationsData = await fetchApi('/applications');
        setApplications(applicationsData || []);
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  }, [user]); // Dependencias: se actualiza cuando cambia el usuario

  // Efecto: se ejecuta cada vez que el usuario cambia
  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  // Función para postularse a un trabajo
  const applyToJob = async (jobId, textData, cvFile) => {
    const formData = new FormData();

    // Agregamos los datos de texto como un blob JSON
    formData.append('application', new Blob([JSON.stringify(textData)], { type: "application/json" }));

    // Si hay un archivo CV, lo agregamos también
    if (cvFile) {
      formData.append('cvFile', cvFile);
    }

    // Enviamos los datos al backend
    const newApplication = await fetchApi(`/applications/${jobId}`, {
      method: 'POST',
      body: formData, // Enviamos el FormData
    });

    // Recargamos los datos para actualizar la UI
    await fetchData();
    return newApplication;
  };

  // Función para crear una nueva oferta de trabajo
  const createJob = async (jobData) => {
    const newJob = await fetchApi('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData), // Enviamos los datos como JSON
    });
    setJobs(prevJobs => [...prevJobs, newJob]); // Actualizamos la lista de trabajos
    return newJob;
  };

  // Función para cambiar el estado de una oferta (por ejemplo: abierta/cerrada)
  const updateJobStatus = async (jobId, status) => {
    const originalJob = jobs.find(job => job.id === jobId); // Buscamos el trabajo actual
    const updatedJob = await fetchApi(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...originalJob, status }) // Actualizamos el estado
    });
    await fetchData(); // Recargamos los datos
  };

  // Función para cambiar el estado de una postulación (por ejemplo: aceptada/rechazada)
  const updateApplicationStatus = async (applicationId, newStatus, message) => {
    const updatedApplication = await fetchApi(`/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        status: newStatus, 
        message: message 
      }),
    });

    await fetchData(); // Recargamos los datos
    return updatedApplication;
  };

  // Valores que se compartirán a través del contexto
  const value = {
    jobs,
    applications,
    loading,
    applyToJob,
    createJob,
    updateJobStatus,
    updateApplicationStatus,
  };

  // Retorno del proveedor con el contexto disponible para los hijos
  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
};
