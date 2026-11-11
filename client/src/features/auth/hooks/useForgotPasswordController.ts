import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useMutationFetch } from '../../../lib/react.query';
import { http } from '../../../api/http';
import { authValidationSchema } from '../zods';
import { type ForgotPasswordFormType } from '../types';
import { getErrorMessage } from '../../../api/getErrorMessage';

interface FeedbackState {
  message: string;
  isSuccess: boolean;
}

export function useForgotPasswordController() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(authValidationSchema.forgotPassword),
  });

  const { mutate, isPending, isSuccess } = useMutationFetch<null, unknown>({
    mutationFn: (data) => http.post<null, unknown>('/api/v1/auth/forgot-password', data),
    onSuccess: (data) => {
      setFeedback({ message: data.message, isSuccess: true });
      toast.success(data.message);
    },
    onError: (err) => {  
      setFeedback({ message:getErrorMessage(err), isSuccess: false });
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (data: ForgotPasswordFormType) => mutate(data);

  return {
    register,
    errors,
    isPending: isPending || isSubmitting,
    isSuccess,
    feedback,
    handleFormSubmit: handleSubmit(onSubmit),
  };
}
