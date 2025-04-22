
import api from './api';

export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: string;
  contactInfo: string;
  medicalHistory?: string;
}

const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/patients/all');
    return response.data;
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  addPatient: async (patient: Patient): Promise<Patient> => {
    const response = await api.post('/patients/add', patient);
    return response.data;
  },

  updatePatient: async (patient: Patient): Promise<Patient> => {
    const response = await api.put('/patients/update', patient);
    return response.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  deleteAllPatients: async (): Promise<void> => {
    await api.delete('/patients/all');
  }
};

export default patientService;
