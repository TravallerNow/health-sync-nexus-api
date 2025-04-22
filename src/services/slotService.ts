
import api from './api';

export interface TimeSlot {
  id?: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const slotService = {
  getAvailableSlots: async (doctorId: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/slots/available/${doctorId}`);
    return response.data;
  },

  addSlot: async (slot: TimeSlot): Promise<TimeSlot> => {
    const response = await api.post('/slots/add', slot);
    return response.data;
  },

  updateSlot: async (slot: TimeSlot): Promise<TimeSlot> => {
    const response = await api.post('/slots/update', slot);
    return response.data;
  },

  deleteSlot: async (slot: TimeSlot): Promise<void> => {
    await api.post('/slots/delete', slot);
  }
};

export default slotService;
