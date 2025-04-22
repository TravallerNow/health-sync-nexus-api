import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, User, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-100 to-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your Health, <span className="text-medical-600">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A complete health management solution for patients, doctors, and administrators.
                Book appointments, manage records, and stay connected with your healthcare providers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Get Started
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
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                alt="Health management illustration" 
                className="rounded-lg shadow-xl max-w-full h-auto" 
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Patient Management</h3>
              <p className="text-gray-600">
                Easily manage patient records, medical histories, and personal information in one secure location.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Doctor Directory</h3>
              <p className="text-gray-600">
                Browse healthcare providers by specialization and availability, and connect with the right specialist.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Appointment Scheduling</h3>
              <p className="text-gray-600">
                Book, reschedule, or cancel appointments with healthcare providers with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-medical-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your health?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who are already using our platform.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white text-medical-600 border-white hover:bg-medical-50"
            onClick={() => navigate('/register')}
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
