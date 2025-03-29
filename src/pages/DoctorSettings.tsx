
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from '@/components/ui/use-toast';
import AppLayout from '@/components/layout/AppLayout';

const DoctorSettings = () => {
  const { doctor, updateDoctor } = useApp();
  
  const [name, setName] = useState(doctor.name);
  const [clinic, setClinic] = useState(doctor.clinic);
  
  const [morningStart, setMorningStart] = useState(doctor.schedules.morning?.start || '');
  const [morningEnd, setMorningEnd] = useState(doctor.schedules.morning?.end || '');
  
  const [eveningStart, setEveningStart] = useState(doctor.schedules.evening?.start || '');
  const [eveningEnd, setEveningEnd] = useState(doctor.schedules.evening?.end || '');
  
  const [consultationTime, setConsultationTime] = useState(doctor.averageConsultationTime.toString());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedDoctor = {
      name,
      clinic,
      schedules: {
        ...(morningStart && morningEnd ? {
          morning: {
            start: morningStart,
            end: morningEnd,
          }
        } : {}),
        ...(eveningStart && eveningEnd ? {
          evening: {
            start: eveningStart,
            end: eveningEnd,
          }
        } : {}),
      },
      averageConsultationTime: parseInt(consultationTime) || 15,
    };
    
    updateDoctor(updatedDoctor);
    
    toast({
      title: "Settings Updated",
      description: "Your doctor settings have been saved successfully.",
    });
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Doctor Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Clinic Configuration</CardTitle>
            <CardDescription>
              Update your clinic information and schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Doctor Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clinic Name</Label>
                  <Input 
                    id="clinic" 
                    value={clinic} 
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Wellness Medical Center"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Morning Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="morningStart" className="text-xs">Start Time</Label>
                    <Input 
                      id="morningStart"
                      type="time"
                      value={morningStart}
                      onChange={(e) => setMorningStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="morningEnd" className="text-xs">End Time</Label>
                    <Input 
                      id="morningEnd"
                      type="time"
                      value={morningEnd}
                      onChange={(e) => setMorningEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Evening Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eveningStart" className="text-xs">Start Time</Label>
                    <Input 
                      id="eveningStart"
                      type="time"
                      value={eveningStart}
                      onChange={(e) => setEveningStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eveningEnd" className="text-xs">End Time</Label>
                    <Input 
                      id="eveningEnd"
                      type="time"
                      value={eveningEnd}
                      onChange={(e) => setEveningEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consultationTime">Average Consultation Time (minutes)</Label>
                <Input 
                  id="consultationTime"
                  type="number"
                  min="1"
                  max="60"
                  value={consultationTime}
                  onChange={(e) => setConsultationTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This helps in calculating estimated waiting times for patients
                </p>
              </div>
              
              <Button type="submit" className="w-full">
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DoctorSettings;
