
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import doctorService, { Doctor } from '../services/doctorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isReadOnly = userRole !== 'ADMIN';

  const defaultDoctor: Doctor = {
    name: '',
    specialization: '',
    contactInfo: '',
    availability: '',
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
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

  const handleOpenDialog = (doctor: Doctor | null = null) => {
    setCurrentDoctor(doctor || { ...defaultDoctor });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentDoctor(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (currentDoctor) {
      setCurrentDoctor({
        ...currentDoctor,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;

    try {
      if (currentDoctor.id) {
        // Update existing doctor
        await doctorService.updateDoctor(currentDoctor);
        toast({
          title: 'Success',
          description: 'Doctor updated successfully.',
        });
      } else {
        // Add new doctor
        await doctorService.addDoctor(currentDoctor);
        toast({
          title: 'Success',
          description: 'Doctor added successfully.',
        });
      }
      
      // Refresh doctors list
      fetchDoctors();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving doctor:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save doctor information.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id);
        toast({
          title: 'Success',
          description: 'Doctor deleted successfully.',
        });
        // Refresh doctors list
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete doctor.',
        });
      }
    }
  };

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout requireAuth={true} allowedRoles={['ADMIN', 'PATIENT']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Doctor Management</h1>
          {!isReadOnly && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Doctor
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctors..."
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
                <TableHead>Specialization</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading doctors...
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No doctors found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.contactInfo}</TableCell>
                    <TableCell>{doctor.availability}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!isReadOnly && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => doctor.id && handleDelete(doctor.id)}
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
              {currentDoctor?.id ? 'Edit Doctor' : 'Add New Doctor'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={currentDoctor?.name || ''}
                onChange={handleInputChange}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                name="specialization"
                value={currentDoctor?.specialization || ''}
                onChange={handleInputChange}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                value={currentDoctor?.contactInfo || ''}
                onChange={handleInputChange}
                required
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                name="availability"
                value={currentDoctor?.availability || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="E.g., Mon-Fri, 9 AM - 5 PM"
                readOnly={isReadOnly}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              {!isReadOnly && (
                <Button type="submit">
                  {currentDoctor?.id ? 'Update' : 'Add'} Doctor
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Doctors;
