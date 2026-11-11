import { useParams } from 'react-router-dom';
import ResetPassword from '../forms/ResetPassword'; 
import InvalidToken from '../components/InvalidToken'; 
import { isValidToken } from '../utils/validateToken';

const RestoreAccountPage = () => {
  const { token } = useParams<{ token: string }>();
  if (!token) {
    return <InvalidToken message="No reset token provided." />;
  }

  if(!isValidToken(token)){
    return <InvalidToken message="Parameter temparing is detected❌❌" />
  }
  return <ResetPassword token={token} isReset={false} />;
};

export default RestoreAccountPage;