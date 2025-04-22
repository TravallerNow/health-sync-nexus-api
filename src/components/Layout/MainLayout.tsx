
import React, { ReactNode } from 'react';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = []
}) => {
  const { isAuthenticated, userRole } = useAuth();

  // If this route requires authentication and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If this route has role restrictions and user's role is not allowed, redirect
  if (
    requireAuth && 
    isAuthenticated && 
    allowedRoles.length > 0 && 
    userRole && 
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-6 px-4 md:px-6 container mx-auto">
        {children}
      </main>
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} HealthSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
