import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useMutationFetch } from '../../../lib/react.query';
import { http } from '../../../api/http';
import { HttpError } from '../../../api/http.error.thrower';
import { authValidationSchema } from '../zods';
import { type RegisterFormType } from '../types';
import { getErrorMessage } from '../../../api/getErrorMessage';

export type CleanUserPayload = Omit<RegisterFormType, 'confirmPassword' | 'password'> &{
  verificationType:'register';
};

export function useRegisterController() {
  const [registeredUser, setRegisteredUser] = useState<CleanUserPayload | null>(null);

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(authValidationSchema.register),
  });

  const { mutate, isPending, error } = useMutationFetch<null, Omit<RegisterFormType, 'confirmPassword'>>({
    mutationFn: (data) => http.post<null, unknown>('/api/v1/auth/register', data),
    onSuccess: (data, dataSentBackend) => {
      setRegisteredUser({
        email: dataSentBackend.email,
        firstName: dataSentBackend.firstName,
        lastName: dataSentBackend.lastName,
        verificationType:'register'
      });
      toast.success(data.message);
    },
    onError: (err) => {
      const isHttpError = err instanceof HttpError;
      toast.error(getErrorMessage(err));
      if (isHttpError) {
        const { code, metadata } = err.response.error;

        // Map field-level validation constraints
        if (code === 'VALIDATION_ERROR' && metadata?.errors) {
          const fieldErrors = metadata.errors as Record<string, string[]>;
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof RegisterFormType, {
              type: 'manual',
              message: messages[0],
            });
          });
          return;
        }
        
      }
    },
  });

  // Extract confirmPassword 
  const onSubmit = (data: RegisterFormType) => {
    const { confirmPassword, ...submitPayload } = data;
    mutate(submitPayload);
  };

  
  return {
    register,
    errors,
    isPending: isPending || isSubmitting,
    errorMessage: error && getErrorMessage(error),
    registeredUser,
    handleFormSubmit: handleSubmit(onSubmit),
  };
}
