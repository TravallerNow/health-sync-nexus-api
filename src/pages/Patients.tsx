
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import patientService, { Patient } from '../services/patientService';
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
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isReadOnly = userRole !== 'ADMIN';

  const defaultPatient: Patient = {
    name: '',
    age: 0,
    gender: '',
    contactInfo: '',
    medicalHistory: '',
  };

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load patients.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (patient: Patient | null = null) => {
    setCurrentPatient(patient || { ...defaultPatient });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentPatient(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (currentPatient) {
      setCurrentPatient({
        ...currentPatient,
        [name]: name === 'age' ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleGenderChange = (value: string) => {
    if (currentPatient) {
      setCurrentPatient({
        ...currentPatient,
        gender: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    try {
      if (currentPatient.id) {
        // Update existing patient
        await patientService.updatePatient(currentPatient);
        toast({
          title: 'Success',
          description: 'Patient updated successfully.',
        });
      } else {
        // Add new patient
        await patientService.addPatient(currentPatient);
        toast({
          title: 'Success',
          description: 'Patient added successfully.',
        });
      }
      
      // Refresh patients list
      fetchPatients();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving patient:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save patient information.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id);
        toast({
          title: 'Success',
          description: 'Patient deleted successfully.',
        });
        // Refresh patients list
        fetchPatients();
      } catch (err) {
        console.error('Error deleting patient:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete patient.',
        });
      }
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout requireAuth={true} allowedRoles={['ADMIN', 'DOCTOR']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Patient Management</h1>
          {!isReadOnly && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.contactInfo}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!isReadOnly && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => patient.id && handleDelete(patient.id)}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentPatient?.id ? 'Edit Patient' : 'Add New Patient'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={currentPatient?.name || ''}
                onChange={handleInputChange}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  value={currentPatient?.age || ''}
                  onChange={handleInputChange}
                  required
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={currentPatient?.gender || ''} 
                  onValueChange={handleGenderChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                value={currentPatient?.contactInfo || ''}
                onChange={handleInputChange}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                value={currentPatient?.medicalHistory || ''}
                onChange={handleInputChange}
                rows={3}
                readOnly={isReadOnly}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              {!isReadOnly && (
                <Button type="submit">
                  {currentPatient?.id ? 'Update' : 'Add'} Patient
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Patients;
