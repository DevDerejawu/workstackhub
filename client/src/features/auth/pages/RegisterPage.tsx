// src/pages/auth/RegisterPage.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth'; 
import Register from '../forms/Register'; 

const RegisterPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Register />;
};

export default RegisterPage;