
import { useParams } from 'react-router-dom';
import VerifyEmail from '../forms/VerifiyEmail'; 
import InvalidToken from '../components/InvalidToken'; 
import { isValidToken } from '../utils/validateToken';

const VerifyEmailPage = () => {
 const { token } = useParams<{ token: string }>();
  
  if (!token) {
    return <InvalidToken message="No reset token provided." />;
  }
  if(!isValidToken(token)){
    return <InvalidToken message="Parameter temparing is detected❌❌" />
  }
  return <VerifyEmail token={token} />;
};

export default VerifyEmailPage;