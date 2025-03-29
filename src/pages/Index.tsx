
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { CalendarClock, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Registration from '@/components/Registration';

const Index = () => {
  const { doctor, patients, currentPatient, callNextPatient, completeCurrentAppointment } = useApp();
  const [activeTab, setActiveTab] = useState('welcome');
  const navigate = useNavigate();
  
  const todayPatients = patients.filter(p => 
    new Date(p.createdAt).toDateString() === new Date().toDateString()
  );
  
  const waitingCount = todayPatients.filter(p => p.status === 'waiting').length;
  const completedCount = todayPatients.filter(p => p.status === 'completed').length;
  
  const nextSerialNumber = todayPatients.length + 1;

  // Get current time to determine if it's morning or evening schedule
  const now = new Date();
  const currentHour = now.getHours();
  
  // Determine if we're in a valid schedule time
  const isMorningSchedule = doctor.schedules.morning && 
    currentHour >= parseInt(doctor.schedules.morning.start.split(':')[0]) && 
    currentHour < parseInt(doctor.schedules.morning.end.split(':')[0]);
  
  const isEveningSchedule = doctor.schedules.evening && 
    currentHour >= parseInt(doctor.schedules.evening.start.split(':')[0]) && 
    currentHour < parseInt(doctor.schedules.evening.end.split(':')[0]);
  
  const isClinicOpen = isMorningSchedule || isEveningSchedule;
  
  const currentSchedule = isMorningSchedule 
    ? `Morning: ${doctor.schedules.morning?.start} - ${doctor.schedules.morning?.end}`
    : isEveningSchedule 
      ? `Evening: ${doctor.schedules.evening?.start} - ${doctor.schedules.evening?.end}`
      : "Clinic is currently closed";

  return (
    <div className="container mx-auto max-w-4xl">
      <Tabs defaultValue="welcome" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="register">Get Started</TabsTrigger>
        </TabsList>
        
        <TabsContent value="welcome" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-primary">{doctor.clinic}</CardTitle>
              <CardDescription className="text-lg">{doctor.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock size={18} />
                <span>{currentSchedule}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="bg-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users size={18} />
                      <span>Queue Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-muted-foreground">Waiting</p>
                        <p className="text-2xl font-bold">{waitingCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{completedCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Serial</p>
                        <p className="text-2xl font-bold">{nextSerialNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>Current Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPatient ? (
                      <div>
                        <p className="text-muted-foreground">Now Serving</p>
                        <p className="text-xl font-semibold">{currentPatient.name}</p>
                        <p className="text-sm text-muted-foreground">Serial #{currentPatient.serialNumber}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No patient is currently being seen</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Doctor controls - only visible to clinic staff */}
              <div className="border rounded-lg p-4 mt-4 bg-muted/30">
                <h3 className="font-medium mb-2">Clinic Controls</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={callNextPatient}
                    disabled={waitingCount === 0}
                  >
                    Call Next Patient
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={completeCurrentAppointment}
                    disabled={!currentPatient}
                  >
                    Complete Current Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setActiveTab('register')}>
                Register for Appointment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="register" className="mt-6">
          <Registration onComplete={() => {
            setActiveTab('welcome');
            navigate('/my-appointment');
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
