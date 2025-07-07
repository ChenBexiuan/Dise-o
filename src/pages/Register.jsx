import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // El rol se seleccionará desde el formulario
    phone: '',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del formulario
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }


    setLoading(true);

    try {
      // Preparamos los datos incluyendo el rol seleccionado en el formulario.
      const userDataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        department: formData.department
      };

      await register(userDataToSend);

      toast({
          title: '¡Registro exitoso!',
          description: `La cuenta para ${formData.name} ha sido creada. Por favor, inicia sesión.`,
      });
      navigate('/login');

    } catch (error) {
      toast({
        title: 'Error de registro',
        description: error.message || 'Ocurrió un error al crear la cuenta.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const peruvianDepartments = [
    'Ventas Retail (Tienda)', 'Cajas y Tesorería', 'Logística y Distribución', 'Atención al Cliente y Postventa', 
    'Administración y Contabilidad', 'Recursos Humanos y Bienestar', 'Marketing y Publicidad Digital', 
    'Tecnología y Sistemas (IT)', 'Mantenimiento e Infraestructura', 'Gerencia de Tienda y Operaciones',
    'Proyectos Especiales y Decoración', 'E-commerce y Ventas Online', 'Prevención de Pérdidas', 'Visual Merchandising'
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
            >
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl text-foreground">Crear Cuenta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Únete a SODIMAC Reclutamiento Perú y encuentra tu oportunidad
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Tu nombre completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="tu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Teléfono (Opcional)</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej: 987 654 321" />
              </div>
              
              
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10" placeholder="Mínimo 6 caracteres" required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Contraseña *</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="bg-input border-border text-foreground placeholder:text-muted-foreground" placeholder="Repite tu contraseña" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
            <div className="text-center text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-accent hover:text-accent/80 underline">Inicia sesión aquí</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
