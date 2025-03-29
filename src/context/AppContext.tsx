
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Patient, Doctor } from '@/types';

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
  
  // Load patients from localStorage on component mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
      try {
        const parsedPatients = JSON.parse(savedPatients);
        // Convert string dates back to Date objects
        const patientsWithDates = parsedPatients.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          appointmentTime: p.appointmentTime ? new Date(p.appointmentTime) : undefined,
        }));
        setPatients(patientsWithDates);
      } catch (error) {
        console.error('Error parsing patients from localStorage:', error);
      }
    }
    
    const savedDoctor = localStorage.getItem('doctor');
    if (savedDoctor) {
      try {
        setDoctor(JSON.parse(savedDoctor));
      } catch (error) {
        console.error('Error parsing doctor from localStorage:', error);
      }
    }
  }, []);
  
  // Save patients to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);
  
  // Save doctor to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('doctor', JSON.stringify(doctor));
  }, [doctor]);
  
  const updateDoctor = (updatedDoctor: Partial<Doctor>) => {
    setDoctor(prev => ({ ...prev, ...updatedDoctor }));
  };
  
  const registerPatient = (name: string, mobile: string) => {
    const today = new Date();
    const todayPatients = patients.filter(p => {
      const patientDate = new Date(p.createdAt);
      return patientDate.toDateString() === today.toDateString();
    });
    
    const serialNumber = todayPatients.length + 1;
    
    const newPatient: Patient = {
      id: `${Date.now()}`,
      name,
      mobile,
      serialNumber,
      status: 'waiting',
      createdAt: new Date(),
    };
    
    setPatients(prev => [...prev, newPatient]);
    
    toast({
      title: "Registration Successful",
      description: `Your serial number is ${serialNumber}`,
    });
    
    return newPatient;
  };
  
  const callNextPatient = () => {
    const waitingPatients = patients
      .filter(p => p.status === 'waiting' && new Date(p.createdAt).toDateString() === new Date().toDateString())
      .sort((a, b) => a.serialNumber - b.serialNumber);
    
    if (waitingPatients.length > 0) {
      const nextPatient = waitingPatients[0];
      
      // Update this patient's status
      setPatients(prev => prev.map(p => 
        p.id === nextPatient.id ? { ...p, status: 'in-progress', appointmentTime: new Date() } : p
      ));
      
      setCurrentPatient({ ...nextPatient, status: 'in-progress', appointmentTime: new Date() });
      
      toast({
        title: "Patient Called",
        description: `Now serving ${nextPatient.name} (Serial #${nextPatient.serialNumber})`,
      });
    } else {
      toast({
        title: "No Waiting Patients",
        description: "The waiting list is currently empty.",
      });
    }
  };
  
  const completeCurrentAppointment = () => {
    if (currentPatient) {
      setPatients(prev => prev.map(p => 
        p.id === currentPatient.id ? { ...p, status: 'completed' } : p
      ));
      
      setCurrentPatient(null);
      
      toast({
        title: "Appointment Completed",
        description: "Ready for the next patient.",
      });
    }
  };
  
  // Mock OTP functions
  const sendOTP = async (mobile: string): Promise<boolean> => {
    // In a real app, you would call an API to send OTP
    console.log(`Sending OTP to ${mobile}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };
  
  const verifyOTP = (otp: string): boolean => {
    // In a real app, you would verify this against a stored OTP or call an API
    // For demo purposes, any 4-digit OTP is valid
    return otp.length === 4 && !isNaN(Number(otp));
  };
  
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
