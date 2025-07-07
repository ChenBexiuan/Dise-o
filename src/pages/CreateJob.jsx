import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs'; // Importamos el hook de Jobs
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Briefcase, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const { createJob } = useJobs(); // Obtenemos la función del hook
  const { user, token } = useAuth(); // Obtenemos también el token para validación
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDACIÓN REFORZADA ---
    // Ahora comprobamos tanto el usuario como el token antes de continuar.
    // Esto soluciona el problema de que la petición se envíe sin autenticación.
    if (!user || !token) {
      toast({
        title: 'Sesión no encontrada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo para continuar.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    if (!formData.title || !formData.department || !formData.description || !formData.type || !formData.location) {
      toast({
        title: 'Campos Incompletos',
        description: 'Por favor completa todos los campos marcados con *',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Determinamos el estado inicial según el rol del usuario.
      const initialStatus = user?.role === 'hr' ? 'approved' : 'pending';
      const jobDataToSend = { ...formData, status: initialStatus };

      // 2. Llamamos a la función 'createJob' del hook.
      await createJob(jobDataToSend);

      // 3. Mostramos la notificación de éxito y navegamos.
      toast({
        title: '¡Trabajo creado!',
        description: user?.role === 'hr'
          ? 'El trabajo ha sido creado y aprobado automáticamente.'
          : 'El trabajo ha sido enviado para aprobación de RRHH.',
      });
      
      navigate('/jobs');

    } catch (error) {
      toast({
        title: 'Error al crear trabajo',
        description: error.message || 'Ocurrió un error. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const departments = [
    'Ventas Retail (Tienda)', 'Cajas y Tesorería', 'Logística y Distribución', 'Atención al Cliente y Postventa', 
    'Administración y Contabilidad', 'Recursos Humanos y Bienestar', 'Marketing y Publicidad Digital', 
    'Tecnología y Sistemas (IT)', 'Mantenimiento e Infraestructura', 'Gerencia de Tienda y Operaciones',
    'Proyectos Especiales y Decoración', 'E-commerce y Ventas Online', 'Prevención de Pérdidas', 'Visual Merchandising'
  ];
  const jobTypes = [ 'Tiempo completo', 'Medio tiempo', 'Temporal (Proyecto)', 'Prácticas Profesionales', 'Fin de Semana y Feriados' ];
  const locations = [
    'Lima - San Miguel (Plaza San Miguel)', 'Lima - Jockey Plaza (Surco)', 'Lima - MegaPlaza (Independencia)', 
    'Lima - Miraflores (Oficinas Centrales)', 'Lima - Callao (Centro de Distribución)',
    'Arequipa - Mall Aventura Porongoche', 'Arequipa - Parque Lambramani',
    'Trujillo - Mallplaza Trujillo', 'Chiclayo - Real Plaza Chiclayo',
    'Piura - Open Plaza Piura', 'Cusco - Real Plaza Cusco', 'Ica - El Quinde Shopping Plaza',
    'Huancayo - Real Plaza Huancayo', 'Remoto (Perú)', 'Híbrido (Lima)'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
         <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-md"><PlusCircle className="w-8 h-8 text-primary-foreground" /></div>
         <h1 className="text-4xl font-bold text-foreground">Crear Nueva Oferta de Trabajo</h1>
         <p className="text-xl text-muted-foreground">Publica una nueva oportunidad laboral en SODIMAC Perú.</p>
       </motion.div>
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
         <Card className="bg-card border-border shadow-xl">
           <CardHeader>
             <CardTitle className="text-foreground flex items-center space-x-2"><Briefcase className="w-5 h-5 text-primary" /><span>Detalles del Puesto</span></CardTitle>
             <CardDescription className="text-muted-foreground">Completa la información para crear la oferta de trabajo. Los campos con * son obligatorios.</CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Título del Puesto *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej: Vendedor Experto Acabados" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-foreground">Departamento *</Label>
                    <Select required value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecciona departamento" /></SelectTrigger>
                      <SelectContent>{departments.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground">Ubicación *</Label>
                    <Select required value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecciona ubicación" /></SelectTrigger>
                      <SelectContent>{locations.map(location => (<SelectItem key={location} value={location}>{location}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-foreground">Tipo de Contrato *</Label>
                    <Select required value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                      <SelectContent>{jobTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-foreground">Rango Salarial (Opcional)</Label>
                  <Input id="salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej: S/ 2,500 - S/ 3,500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Descripción del Puesto *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Describe las responsabilidades, funciones y objetivos del puesto..." rows={4} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-foreground">Requisitos y Habilidades (Opcional)</Label>
                  <Textarea id="requirements" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Lista los requisitos técnicos, experiencia, habilidades blandas, etc..." rows={3} />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                    {loading ? 'Creando...' : (user?.role === 'hr' ? 'Crear y Publicar Trabajo' : 'Enviar para Aprobación')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/jobs')} className="border-border text-foreground hover:bg-accent/10">Cancelar</Button>
                </div>
                {(user?.role === 'manager' || user?.role === 'hr') && (
                  <div className={`rounded-lg p-4 border flex items-start space-x-3 ${user.role === 'manager' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                    <Info className={`w-5 h-5 mt-0.5 ${user.role === 'manager' ? 'text-blue-600' : 'text-green-600'}`} />
                    <p className={`text-sm ${user.role === 'manager' ? 'text-blue-700' : 'text-green-700'}`}>
                      {user.role === 'manager' ? 'Como gerente de área, tu solicitud de trabajo será enviada a RRHH para aprobación antes de ser publicada.' : 'Como personal de RRHH, tu trabajo será aprobado y publicado automáticamente.'}
                    </p>
                  </div>
                )}
             </form>
           </CardContent>
         </Card>
       </motion.div>
    </div>
  );
};

export default CreateJob;