import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui'; 
import { useMutationFetch } from '../../../lib/react.query';
import { http } from '../../../api/http'; 
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../api/getErrorMessage';
interface VerificationPendingProps {
  user:{
    email: string;
    firstName?: string;
    lastName?: string;
    verificationType:'register' | 'login'
  }
}
const ResendVerification = ({user}: VerificationPendingProps) => {
  const { email, firstName, lastName, verificationType } = user;
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const { mutate: resendVerification, isPending } = useMutationFetch<null, { email: string }>({
    mutationFn: async (data) => {
      const response = await http.post<null, unknown>('/api/v1/auth/resend-verification', data);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setResendSuccess(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setResendError(getErrorMessage(error));
    },
  });

  const handleResend = () => {
    setResendSuccess(null);
    resendVerification({ email });
  };

  // Build full name
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'there';

  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-success" />
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Hello, {fullName}!</h2>
        <p className="text-muted-foreground mt-1">
          {verificationType === 'register'? 
          (<>
              We've sent a verification link to <strong className="text-foreground">{email}</strong>.
          </>):
          (<>
            We've sent a verification link to your email when you register, but you didn't verify, please click the "Button" bellow to verify <strong className="text-foreground">{email}</strong> email address now.
          </>)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {verificationType === 'register'?  
          <>
            Please check your inbox and click the link to activate your account.
          </>:
          <>
            Please click the button bellow to get a new verification link.
          </>}
        </p>
      </div>

      {/* Resend section */}
      <div className="border-t border-border pt-6 mt-2">
        <p className="text-sm text-muted-foreground mb-4">
          Didn't receive the email?
        </p>

        {resendSuccess && (
          <div className="mb-4 p-3 bg-success/10 border border-success rounded-lg">
            <p className="text-sm text-success">{resendSuccess}</p>
          </div>
        )}

        {resendError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{resendError}</p>
        </div>
         )}
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={handleResend}
          loading={isPending}
          disabled={isPending}
          icon={<RefreshCw className="w-4 h-4" />}
          iconPosition="left"
        >
          Resend Verification Email
        </Button>
      </div>
    </div>
  );
};

export default ResendVerification;