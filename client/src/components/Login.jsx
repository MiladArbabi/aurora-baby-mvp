import React, { useState } from 'react';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setError(''); // Clear any previous error
      onLogin(); // Call the login success handler
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome Back to Aurora Baby</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ display: 'block', margin: '10px 0' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ display: 'block', margin: '10px 0' }}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account?{' '}
        <button onClick={onSwitchToRegister} style={{ color: 'blue', textDecoration: 'underline' }}>
          Register
        </button>
      </p>
    </div>
  );
}

export default Login;