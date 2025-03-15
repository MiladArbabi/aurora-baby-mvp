import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      setError('');
      onLogin();
    } catch (error) {
      console.error('Email login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        client_id: '680806226468-vs4o635ngej5t4slk6vjj9hon6qekdo5.apps.googleusercontent.com'
      });
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      setError('');
      onLogin();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/login/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Apple login failed');
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setError('');
      onLogin();
    } catch (error) {
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
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ display: 'block', margin: '10px 0' }}
          disabled={isLoading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ display: 'block', margin: '10px 0' }}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleAppleLogin}
          style={{ display: 'block', margin: '10px 0', background: '#000', color: '#fff' }}
          disabled={isLoading}
        >
          Sign in with Apple
        </button>
        <button
          onClick={handleGoogleLogin}
          style={{ display: 'block', margin: '10px 0', background: '#4285F4', color: '#fff' }}
          disabled={isLoading}
        >
          Sign in with Google
        </button>
      </div>
      <p>
        Don’t have an account?{' '}
        <button onClick={onSwitchToRegister} style={{ color: 'blue', textDecoration: 'underline' }} disabled={isLoading}>
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;