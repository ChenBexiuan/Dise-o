import React, { useMemo } from 'react';
import { useJobs } from '@/hooks/useJobs'; // Hook personalizado para obtener trabajos y postulaciones
import { useAuth } from '@/hooks/useAuth'; // Hook personalizado para obtener el usuario autenticado
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Componentes de tarjeta reutilizables
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'; // Componentes de gráficos
import {
  Briefcase, Users, TrendingUp, AlertTriangle
} from 'lucide-react'; // Íconos
import { motion } from 'framer-motion'; // Animaciones para transiciones visuales

const Dashboard = () => {
  const { jobs, applications, loading } = useJobs(); // Obtiene trabajos y postulaciones del backend
  const { user } = useAuth(); // Obtiene los datos del usuario autenticado

  // Cálculos de métricas y datos para los gráficos (solo se recalculan si cambian jobs, applications o loading)
  const analyticsData = useMemo(() => {
    if (loading || jobs.length === 0) {
      return { stats: {}, barChartData: [], pieChartData: [] };
    }

    // --- MÉTRICAS GENERALES ---
    const activeJobs = jobs.filter(job => job.status === 'approved'); // Filtra trabajos activos
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const acceptanceRate = totalApplications > 0
      ? ((acceptedApplications / totalApplications) * 100).toFixed(1)
      : 0;

    const stats = {
      activeJobsCount: activeJobs.length,
      totalApplications,
      acceptanceRate,
    };

    // --- GRÁFICO DE BARRAS: Postulaciones por oferta ---
    const applicationsPerJob = jobs.reduce((acc, job) => {
      acc[job.title] = applications.filter(app => app.job?.id === job.id).length;
      return acc;
    }, {});

    const barChartData = Object.entries(applicationsPerJob)
      .map(([name, postulaciones]) => ({ name, postulaciones }))
      .filter(item => item.postulaciones > 0) // Solo mostrar trabajos con postulaciones
      .sort((a, b) => b.postulaciones - a.postulaciones); // Orden descendente

    // --- GRÁFICO DE PASTEL: Distribución por estado de postulación ---
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const statusMap = {
      submitted: 'Enviada',
      reviewing: 'En Revisión',
      interview: 'Entrevista',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
    };

    const pieChartData = Object.entries(statusCounts).map(([status, value]) => ({
      name: statusMap[status] || status,
      value,
    }));

    return { stats, barChartData, pieChartData };
  }, [jobs, applications, loading]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff7373']; // Colores para el gráfico de pastel

  // --- VALIDACIÓN DE ROL ---
  if (user?.role !== 'hr') {
    return (
      <div className="text-center py-12">
        <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-destructive text-2xl mb-2">Acceso Denegado</CardTitle>
          <p className="text-muted-foreground">Esta página es solo para personal de RRHH.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Dashboard de Reclutamiento</h1>
        <p className="text-muted-foreground">Una vista general del estado de las contrataciones en SODIMAC.</p>
      </motion.div>

      {/* TARJETAS DE MÉTRICAS */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Ofertas Activas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.stats.activeJobsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Trabajos visibles para candidatos</p>
          </CardContent>
        </Card>

        {/* Total de Postulaciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Postulaciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.stats.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Recibidas en todas las ofertas</p>
          </CardContent>
        </Card>

        {/* Tasa de Aceptación */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aceptación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.stats.acceptanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">De postulaciones finalizadas</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* GRÁFICOS */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Gráfico de Barras: Postulaciones por Trabajo */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Postulaciones por Oferta</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analyticsData.barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="postulaciones" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pastel: Estados de las Postulaciones */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analyticsData.pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {analyticsData.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
