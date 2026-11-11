
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutationFetch } from '../../../lib/react.query';
import { http } from '../../../api/http';
import { getErrorMessage } from '../../../api/getErrorMessage';

export function useVerifyEmail(token: string) {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate, isPending, error } = useMutationFetch<null, { token: string }>({
    mutationFn: async (data) => {
      const response = await http.post<null, unknown>('/api/v1/auth/verify-email', data);
      return response; 
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSuccessMessage(data.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleVerify = () => {
    if (!token) return;
    mutate({ token });
  };

  return {
    successMessage,
    errorMessage: error && getErrorMessage(error),
    isPending,
    handleVerify,
  };
}