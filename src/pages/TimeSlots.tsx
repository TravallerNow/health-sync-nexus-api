
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import slotService, { TimeSlot } from '../services/slotService';
import doctorService, { Doctor } from '../services/doctorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const TimeSlots: React.FC = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isReadOnly = userRole !== 'ADMIN' && userRole !== 'DOCTOR';

  const defaultSlot: TimeSlot = {
    doctorId: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch slots when a doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots(selectedDoctor);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
      
      // If there's at least one doctor, select the first one
      if (data.length > 0 && data[0].id) {
        setSelectedDoctor(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load doctors.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlots = async (doctorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await slotService.getAvailableSlots(doctorId);
      setSlots(data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load time slots. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load time slots.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (slot: TimeSlot | null = null) => {
    if (slot) {
      setCurrentSlot(slot);
    } else {
      setCurrentSlot({ 
        ...defaultSlot,
        doctorId: selectedDoctor,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentSlot(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentSlot) {
      setCurrentSlot({
        ...currentSlot,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string | boolean) => {
    if (currentSlot) {
      setCurrentSlot({
        ...currentSlot,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlot) return;

    try {
      if (currentSlot.id) {
        // Update existing slot
        await slotService.updateSlot(currentSlot);
        toast({
          title: 'Success',
          description: 'Time slot updated successfully.',
        });
      } else {
        // Add new slot
        await slotService.addSlot(currentSlot);
        toast({
          title: 'Success',
          description: 'Time slot added successfully.',
        });
      }
      
      // Refresh slots list
      fetchSlots(selectedDoctor);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving time slot:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save time slot information.',
      });
    }
  };

  const handleDelete = async (slot: TimeSlot) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await slotService.deleteSlot(slot);
        toast({
          title: 'Success',
          description: 'Time slot deleted successfully.',
        });
        // Refresh slots list
        fetchSlots(selectedDoctor);
      } catch (err) {
        console.error('Error deleting time slot:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete time slot.',
        });
      }
    }
  };

  // Helper function to format date
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPp');
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to get doctor name
  const getDoctorName = (id: string) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  return (
    <MainLayout requireAuth={true} allowedRoles={['ADMIN', 'DOCTOR']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Time Slot Management</h1>
          {!isReadOnly && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Time Slot
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctorSelect">Select Doctor</Label>
            <Select 
              value={selectedDoctor} 
              onValueChange={setSelectedDoctor}
            >
              <SelectTrigger id="doctorSelect" className="w-[300px]">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id || ''}>
                    {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading time slots...
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No time slots found for this doctor.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{getDoctorName(slot.doctorId)}</TableCell>
                    <TableCell>{formatDateTime(slot.startTime)}</TableCell>
                    <TableCell>{formatDateTime(slot.endTime)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!isReadOnly && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(slot)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentSlot?.id ? 'Edit Time Slot' : 'Add New Time Slot'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor</Label>
              <Select 
                value={currentSlot?.doctorId || ''} 
                onValueChange={(value) => handleSelectChange('doctorId', value)}
                disabled={!!currentSlot?.id}
              >
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id || ''}>
                      {doctor.name} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={currentSlot?.startTime ? currentSlot.startTime.split('.')[0] : ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={currentSlot?.endTime ? currentSlot.endTime.split('.')[0] : ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="isAvailable">Availability</Label>
              <Select 
                value={currentSlot?.isAvailable ? 'true' : 'false'} 
                onValueChange={(value) => handleSelectChange('isAvailable', value === 'true')}
              >
                <SelectTrigger id="isAvailable" className="w-[180px]">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {currentSlot?.id ? 'Update' : 'Add'} Time Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TimeSlots;
