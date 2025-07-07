import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import JobCard from '@/components/JobCard';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Search, Filter, X, Loader2, LayoutDashboard } from 'lucide-react'; // Icono añadido
import { motion } from 'framer-motion';

const Jobs = () => {
  const { jobs, applications, applyToJob, loading } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para los filtros y el modal
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    cvFile: null,
    experience: '',
    skills: ''
  });

  // Filtra solo los trabajos aprobados para mostrar al público
  const approvedJobs = jobs.filter(job => job.status === 'approved');
  
  // Lógica de filtrado para la búsqueda
  const filteredJobs = approvedJobs.filter(job => {
    const titleMatch = job.title ? job.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descriptionMatch = job.description ? job.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = titleMatch || descriptionMatch;
    const matchesDepartment = !departmentFilter || job.department === departmentFilter;
    const matchesLocation = !locationFilter || job.location === locationFilter;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const departments = [...new Set(approvedJobs.map(job => job.department))].sort();
  const locations = [...new Set(approvedJobs.map(job => job.location))].sort();

  const handleApply = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      toast({
        title: 'Acceso denegado',
        description: 'Solo los candidatos pueden postular a trabajos',
        variant: 'destructive'
      });
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!user) {
        toast({ title: 'Error', description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', variant: 'destructive' });
        navigate('/login');
        return;
    }

    if (!applicationData.coverLetter.trim()) {
      toast({ title: 'Error', description: 'La carta de presentación es requerida', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const textData = {
        coverLetter: applicationData.coverLetter,
        experience: applicationData.experience,
        skills: applicationData.skills,
      };
      const cvFile = applicationData.cvFile;
      
      await applyToJob(selectedJob.id, textData, cvFile);
      
      toast({
        title: '¡Postulación enviada!',
        description: `Tu postulación para ${selectedJob.title} ha sido enviada exitosamente`,
      });

      setShowApplicationModal(false);
      setApplicationData({ coverLetter: '', cvFile: null, experience: '', skills: '' });
      setSelectedJob(null);

    } catch (error) {
      toast({
        title: 'Error al postular',
        description: error.message || 'No se pudo enviar tu postulación. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApplied = (jobId) => {
    return applications.some(app => app.job?.id === jobId && app.candidate?.id === user?.id);
  };
  
  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Cargando ofertas de trabajo...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Oportunidades de Trabajo en SODIMAC Perú</h1>
        <p className="text-xl text-muted-foreground">Descubre tu próxima oportunidad profesional en el mejoramiento del hogar.</p>
      </motion.div>

      {/* --- BOTÓN DE ACCESO AL DASHBOARD PARA HR --- */}
      {user?.role === 'hr' && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className="bg-card border-border p-4 flex items-center justify-between shadow-md">
                <div>
                    <h3 className="font-semibold text-foreground">Panel de Administrador</h3>
                    <p className="text-sm text-muted-foreground">Accede a las analíticas y gestión del reclutamiento.</p>
                </div>
                <Button onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ir al Dashboard
                </Button>
            </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }} // Ajustamos el delay
        className="bg-card rounded-lg p-6 border border-border shadow-md"
      >
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div className="relative md:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-muted-foreground">Buscar</Label>
            <Search className="absolute left-3 bottom-3 w-4 h-4 text-muted-foreground" />
            <Input id="search" placeholder="Palabra clave, título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <Label htmlFor="department" className="text-sm font-medium text-muted-foreground">Departamento</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="department" className="bg-input border-border text-foreground"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los departamentos</SelectItem>
                {departments.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-muted-foreground">Ubicación</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger id="location" className="bg-input border-border text-foreground"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las ubicaciones</SelectItem>
                {locations.map(location => (<SelectItem key={location} value={location}>{location}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || departmentFilter || locationFilter) && (
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setDepartmentFilter(''); setLocationFilter(''); }} className="text-accent hover:text-accent/80 md:col-start-4">
              <X className="w-4 h-4 mr-2" />Limpiar Filtros
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }} // Ajustamos el delay
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredJobs.map((job, index) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
            <JobCard job={job} onApply={handleApply} applied={isApplied(job.id)} showApplyButton={user?.role === 'candidate'} />
          </motion.div>
        ))}
      </motion.div>

       {filteredJobs.length === 0 && !loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
               <div className="text-muted-foreground text-lg">No se encontraron trabajos que coincidan con tus criterios. Intenta ajustar los filtros.</div>
           </motion.div>
       )}

      {showApplicationModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowApplicationModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
            <Card className="bg-card border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Postular a: {selectedJob?.title}</CardTitle>
                <CardDescription className="text-muted-foreground">Completa tu postulación para este puesto en SODIMAC Perú</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter" className="text-foreground">Carta de Presentación *</Label>
                    <Textarea id="coverLetter" value={applicationData.coverLetter} onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })} className="bg-input border-border text-foreground" placeholder="Explica por qué eres el candidato ideal para este puesto..." rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-foreground">Experiencia Relevante</Label>
                    <Textarea id="experience" value={applicationData.experience} onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })} className="bg-input border-border text-foreground" placeholder="Describe tu experiencia relevante para este puesto..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-foreground">Habilidades Clave</Label>
                    <Input id="skills" value={applicationData.skills} onChange={(e) => setApplicationData({ ...applicationData, skills: e.target.value })} className="bg-input border-border text-foreground" placeholder="Ej: Liderazgo, Ventas, Conocimiento de productos..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cv" className="text-foreground">Curriculum Vitae (PDF, DOC, DOCX)</Label>
                    <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setApplicationData({ ...applicationData, cvFile: e.target.files[0] })} className="bg-input border-border text-foreground file:text-primary-foreground file:bg-primary file:hover:bg-primary/90 file:border-0 file:rounded file:px-3 file:py-1.5 file:text-sm" />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowApplicationModal(false)} className="border-border text-foreground hover:bg-accent/10">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Jobs;