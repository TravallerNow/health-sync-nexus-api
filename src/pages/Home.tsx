
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Users, Calendar as CalendarIcon } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <User className="h-8 w-8 text-medical-600" />,
      title: 'Patient Management',
      description: 'Manage patient records, medical histories, and personal information securely.',
      linkText: 'Manage Patients',
      link: '/patients',
      roles: ['ADMIN', 'DOCTOR']
    },
    {
      icon: <Users className="h-8 w-8 text-medical-600" />,
      title: 'Doctor Directory',
      description: 'Browse and manage healthcare providers by specialization and availability.',
      linkText: 'View Doctors',
      link: '/doctors',
      roles: ['ADMIN', 'PATIENT']
    },
    {
      icon: <Calendar className="h-8 w-8 text-medical-600" />,
      title: 'Appointment Scheduling',
      description: 'Book, reschedule, or cancel appointments with healthcare providers.',
      linkText: 'Manage Appointments',
      link: '/appointments',
      roles: ['ADMIN', 'DOCTOR', 'PATIENT']
    },
    {
      icon: <CalendarIcon className="h-8 w-8 text-medical-600" />,
      title: 'Time Slot Management',
      description: 'Set and manage available time slots for appointments.',
      linkText: 'Manage Slots',
      link: '/slots',
      roles: ['ADMIN', 'DOCTOR']
    }
  ];

  const filteredFeatures = features.filter(feature => 
    !feature.roles || !userRole || feature.roles.includes(userRole)
  );

  return (
    <MainLayout>
      <div className="py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to HealthSync
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete health management solution for patients, doctors, and administrators.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="max-w-3xl text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Get Started with HealthSync
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in to your account or create a new one to manage appointments, 
                view health records, and connect with healthcare providers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">For Patients</h3>
                <p className="mt-2 text-gray-600">
                  Book appointments, access health records, and communicate with your healthcare providers.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">For Doctors</h3>
                <p className="mt-2 text-gray-600">
                  Manage your schedule, review patient information, and maintain patient records.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">For Administrators</h3>
                <p className="mt-2 text-gray-600">
                  Oversee the entire system, manage users, and ensure smooth operations.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    onClick={() => navigate(feature.link)}
                    className="w-full"
                  >
                    {feature.linkText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
