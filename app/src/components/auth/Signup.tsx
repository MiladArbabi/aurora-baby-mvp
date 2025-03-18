// src/components/auth/Signup.tsx
import React, { useState } from 'react';

// Define props interface
interface SignupProps {
  onAuthSuccess: (isNewUser: boolean) => void;
}

const Signup: React.FC<SignupProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>(''); 
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Signup failed');
      }

      const { token } = responseData;
      console.log('Generated token:', token); // Log token for debugging
      localStorage.setItem('token', token);
      setMessage(`Successfully registered ${email}. Proceeding to profile setup...`);
      setEmail('');
      setPassword('');
      setName('');
      onAuthSuccess(true); // New user
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to Aurora Baby</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {!message && (
        <form onSubmit={handleSignup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ display: 'block', margin: '10px 0' }}
            disabled={isLoading}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            style={{ display: 'block', margin: '10px 0' }}
            disabled={isLoading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            style={{ display: 'block', margin: '10px 0' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !email || !password || !name}
            style={{ display: 'block', margin: '10px 0', background: '#007bff', color: '#fff' }}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Signup;