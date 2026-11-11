import { Link } from 'react-router-dom';
import { Input, Button } from '../../../components/ui';
import ResendVerification from './ResendVerification';
import { useLoginController } from '../hooks/useLoginController'; 

const Login = () => {
  const {
    register,
    errors,
    isPending,
    errorMessage,
    verificationData,
    handleFormSubmit,
  } = useLoginController();

  // Handle conditional redirect to verification screen if a user is not verified
  if (verificationData) {
    const { email, firstName, lastName } = verificationData;
    return <ResendVerification user={{ email, firstName, lastName, verificationType: 'login' }} />;
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input 
          {...register('email')} 
          id="email" 
          type="email" 
          label="Email address" 
          placeholder="hello@workstackhub.com" 
          error={errors.email?.message} 
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input 
            {...register('password')} 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            error={errors.password?.message} 
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-1" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
        </div>

        { errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        <Button type="submit" variant="primary" size="md" fullWidth loading={isPending} disabled={isPending}>
          Sign In
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-card text-muted-foreground">New to WorkStackHub?</span></div>
        </div>

        <Button variant="outline" size="md" fullWidth asChild>
          <Link to="/auth/register">Create an account</Link>
        </Button>
      </form>
    </div>
  );
};
export default Login;
