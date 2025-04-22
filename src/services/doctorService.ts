
import api from './api';

export interface Doctor {
  id?: string;
  name: string;
  specialization: string;
  contactInfo: string;
  availability?: string;
}

const doctorService = {
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors/all');
    return response.data;
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/get/${id}`);
    return response.data;
  },

  addDoctor: async (doctor: Doctor): Promise<Doctor> => {
    const response = await api.post('/doctors/add', doctor);
    return response.data;
  },

  updateDoctor: async (doctor: Doctor): Promise<Doctor> => {
    const response = await api.put('/doctors/update', doctor);
    return response.data;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`);
  }
};

export default doctorService;
