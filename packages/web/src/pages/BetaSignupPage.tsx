import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BetaSignupForm } from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';

export function BetaSignupPage() {
  const { did } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (did) void navigate('/', { replace: true });
  }, [did, navigate]);

  return (
    <div className={styles.container}>
      <BetaSignupForm
        handle=""
        onBack={() => {
          void navigate('/login');
        }}
      />
    </div>
  );
}
