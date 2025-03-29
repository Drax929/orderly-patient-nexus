
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { format } from 'date-fns';

const AppointmentHistory = () => {
  const { patients, doctor } = useApp();
  
  // Group appointments by date
  const appointmentsByDate = patients.reduce((acc, patient) => {
    const date = new Date(patient.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(patient);
    return acc;
  }, {} as Record<string, typeof patients>);
  
  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(appointmentsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Waiting</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Appointment History</h1>
        
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="mb-6">
              <h2 className="text-lg font-medium text-muted-foreground mb-3">
                {format(new Date(date), 'PPPP')}
              </h2>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {appointmentsByDate[date].map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div>
                          <p className="font-medium">{appointment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Serial #{appointment.serialNumber} • {format(new Date(appointment.createdAt), 'h:mm a')}
                          </p>
                        </div>
                        <div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">No appointment history available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default AppointmentHistory;
