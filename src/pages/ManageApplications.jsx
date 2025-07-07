import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Users, Filter, MessageSquare, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageApplications = () => {
  const { jobs, applications, updateApplicationStatus, loading } = useJobs();
  const { user } = useAuth();
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); 
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [currentStatusForNotification, setCurrentStatusForNotification] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  // Filtra los trabajos relevantes según el rol del usuario (HR ve todo, Manager ve solo los suyos)
  const relevantJobs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'hr') return jobs;
    if (user.role === 'manager') {
      return jobs.filter(job => job.createdBy?.email === user.email);
    }
    return [];
  }, [jobs, user]);

  // Filtra las postulaciones que corresponden a los trabajos relevantes
  const relevantApplications = useMemo(() => {
    const relevantJobIds = new Set(relevantJobs.map(job => job.id));
    return applications.filter(app => app.job && relevantJobIds.has(app.job.id));
  }, [applications, relevantJobs]);

  // Aplica los filtros de trabajo y estado
  const filteredApplications = useMemo(() => {
    return relevantApplications.filter(app => {
      const jobMatch = !selectedJobFilter || (app.job && app.job.id === parseInt(selectedJobFilter));
      
      let statusMatch = true;
      if (statusFilter === 'active') {
        statusMatch = app.status !== 'rejected';
      } else if (statusFilter) {
        statusMatch = app.status === statusFilter;
      }

      return jobMatch && statusMatch;
    });
  }, [relevantApplications, selectedJobFilter, statusFilter]);

  // Función para ver el CV de forma segura
  const handleViewCv = async (fileName) => {
    try {
        const response = await fetch(`https://sodimac-api-e5hchdb6bjbyahd4.centralus-01.azurewebsites.net/api/files/cvs/${fileName}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('No se pudo descargar el archivo.');
        const blob = await response.blob();
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
    } catch (error) {
        toast({ title: 'Error al abrir CV', description: error.message || 'No se pudo obtener el archivo.', variant: 'destructive' });
    }
  };
  
  const applicationStatusOptions = [
    { value: 'submitted', label: 'Enviada' },
    { value: 'reviewing', label: 'En Revisión' },
    { value: 'interview', label: 'Entrevista' },
    { value: 'accepted', label: 'Aceptada' },
    { value: 'rejected', label: 'Rechazada' },
  ];

  const getStatusText = (status) => {
    return applicationStatusOptions.find(opt => opt.value === status)?.label || 'Desconocido';
  };
  
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
  
  const handleStatusChange = (app, newStatus) => {
    setSelectedApplication(app);
    setCurrentStatusForNotification(newStatus);
    let defaultMessage = `Hola ${app.candidate.username},\n\nEl estado de tu postulación para el puesto de "${app.job.title}" ha sido actualizado a: ${getStatusText(newStatus)}.`;
    if (newStatus === 'interview') defaultMessage += `\n\nNos pondremos en contacto contigo pronto para coordinar los detalles.`;
    if (newStatus === 'accepted') defaultMessage += `\n\n¡Felicidades! Has sido seleccionado. Te contactaremos con los siguientes pasos.`;
    if (newStatus === 'rejected') defaultMessage += `\n\nAgradecemos tu interés. En esta ocasión, hemos decidido continuar con otros candidatos.`;
    defaultMessage += `\n\nSaludos cordiales,\nEl equipo de Reclutamiento de SODIMAC`;
    setNotificationMessage(defaultMessage);
    setShowNotificationModal(true);
  };

  const handleSendNotification = async () => {
    if (!selectedApplication || !currentStatusForNotification) return;
    setIsNotifying(true);
    try {
      await updateApplicationStatus(selectedApplication.id, currentStatusForNotification, notificationMessage);
      toast({ title: '¡Éxito!', description: `La postulación ha sido actualizada.` });
      setShowNotificationModal(false);
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'No se pudo actualizar la postulación.', variant: 'destructive' });
    } finally {
      setIsNotifying(false);
      setSelectedApplication(null);
      setNotificationMessage('');
      setCurrentStatusForNotification('');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) { return <div className="flex justify-center p-8"><Loader2 className="w-12 h-12 animate-spin" /></div>; }

  if (user?.role !== 'hr' && user?.role !== 'manager') { 
      return (
          <div className="text-center py-12">
            <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <CardTitle className="text-destructive text-2xl mb-2">Acceso Denegado</CardTitle>
                <CardDescription className="text-muted-foreground">Esta página es solo para Gerentes y personal de RRHH.</CardDescription>
            </Card>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-md"><Users className="w-8 h-8 text-primary-foreground" /></div>
        <h1 className="text-4xl font-bold text-foreground">Gestionar Postulaciones</h1>
        <p className="text-xl text-muted-foreground">Revisa y gestiona las postulaciones de los candidatos.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-card rounded-lg p-6 border border-border shadow-md">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-primary" />
              <Label htmlFor="jobFilter" className="text-foreground font-medium whitespace-nowrap">Filtrar por Trabajo:</Label>
              <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                <SelectTrigger className="w-full bg-input border-border text-foreground"><SelectValue placeholder="Todos los trabajos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los trabajos</SelectItem>
                  {relevantJobs.map(job => (<SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-primary" />
              <Label htmlFor="statusFilter" className="text-foreground font-medium whitespace-nowrap">Filtrar por Estado:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-input border-border text-foreground"><SelectValue placeholder="Ver postulaciones..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activas (No rechazadas)</SelectItem>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="submitted">Solo Enviadas</SelectItem>
                  <SelectItem value="reviewing">Solo En Revisión</SelectItem>
                  <SelectItem value="interview">Solo en Entrevista</SelectItem>
                  <SelectItem value="accepted">Solo Aceptadas</SelectItem>
                  <SelectItem value="rejected">Solo Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
      </motion.div>

      {filteredApplications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-center py-12">
          <Card className="bg-card border-border p-8 shadow-lg max-w-md mx-auto">
            <Users className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-foreground text-2xl mb-2">No hay postulaciones</CardTitle>
            <CardDescription className="text-muted-foreground">{selectedJobFilter || statusFilter ? "Ninguna postulación coincide con los filtros." : "Aún no hay postulaciones."}</CardDescription>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid md:grid-cols-2 gap-6">
          {filteredApplications.map((application, index) => (
            <motion.div key={application.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
              <Card className="bg-card border-border hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground text-xl">{application.candidate?.username}</CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">Postuló a: {application.job?.title}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColorClasses(application.status)} border font-semibold`}>{getStatusText(application.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">Email:</span> {application.candidate?.email}</p>
                    <p><span className="font-medium text-foreground">Postulado el:</span> {formatDate(application.appliedAt)}</p>
                    
                    {application.cvFileName && 
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => handleViewCv(application.cvFileName)}
                      >
                        <FileText className="inline w-4 h-4 mr-1" />
                        <span className="font-medium">Ver Curriculum Vitae</span>
                      </Button>
                    }
                  </div>    
                  {application.coverLetter && <div className="space-y-1"><span className="text-foreground text-sm font-medium">Carta de Presentación:</span><p className="text-muted-foreground text-sm bg-input rounded-lg p-3 leading-relaxed max-h-24 overflow-y-auto">{application.coverLetter}</p></div>}
                  {application.experience && <div className="space-y-1"><span className="text-foreground text-sm font-medium">Experiencia:</span><p className="text-muted-foreground text-sm bg-input rounded-lg p-3 leading-relaxed max-h-24 overflow-y-auto">{application.experience}</p></div>}
                  {application.skills && <div className="space-y-1"><span className="text-foreground text-sm font-medium">Habilidades:</span><p className="text-muted-foreground text-sm bg-input rounded-lg p-3">{application.skills}</p></div>}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label htmlFor={`status-${application.id}`} className="text-foreground text-sm font-medium">Cambiar Estado y Notificar:</Label>
                    <Select value={application.status} onValueChange={(newStatus) => handleStatusChange(application, newStatus)}>
                      <SelectTrigger id={`status-${application.id}`} className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent>{applicationStatusOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      {showNotificationModal && selectedApplication && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowNotificationModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-primary" />Notificar a {selectedApplication.candidate?.username}</CardTitle>
                <CardDescription className="text-muted-foreground">Revisa y envía la notificación. El estado se actualizará a "{getStatusText(currentStatusForNotification)}".</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notificationMessage" className="text-foreground">Mensaje:</Label>
                  <Textarea id="notificationMessage" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} rows={8} className="bg-input border-border text-foreground placeholder:text-muted-foreground mt-1" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNotificationModal(false)} className="border-border text-foreground hover:bg-accent/10">Cancelar</Button>
                  <Button onClick={handleSendNotification} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isNotifying}>
                    {isNotifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Actualizar y Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageApplications;
