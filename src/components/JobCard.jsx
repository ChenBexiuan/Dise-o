import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const JobCard = ({ job, onApply, showApplyButton = true, applied = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white'; // Sodimac Green for approved
      case 'pending': return 'bg-yellow-500 text-secondary-foreground'; // Sodimac Yellow for pending
      case 'rejected': return 'bg-red-500 text-white'; // Sodimac Red for rejected
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 card-hover shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-foreground text-xl">{job.title}</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                {job.department}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(job.status)} border-0`}>
              {job.status === 'approved' ? 'Aprobado' : 
               job.status === 'pending' ? 'Pendiente' : 'Rechazado'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-primary" />
              <span>{job.department}</span>
            </div>
          </div>

          <p className="text-foreground/90 text-sm leading-relaxed">
            {job.description}
          </p>

          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">Requisitos:</span>
            <p className="text-foreground/80 text-sm">{job.requirements}</p>
          </div>

          {showApplyButton && job.status === 'approved' && (
            <Button
              onClick={() => onApply(job)}
              disabled={applied}
              className={`w-full ${
                applied 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {applied ? 'Ya Postulado' : 'Postular'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JobCard;