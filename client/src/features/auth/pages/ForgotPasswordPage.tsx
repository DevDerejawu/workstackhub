
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth'; 
import ForgotPassword from '../forms/ForgotPassword';

const ForgotPasswordPage = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ForgotPassword />;
};

export default ForgotPasswordPage;