import { Link } from 'react-router-dom';
import { Input, Button } from '../../../components/ui'; 
import { useResetPassword } from '../hooks/useResetPassword';


// this component is used for reset password and account restoring, that is why we have isReset boolean prop
const ResetPassword = ( {token, isReset}: {token:string, isReset:boolean}) => {
  const {successMessage, errorMessage, register, errors, handleFormSubmit, isPending} = useResetPassword(token, isReset)  
  // If success
  if (successMessage) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{isReset? "Password Reset":"Restore Your account"}</h2>
        <p className="text-muted-foreground">{successMessage}</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashbaord...</p>
        <Link to="/auth/login" className="text-sm text-primary hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{isReset? "Reset your password":"Restore your account"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter a new password for your account</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          {...register('newPassword')}
          id="newPassword"
          type="password"
          label="New Password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
        />

        <Input
          {...register('confirmPassword')}
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
        />

        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isPending}
          disabled={isPending}
        >
          {isReset? "Reset Password":"Restore account"}
        </Button>

        <div className="text-center">
          <Link to="/auth/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;