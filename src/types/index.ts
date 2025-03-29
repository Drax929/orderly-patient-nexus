
export interface Patient {
  id: string;
  name: string;
  mobile: string;
  serialNumber: number;
  status: 'waiting' | 'in-progress' | 'completed';
  createdAt: Date;
  appointmentTime?: Date;
}

export interface Doctor {
  id: string;
  name: string;
  clinic: string;
  schedules: {
    morning?: {
      start: string;
      end: string;
    };
    evening?: {
      start: string;
      end: string;
    };
  };
  averageConsultationTime: number; // in minutes
}

// Add mapping functions to convert between Supabase DB types and our application types
export const mapDbPatientToPatient = (dbPatient: any): Patient => {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    mobile: dbPatient.mobile,
    serialNumber: dbPatient.serial_number,
    status: dbPatient.status as 'waiting' | 'in-progress' | 'completed',
    createdAt: new Date(dbPatient.created_at),
    appointmentTime: dbPatient.appointment_time ? new Date(dbPatient.appointment_time) : undefined,
  };
};

export const mapPatientToDbPatient = (patient: Partial<Patient>): any => {
  const dbPatient: any = {};
  
  if (patient.id !== undefined) dbPatient.id = patient.id;
  if (patient.name !== undefined) dbPatient.name = patient.name;
  if (patient.mobile !== undefined) dbPatient.mobile = patient.mobile;
  if (patient.serialNumber !== undefined) dbPatient.serial_number = patient.serialNumber;
  if (patient.status !== undefined) dbPatient.status = patient.status;
  if (patient.appointmentTime !== undefined) {
    dbPatient.appointment_time = patient.appointmentTime.toISOString();
  }
  
  return dbPatient;
};

export const mapDbDoctorToDoctor = (dbDoctor: any): Doctor => {
  return {
    id: dbDoctor.id,
    name: dbDoctor.name,
    clinic: dbDoctor.clinic,
    schedules: {
      morning: dbDoctor.morning_start && dbDoctor.morning_end ? {
        start: dbDoctor.morning_start,
        end: dbDoctor.morning_end
      } : undefined,
      evening: dbDoctor.evening_start && dbDoctor.evening_end ? {
        start: dbDoctor.evening_start,
        end: dbDoctor.evening_end
      } : undefined,
    },
    averageConsultationTime: dbDoctor.average_consultation_time,
  };
};

export const mapDoctorToDbDoctor = (doctor: Partial<Doctor>): any => {
  const dbDoctor: any = {};
  
  if (doctor.id !== undefined) dbDoctor.id = doctor.id;
  if (doctor.name !== undefined) dbDoctor.name = doctor.name;
  if (doctor.clinic !== undefined) dbDoctor.clinic = doctor.clinic;
  if (doctor.schedules?.morning) {
    dbDoctor.morning_start = doctor.schedules.morning.start;
    dbDoctor.morning_end = doctor.schedules.morning.end;
  }
  if (doctor.schedules?.evening) {
    dbDoctor.evening_start = doctor.schedules.evening.start;
    dbDoctor.evening_end = doctor.schedules.evening.end;
  }
  if (doctor.averageConsultationTime !== undefined) {
    dbDoctor.average_consultation_time = doctor.averageConsultationTime;
  }
  
  return dbDoctor;
};
