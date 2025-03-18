// app/src/components/auth/Signup.tsx
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../firebase';

// Define props interface
interface SignupProps {
  onAuthSuccess: (isNewUser: boolean) => void;
}

const Signup: React.FC<SignupProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSentMessage, setEmailSentMessage] = useState<string>('');

  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const emailForSignIn = window.localStorage.getItem('emailForSignIn');
        if (emailForSignIn) {
          try {
            const userCredential = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
            window.localStorage.removeItem('emailForSignIn');
            onAuthSuccess(true); // New user
          } catch (error: any) {
            console.error('Email link sign-in error:', error);
            setError(error.message);
          }
        }
      }
    };
    completeSignIn();
  }, [onAuthSuccess]);

  const handleEmailLinkAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSentMessage(`Please follow the instructions in the email sent to ${email} to complete registration`);
      setEmail('');
      setError('');
    } catch (error: any) {
      console.error('Email link send error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        client_id: '680806226468-vs4o635ngej5t4slk6vjj9hon6qekdo5.apps.googleusercontent.com',
      });
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      setError('');
      onAuthSuccess(true);
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/login/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Apple login failed');
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setError('');
      onAuthSuccess(true);
    } catch (error: any) {
      console.error('Apple login error:', error);
      setError('Apple Sign-In unavailable without membership');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to Aurora Baby</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {emailSentMessage ? (
        <p style={{ color: 'green' }}>{emailSentMessage}</p>
      ) : (
        <>
          <form onSubmit={handleEmailLinkAuth}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              style={{ display: 'block', margin: '10px 0' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !email}
              style={{ display: 'block', margin: '10px 0', background: '#007bff', color: '#fff' }}
            >
              {isLoading ? 'Sending...' : 'Sign Up with Email'}
            </button>
          </form>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleGoogleLogin}
              style={{ display: 'block', margin: '10px 0', background: '#4285F4', color: '#fff' }}
              disabled={isLoading}
            >
              Sign in with Google
            </button>
            <button
              onClick={handleAppleLogin}
              style={{ display: 'block', margin: '10px 0', background: '#000', color: '#fff' }}
              disabled={isLoading}
            >
              Sign in with Apple
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Signup;