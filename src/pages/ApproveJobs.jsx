import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Building, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ApproveJobs = () => {
  const { jobs, updateJobStatus, loading } = useJobs(); 
  const { user } = useAuth();

  const pendingJobs = jobs.filter(job => job.status === 'pending');

  const handleApprove = async (jobId) => {
    try {
      await updateJobStatus(jobId, 'approved');
      toast({
        title: '¡Trabajo Aprobado!',
        description: 'El trabajo ha sido aprobado y ahora está visible para los candidatos.',
        className: 'bg-green-100 border-green-300 text-green-700',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el trabajo.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (jobId) => {
    try {
      await updateJobStatus(jobId, 'rejected');
      toast({
        title: 'Trabajo Rechazado',
        description: 'La solicitud de trabajo ha sido rechazada.',
        variant: 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el trabajo.',
        variant: 'destructive',
      });
    }
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

  if (user?.role !== 'hr') {
    return (
      <div className="text-center py-12">
        <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive text-2xl mb-2">Acceso Denegado</CardTitle>
            <CardDescription className="text-muted-foreground">
              Solo el personal de RRHH de SODIMAC puede acceder a esta página.
            </CardDescription>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Cargando solicitudes...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Aprobar Solicitudes de Trabajo</h1>
        <p className="text-xl text-muted-foreground">Revisa y aprueba las nuevas vacantes solicitadas.</p>
      </motion.div>

      {pendingJobs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-center py-12">
          <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-foreground text-2xl mb-2">Todo al día</CardTitle>
            <CardDescription className="text-muted-foreground">
              No hay trabajos pendientes de aprobación en este momento.
            </CardDescription>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid gap-6">
          {pendingJobs.map((job, index) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
              <Card className="bg-card border-border hover:shadow-xl transition-all duration-300 card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        Solicitado por: {job.createdBy?.username || 'N/A'} ({job.createdBy?.email || 'N/A'})
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendiente de Aprobación
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-primary" /><span>{job.department}</span></div>
                    <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary" /><span>{job.location}</span></div>
                    <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-primary" /><span>{job.type}</span></div>
                    <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4 text-primary" /><span>{job.salary || 'No especificado'}</span></div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-foreground text-sm font-medium">Descripción del Puesto:</span>
                      <p className="text-muted-foreground text-sm mt-1 leading-relaxed bg-input rounded-lg p-3 border border-border">{job.description}</p>
                    </div>
                    {job.requirements && (
                      <div>
                        <span className="text-foreground text-sm font-medium">Requisitos:</span>
                        <p className="text-muted-foreground text-sm mt-1 bg-input rounded-lg p-3 border border-border">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                   <div className="flex gap-4 pt-4 border-t border-border">
                     <Button onClick={() => handleApprove(job.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                       <CheckCircle className="w-4 h-4 mr-2" />Aprobar Trabajo
                     </Button>
                     <Button onClick={() => handleReject(job.id)} variant="destructive" className="flex-1">
                       <XCircle className="w-4 h-4 mr-2" />Rechazar Solicitud
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ApproveJobs;