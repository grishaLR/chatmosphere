import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { did, authPhase } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (did) void navigate('/', { replace: true });
  }, [did, navigate]);

  // init() is checking for existing session — typically <100ms.
  // Show the login form immediately (disabled state handled by LoginForm).
  // Don't show ConnectingScreen here — it's only for post-OAuth redirect.
  if (authPhase === 'initializing') {
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}
