
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { AlertCircle, Clock, CheckCircle, UserCircle, CalendarClock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';

const MyAppointment = () => {
  const { patients, doctor } = useApp();
  
  // Find the user's latest appointment for today
  const today = new Date();
  
  // For demo purposes, we'll just show the last registered patient as the user's appointment
  const myAppointments = patients
    .filter(p => new Date(p.createdAt).toDateString() === today.toDateString())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const latestAppointment = myAppointments[0];
  
  // Calculate estimated wait time
  const calculateEstimatedTime = (serialNumber: number) => {
    const waitingPatientsAhead = patients.filter(p => 
      p.status === 'waiting' && 
      p.serialNumber < serialNumber &&
      new Date(p.createdAt).toDateString() === today.toDateString()
    ).length;
    
    const estimatedMinutes = waitingPatientsAhead * doctor.averageConsultationTime;
    
    if (estimatedMinutes < 60) {
      return `~${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `~${hours} hr${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''}`;
    }
  };
  
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
        <h1 className="text-2xl font-bold mb-6">My Appointment</h1>
        
        {latestAppointment ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Appointment Details</CardTitle>
                  <CardDescription>
                    {new Date(latestAppointment.createdAt).toLocaleDateString()} at {doctor.clinic}
                  </CardDescription>
                </div>
                <div>
                  {getStatusBadge(latestAppointment.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 bg-secondary">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <UserCircle size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{latestAppointment.name}</p>
                      <p className="text-sm text-muted-foreground">{latestAppointment.mobile}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center bg-background px-6 py-3 rounded-md">
                    <span className="text-sm text-muted-foreground">Serial Number</span>
                    <span className="text-2xl font-bold">{latestAppointment.serialNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CalendarClock size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Doctor</p>
                      <p className="text-muted-foreground">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{doctor.clinic}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Wait Time</p>
                      {latestAppointment.status === 'waiting' ? (
                        <p className="text-muted-foreground">
                          {calculateEstimatedTime(latestAppointment.serialNumber)}
                        </p>
                      ) : latestAppointment.status === 'in-progress' ? (
                        <p className="text-blue-600 font-medium">Your turn now!</p>
                      ) : (
                        <p className="text-green-600 font-medium">Completed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {latestAppointment.status === 'waiting' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <AlertCircle size={20} />
                  <div>
                    <p className="font-medium">Please stay nearby</p>
                    <p className="text-sm">We'll announce your name when it's your turn</p>
                  </div>
                </div>
              )}
              
              {latestAppointment.status === 'in-progress' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <Clock size={20} className={cn("animate-pulse-light")} />
                  <div>
                    <p className="font-medium">Your turn now!</p>
                    <p className="text-sm">Please proceed to the doctor's room</p>
                  </div>
                </div>
              )}
              
              {latestAppointment.status === 'completed' && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle size={20} />
                  <div>
                    <p className="font-medium">Appointment completed</p>
                    <p className="text-sm">Thank you for visiting</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">You don't have any appointments today.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MyAppointment;
