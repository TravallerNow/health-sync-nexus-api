
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import appointmentService, { Appointment } from '../services/appointmentService';
import patientService, { Patient } from '../services/patientService';
import doctorService, { Doctor } from '../services/doctorService';
import slotService, { TimeSlot } from '../services/slotService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash, Download, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const { toast } = useToast();
  const { userRole } = useAuth();

  const defaultAppointment: Appointment = {
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    status: 'SCHEDULED',
    notes: '',
  };

  // Fetch appointments and reference data on component mount
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  // Fetch available slots when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor);
    }
  }, [selectedDoctor]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load appointments.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAvailableSlots = async (doctorId: string) => {
    try {
      const data = await slotService.getAvailableSlots(doctorId);
      setAvailableSlots(data);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load available slots.',
      });
    }
  };

  const handleOpenDialog = (appointment: Appointment | null = null) => {
    if (appointment) {
      setCurrentAppointment(appointment);
      setSelectedDoctor(appointment.doctorId);
    } else {
      setCurrentAppointment({ ...defaultAppointment });
      setSelectedDoctor('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentAppointment(null);
    setSelectedDoctor('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (currentAppointment) {
      setCurrentAppointment({
        ...currentAppointment,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (currentAppointment) {
      if (name === 'doctorId') {
        setSelectedDoctor(value);
      }
      
      setCurrentAppointment({
        ...currentAppointment,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAppointment) return;

    try {
      if (currentAppointment.id) {
        // Update existing appointment
        await appointmentService.updateAppointment(currentAppointment);
        toast({
          title: 'Success',
          description: 'Appointment updated successfully.',
        });
      } else {
        // Book new appointment
        await appointmentService.bookAppointment(currentAppointment);
        toast({
          title: 'Success',
          description: 'Appointment booked successfully.',
        });
      }
      
      // Refresh appointments list
      fetchAppointments();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving appointment:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save appointment information.',
      });
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(id);
        toast({
          title: 'Success',
          description: 'Appointment cancelled successfully.',
        });
        // Refresh appointments list
        fetchAppointments();
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to cancel appointment.',
        });
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await appointmentService.exportAppointmentsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export appointments to CSV.',
      });
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

  // Helper function to get patient name
  const getPatientName = (id: string) => {
    const patient = patients.find(p => p.id === id);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Helper function to get doctor name
  const getDoctorName = (id: string) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  return (
    <MainLayout requireAuth={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appointment Management</h1>
          <div className="flex space-x-2">
            <Button onClick={handleExportCsv} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
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
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading appointments...
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{getPatientName(appointment.patientId)}</TableCell>
                    <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                    <TableCell>{formatDateTime(appointment.appointmentDate)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'SCHEDULED' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {appointment.status === 'SCHEDULED' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => appointment.id && handleCancel(appointment.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentAppointment?.id ? 'Edit Appointment' : 'Book New Appointment'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient</Label>
              <Select 
                value={currentAppointment?.patientId || ''} 
                onValueChange={(value) => handleSelectChange('patientId', value)}
                disabled={!!currentAppointment?.id}
              >
                <SelectTrigger id="patientId">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id || ''}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor</Label>
              <Select 
                value={currentAppointment?.doctorId || ''} 
                onValueChange={(value) => handleSelectChange('doctorId', value)}
                disabled={!!currentAppointment?.id}
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
            
            {selectedDoctor && !currentAppointment?.id && (
              <div className="space-y-2">
                <Label htmlFor="appointmentSlot">Available Slots</Label>
                <Select 
                  value={currentAppointment?.appointmentDate || ''} 
                  onValueChange={(value) => handleSelectChange('appointmentDate', value)}
                >
                  <SelectTrigger id="appointmentSlot">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length === 0 ? (
                      <SelectItem value="none" disabled>No available slots</SelectItem>
                    ) : (
                      availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.startTime}>
                          {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {currentAppointment?.id && (
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Appointment Date & Time</Label>
                <div className="flex items-center border rounded-md px-3 py-2 text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {formatDateTime(currentAppointment.appointmentDate)}
                </div>
              </div>
            )}
            
            {currentAppointment?.id && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={currentAppointment?.status || ''} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={currentAppointment?.notes || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special requirements or information"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!currentAppointment?.id && (!currentAppointment?.patientId || !currentAppointment?.doctorId || !currentAppointment?.appointmentDate)}
              >
                {currentAppointment?.id ? 'Update' : 'Book'} Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Appointments;
