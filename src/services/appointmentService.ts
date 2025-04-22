
import api from './api';

export interface Appointment {
  id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  status: string;
  notes?: string;
}

const appointmentService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/all');
    return response.data;
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/get/${id}`);
    return response.data;
  },

  bookAppointment: async (appointment: Appointment): Promise<Appointment> => {
    const response = await api.post('/appointments/book', appointment);
    return response.data;
  },

  updateAppointment: async (appointment: Appointment): Promise<Appointment> => {
    const response = await api.put('/appointments/update', appointment);
    return response.data;
  },

  cancelAppointment: async (id: string): Promise<void> => {
    await api.delete(`/appointments/cancel/${id}`);
  },

  exportAppointmentsCsv: async (): Promise<Blob> => {
    const response = await api.get('/appointments/csv', {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default appointmentService;
