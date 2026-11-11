import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}


// simulating geting a user info from backend
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Math.random() >= 0.5;
    if (token) {
      setUser({ id: '1', email: 'demo@example.com', firstName: 'Demo', lastName: 'User' });
    }
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}