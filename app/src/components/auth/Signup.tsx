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
      console.log('Generated token:', token);
      localStorage.setItem('token', token);
      setMessage(`Successfully registered ${email}. Proceeding to profile setup...`);
      setEmail('');
      setPassword('');
      setName('');
      onAuthSuccess(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5', // Light gray background for a clean look
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '500px', // Fixed height to control layout
        }}
      >
        {/* Top section for branding/message */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
            }}
          >
            Welcome to Aurora Baby
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Harmony, Care and Wonder
          </p>
        </div>

        {/* Bottom section for form */}
        <div style={{ marginTop: 'auto' }}>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
          {message ? (
            <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>
          ) : (
            <form onSubmit={handleSignup}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !email || !password || !name}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isLoading || !email || !password || !name ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: isLoading || !email || !password || !name ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;