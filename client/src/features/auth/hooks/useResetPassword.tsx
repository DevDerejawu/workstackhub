import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router-dom'
import { useMutationFetch } from '../../../lib/react.query'; 
import { http } from '../../../api/http'; 
import { HttpError } from '../../../api/http.error.thrower'; 
import { useState } from 'react';
import { authValidationSchema } from '../zods';
import type { ResetPasswordFormType } from '../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../api/getErrorMessage';
export function useResetPassword(token:string, isReset:boolean){
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormType>({
    resolver: zodResolver(authValidationSchema.resetPassword),
  });

  const { mutate, isPending, error } = useMutationFetch<null, Omit<ResetPasswordFormType, 'confirmPassword'> &{
    token:string
  }>({
    mutationFn: async (data) => {
      const link = isReset? '/api/v1/auth/reset-password': '/api/v1/auth/account-restore'
      const response = await http.post<null, unknown>(link, data);
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
      if (err instanceof HttpError) {
        const { code, metadata } = err.response.error;

        if (code === 'VALIDATION_ERROR' && metadata?.errors) {
          const fieldErrors = metadata.errors as Record<string, string[]>;
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ResetPasswordFormType, {
              type: 'manual',
              message: messages[0],
            });
          });
          return;
        }
      }
    },
  });
  
  function onSubmit(data:ResetPasswordFormType){
    mutate({token, newPassword: data.newPassword})
  } 

  return {
    errorMessage :error && getErrorMessage(error),
    errors,
    isPending:isPending || isSubmitting,
    successMessage,
    handleFormSubmit:handleSubmit(onSubmit),
    register
  }
}

