import { useEffect} from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

interface VerifyEmailProps {
  token: string;
}

const VerifyEmail = ({ token }: VerifyEmailProps) => {
  const { successMessage, errorMessage, isPending, handleVerify } = useVerifyEmail(token);
  useEffect(() => {
      handleVerify();
  }, []);

  // ---- Success state ----
  if (successMessage) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Email Verified</h2>
        <p className="text-muted-foreground">{successMessage}</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
        <Link to="/dashboard" className="text-sm text-primary hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // ---- Error state ----
  if (errorMessage) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <p className="text-sm text-muted-foreground">
          The link may have expired or is invalid.
        </p>
        <Link to="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  // ---- initial state ----
  return (
    <div className="space-y-5 text-center">
      
      {isPending ? (
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="h-8" /> 
      )}
      
      <h1 className="text-2xl font-bold text-foreground">
        {isPending ? 'Verifying your email' : 'Account Verification'}
      </h1>
      <p className="text-muted-foreground">
        {isPending ? 'Please wait while we confirm your account.' : ''}
      </p>
      
      <div className="text-center">
        <Link to="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
