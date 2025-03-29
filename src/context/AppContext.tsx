
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Patient, Doctor, mapDbPatientToPatient, mapDbDoctorToDoctor, mapPatientToDbPatient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AppContextType {
  // Doctor info
  doctor: Doctor;
  updateDoctor: (doctor: Partial<Doctor>) => void;
  
  // Patient management
  patients: Patient[];
  currentPatient: Patient | null;
  registerPatient: (name: string, mobile: string) => void;
  callNextPatient: () => void;
  completeCurrentAppointment: () => void;
  
  // Mock verification
  sendOTP: (mobile: string) => Promise<boolean>;
  verifyOTP: (otp: string) => boolean;
}

const defaultDoctor: Doctor = {
  id: '1',
  name: 'Dr. John Doe',
  clinic: 'Wellness Medical Center',
  schedules: {
    morning: {
      start: '09:00',
      end: '12:00',
    },
    evening: {
      start: '17:00',
      end: '20:00',
    },
  },
  averageConsultationTime: 15, // 15 minutes per patient
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor>(defaultDoctor);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load doctor and patients from Supabase on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch doctor
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .limit(1);
        
        if (doctorError) {
          console.error('Error fetching doctor:', doctorError);
        } else if (doctorData && doctorData.length > 0) {
          setDoctor(mapDbDoctorToDoctor(doctorData[0]));
        }
        
        // Fetch patients
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (patientError) {
          console.error('Error fetching patients:', patientError);
        } else if (patientData) {
          const mappedPatients = patientData.map(mapDbPatientToPatient);
          setPatients(mappedPatients);
          
          // Check for current in-progress patient
          const inProgressPatient = mappedPatients.find(p => p.status === 'in-progress');
          if (inProgressPatient) {
            setCurrentPatient(inProgressPatient);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const updateDoctor = async (updatedDoctor: Partial<Doctor>) => {
    const mergedDoctor = { ...doctor, ...updatedDoctor };
    setDoctor(mergedDoctor);
    
    try {
      const dbDoctor = mapDoctorToDbDoctor(mergedDoctor);
      const { error } = await supabase
        .from('doctors')
        .update(dbDoctor)
        .eq('id', doctor.id);
      
      if (error) {
        console.error('Error updating doctor:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update doctor information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };
  
  const registerPatient = async (name: string, mobile: string) => {
    try {
      const today = new Date();
      
      // Get the current max serial number for today
      const { data, error: countError } = await supabase
        .from('patients')
        .select('serial_number')
        .gte('created_at', today.toISOString().split('T')[0])
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('serial_number', { ascending: false })
        .limit(1);
      
      if (countError) {
        console.error('Error counting patients:', countError);
        throw new Error('Failed to register patient');
      }
      
      const serialNumber = data && data.length > 0 ? data[0].serial_number + 1 : 1;
      
      const newPatient: Patient = {
        id: `${Date.now()}`,
        name,
        mobile,
        serialNumber,
        status: 'waiting',
        createdAt: today,
      };
      
      const dbPatient = mapPatientToDbPatient(newPatient);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('patients')
        .insert(dbPatient)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error registering patient:', insertError);
        throw new Error('Failed to register patient');
      }
      
      const insertedPatient = mapDbPatientToPatient(insertedData);
      setPatients(prev => [insertedPatient, ...prev]);
      
      toast({
        title: "Registration Successful",
        description: `Your serial number is ${serialNumber}`,
      });
      
      return insertedPatient;
    } catch (error) {
      console.error('Error registering patient:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register patient. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const callNextPatient = async () => {
    try {
      const waitingPatients = patients
        .filter(p => p.status === 'waiting' && new Date(p.createdAt).toDateString() === new Date().toDateString())
        .sort((a, b) => a.serialNumber - b.serialNumber);
      
      if (waitingPatients.length === 0) {
        toast({
          title: "No Waiting Patients",
          description: "The waiting list is currently empty.",
        });
        return;
      }
      
      const nextPatient = waitingPatients[0];
      const now = new Date();
      
      // Update in Supabase
      const { error } = await supabase
        .from('patients')
        .update({
          status: 'in-progress',
          appointment_time: now.toISOString()
        })
        .eq('id', nextPatient.id);
      
      if (error) {
        console.error('Error calling next patient:', error);
        throw new Error('Failed to call next patient');
      }
      
      // Update local state
      const updatedPatient = {
        ...nextPatient,
        status: 'in-progress',
        appointmentTime: now
      };
      
      setPatients(prev => prev.map(p => 
        p.id === nextPatient.id ? updatedPatient : p
      ));
      
      setCurrentPatient(updatedPatient);
      
      toast({
        title: "Patient Called",
        description: `Now serving ${nextPatient.name} (Serial #${nextPatient.serialNumber})`,
      });
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast({
        title: "Error",
        description: "Failed to call next patient. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const completeCurrentAppointment = async () => {
    if (!currentPatient) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('patients')
        .update({ status: 'completed' })
        .eq('id', currentPatient.id);
      
      if (error) {
        console.error('Error completing appointment:', error);
        throw new Error('Failed to complete appointment');
      }
      
      // Update local state
      setPatients(prev => prev.map(p => 
        p.id === currentPatient.id ? { ...p, status: 'completed' } : p
      ));
      
      setCurrentPatient(null);
      
      toast({
        title: "Appointment Completed",
        description: "Ready for the next patient.",
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Mock OTP functions (these don't need Supabase changes)
  const sendOTP = async (mobile: string): Promise<boolean> => {
    console.log(`Sending OTP to ${mobile}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };
  
  const verifyOTP = (otp: string): boolean => {
    return otp.length === 4 && !isNaN(Number(otp));
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <AppContext.Provider
      value={{
        doctor,
        updateDoctor,
        patients,
        currentPatient,
        registerPatient,
        callNextPatient,
        completeCurrentAppointment,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
