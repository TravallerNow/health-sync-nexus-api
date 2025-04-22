
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h1 className="text-6xl font-bold text-medical-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex space-x-4">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Unauthorized;
