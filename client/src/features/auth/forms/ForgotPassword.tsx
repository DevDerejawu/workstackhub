import { Link } from 'react-router-dom';
import { Input, Button } from '../../../components/ui';
import { useForgotPasswordController } from '../hooks/useForgotPasswordController';
const ForgotPassword = () => {
  const {
    register,
    errors,
    isPending,
    isSuccess,
    feedback,
    handleFormSubmit,
  } = useForgotPasswordController();

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Dynamic Success Alert Banner Box */}
        {feedback?.isSuccess && (
          <div className="p-3 bg-success/10 border border-success rounded-lg">
            <p className="text-sm text-success">
              {feedback.message}
            </p>
          </div>
        )}

        <Input
          {...register('email')}
          id="email"
          type="email"
          label="Email address"
          placeholder="hello@workstackhub.com"
          error={errors.email?.message}
        />

        {/* Dynamic Failure Alert Banner Box */}
        {feedback && !feedback.isSuccess && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">
              {feedback.message}
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isPending}
          disabled={isPending || isSuccess}
        >
          Send reset link
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

export default ForgotPassword;
