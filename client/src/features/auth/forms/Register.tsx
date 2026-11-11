import { Link } from 'react-router-dom';
import { Input, Button } from '../../../components/ui'; 
import ResendVerification from './ResendVerification';
import { useRegisterController } from '../hooks/useRegisterController';

const Register = () => {
  const {
    register,
    errors,
    isPending,
    errorMessage,
    registeredUser,
    handleFormSubmit,
  } = useRegisterController();

  // after successful registering, let users to resend if not the verification email is not sent.
  if (registeredUser) {
    return <ResendVerification user={registeredUser} />;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start tracking your proposals today</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input 
            {...register('firstName')} 
            id="firstName" 
            type="text" 
            label="First name" 
            placeholder="Derejawu" 
            error={errors.firstName?.message} 
          />
          <Input 
            {...register('lastName')} 
            id="lastName" 
            type="text" 
            label="Last name" 
            placeholder="Baye" 
            error={errors.lastName?.message} 
          />
        </div>

        <Input 
          {...register('email')} 
          id="email" 
          type="email" 
          label="Email" 
          placeholder="hello@workstackhub.com" 
          error={errors.email?.message} 
        />

        <Input 
          {...register('password')} 
          id="password" 
          type="password" 
          label="Password" 
          placeholder="••••••••" 
          error={errors.password?.message} 
        />

        <Input 
          {...register('confirmPassword')} 
          id="confirmPassword" 
          type="password" 
          label="Confirm Password" 
          placeholder="••••••••" 
          error={errors.confirmPassword?.message} 
        />

        <div className="flex items-center gap-2">
          <input type="checkbox" id="terms" className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-1" required/>
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </label>
        </div>

        { errorMessage && (
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
          Create Account
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-card text-muted-foreground">Already have an account?</span></div>
        </div>

        <Button variant="outline" size="md" fullWidth asChild>
          <Link to="/auth/login">Sign in instead</Link>
        </Button>
      </form>
    </div>
  );
};

export default Register;
