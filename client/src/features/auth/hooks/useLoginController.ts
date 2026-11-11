import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useMutationFetch } from '../../../lib/react.query';
import { http } from '../../../api/http';
import { HttpError } from '../../../api/http.error.thrower';
import { authValidationSchema } from '../zods';
import { type LoginFormType } from '../types';
import { getErrorMessage } from '../../../api/getErrorMessage';

interface VerificationState {
  email: string;
  firstName?: string;
  lastName?: string;
  hasTimeToVerify: boolean;
}

export function useLoginController() {
  const [verificationData, setVerificationData] = useState<VerificationState | null>(null);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(authValidationSchema.login),
  });

  const { mutate, isPending, error } = useMutationFetch<null, LoginFormType>({
    mutationFn: (data) => http.post<null, unknown>('/api/v1/auth/login', data),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/dashboard');
    },
    onError: (err) => {
      
      toast.error(getErrorMessage(err));
      const isHttpError = err instanceof HttpError;
      if (!isHttpError) return;

      const { code, metadata } = err.response.error;

      // 1. Map Server-Side Validation Errors
      if (code === 'VALIDATION_ERROR' && metadata?.errors) {
        const fieldErrors = metadata.errors as Record<string, string[]>;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof LoginFormType, {
            type: 'manual',
            message: messages[0], 
          });
        });
      } 
      
      // 2. Handle Unverified Email Catch
      else if (code === 'UNVERIFIED_EMAIL' && metadata) {
        const { user, expiresIn } = metadata;

        
        
        setVerificationData({
          hasTimeToVerify: !!expiresIn,
          email: user?.email || "",
          firstName: user?.firstName,
          lastName: user?.lastName,
        });
      }
    },
  });

  
  const onSubmit = (data: LoginFormType) => mutate(data);

  
  return {
    register,
    errors,
    isPending: isPending || isSubmitting,
    errorMessage:error && getErrorMessage(error),
    verificationData,
    handleFormSubmit: handleSubmit(onSubmit),
  };
}
