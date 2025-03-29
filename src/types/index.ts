
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
