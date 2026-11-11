import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth'; 
import Login from '../forms/Login'; 

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="text-center py-8">Loading...</div>; 
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

export default LoginPage;