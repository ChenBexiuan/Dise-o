import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, Building, Clock, MessageSquare, ChevronRight, Briefcase, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Applications = () => {
  const { applications, loading } = useJobs();
  const { user } = useAuth();

  const userApplications = applications.filter(app => app.candidate?.id === user?.id);

  const getStatusColorClasses = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'reviewing': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'interview': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'accepted': return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    const map = { submitted: 'Enviada', reviewing: 'En Revisión', interview: 'Entrevista', accepted: '¡Aceptado!', rejected: 'Rechazada' };
    return map[status] || 'Desconocido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timelineStatusMap = {
    submitted: { text: 'Enviada', color: 'text-blue-500' },
    reviewing: { text: 'En Revisión', color: 'text-yellow-500' },
    interview: { text: 'Entrevista', color: 'text-purple-500' },
  };

  const applicationTimeline = ['submitted', 'reviewing', 'interview'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando tus postulaciones...</p>
      </div>
    );
  }

  if (user && user.role !== 'candidate') {
    return (
      <div className="text-center py-12">
        <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-destructive text-2xl mb-2">Acceso Denegado</CardTitle>
          <CardDescription className="text-muted-foreground">
            Esta sección es exclusiva para candidatos.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-md">
          <FileText className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Mis Postulaciones</h1>
        <p className="text-xl text-muted-foreground">Sigue el progreso de tus procesos de selección en SODIMAC.</p>
      </motion.div>

      {userApplications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-center py-12">
          <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
            <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-foreground text-2xl mb-2">Aún no has postulado</CardTitle>
            <CardDescription className="text-muted-foreground">Explora nuestras oportunidades y comienza tu búsqueda.</CardDescription>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid gap-6">
          <AnimatePresence>
            {userApplications.map((application, index) => {
              const job = application.job;
              if (!application?.id || !job) return null;

              let currentStatusIndex = applicationTimeline.indexOf(application.status);
              if (application.status === 'accepted' || application.status === 'rejected') {
                currentStatusIndex = applicationTimeline.length;
              }

              return (
                <motion.div
                  key={application.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-foreground text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-muted-foreground mt-1">{job.department || 'Departamento no especificado'}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColorClasses(application.status)} border font-semibold`}>{getStatusText(application.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary" /><span>{job.location}</span></div>
                        <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-primary" /><span>{job.department}</span></div>
                        <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-primary" /><span>Postulado: {formatDate(application.appliedAt)}</span></div>
                        <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-primary" /><span>{job.type}</span></div>
                      </div>

                      {application.messages && application.messages.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-border">
                          <h4 className="text-foreground font-medium flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-primary" />Mensajes del Reclutador</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {application.messages.map((msg) => (
                              <div key={msg.id} className="bg-input p-3 rounded-lg shadow-sm">
                                <p className="text-foreground text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className="text-xs text-muted-foreground mt-1 text-right">{formatDate(msg.createdAt)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-foreground text-sm font-medium mb-3">Progreso de Postulación:</h4>
                        <div className="flex items-center space-x-1">
                          {applicationTimeline.map((statusKey, idx) => {
                            const statusInfo = timelineStatusMap[statusKey];
                            const isActive = idx <= currentStatusIndex;
                            return (
                              <React.Fragment key={statusKey}>
                                <div className={`flex items-center space-x-1 ${isActive ? statusInfo.color : 'text-gray-400'}`}>
                                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-current' : 'bg-gray-300'}`}></div>
                                  <span className="text-xs font-medium">{statusInfo.text}</span>
                                </div>
                                {idx < applicationTimeline.length - 1 && (
                                  <ChevronRight className={`w-4 h-4 ${isActive && currentStatusIndex > idx ? statusInfo.color : 'text-gray-300'}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                          {(application.status === 'accepted' || application.status === 'rejected') && (
                            <React.Fragment>
                              <ChevronRight className={`w-4 h-4 ${getStatusColorClasses(application.status).includes('green') ? 'text-green-500' : 'text-red-500'}`} />
                              <div className={`flex items-center space-x-1 ${getStatusColorClasses(application.status).includes('green') ? 'text-green-500' : 'text-red-500'}`}>
                                <div className="w-3 h-3 rounded-full bg-current"></div>
                                <span className="text-xs font-medium">{getStatusText(application.status)}</span>
                              </div>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Applications;
