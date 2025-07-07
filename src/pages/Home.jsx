import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Users, TrendingUp, Award, ArrowRight, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import sodimacImage from '@/images/Sodimac.jpg'; // Usa alias si tienes configurado '@' o simplemente usa: '../images/Sodimac.jpg'


const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Briefcase,
      title: 'Gestión de Vacantes',
      description: 'Publica y administra ofertas de empleo de forma sencilla e intuitiva.'
    },
    {
      icon: Users,
      title: 'Seguimiento de Candidatos',
      description: 'Visualiza y gestiona el progreso de cada postulación en un solo lugar.'
    },
    {
      icon: TrendingUp,
      title: 'Optimización del Proceso',
      description: 'Agiliza tu reclutamiento con herramientas eficientes y colaborativas.'
    },
    {
      icon: Award,
      title: 'Flujo de Aprobación Claro',
      description: 'Proceso estructurado para la aprobación de vacantes entre áreas y RRHH.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-8 py-12 rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-6">
          <motion.div 
            className="inline-block p-3 bg-card rounded-full shadow-lg mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
          >
            <Building className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-foreground"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Bienvenido a SODIMAC
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Portal de Talento
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Conectamos a los mejores profesionales con oportunidades únicas en SODIMAC. Únete a nuestro equipo y construye el futuro con nosotros.
          </motion.p>
        </div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {!user ? (
            <>
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3">
                  Regístrate Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-accent/10 text-lg px-8 py-3">
                  Ver Vacantes
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/jobs">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3">
                Explorar Vacantes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div 
          className="relative mt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
         <img
  className="mx-auto rounded-2xl shadow-2xl border border-border animate-float"
  alt="Equipo de Sodimac trabajando en un proyecto de construcción y hogar"
  src={sodimacImage}
/>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="space-y-12 py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="text-center space-y-4" variants={itemVariants}>
          <h2 className="text-4xl font-bold text-foreground">¿Por qué unirte a SODIMAC?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre las ventajas de nuestra plataforma de reclutamiento y sé parte de una gran empresa.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-border hover:border-primary/50 transition-all duration-300 card-hover h-full bg-card shadow-lg">
                  <CardHeader className="text-center">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </motion.div>
                    <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div 
            className="space-y-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-4xl md:text-5xl font-bold text-primary">100+</div>
            <div className="text-muted-foreground">Tiendas a Nivel Nacional</div>
          </motion.div>
          <motion.div 
            className="space-y-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-4xl md:text-5xl font-bold text-secondary">5,000+</div>
            <div className="text-muted-foreground">Colaboradores Apasionados</div>
          </motion.div>
          <motion.div 
            className="space-y-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-4xl md:text-5xl font-bold text-accent">Nº1</div>
            <div className="text-muted-foreground">En Mejoramiento del Hogar</div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {!user && (
        <motion.section 
          className="text-center space-y-8 bg-card rounded-2xl p-12 border border-border shadow-xl my-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">¿Listo para construir tu futuro?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a SODIMAC y sé parte de un equipo que transforma hogares y vidas.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-12 py-4">
                Crear Cuenta
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;