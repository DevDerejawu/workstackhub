import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
const InvalidToken = ({ message = 'Invalid or expired token' }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-foreground">Invalid Link</h2>
      <p className="text-muted-foreground">{message}</p>
      <Link to="/auth/login" className="text-sm text-primary hover:underline">
        Back to sign in
      </Link>
    </div>
  );
};

export default InvalidToken;