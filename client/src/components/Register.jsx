import React, { useState } from 'react';

function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setError(''); // Clear any previous error
      onRegister(); // Call the registration success handler
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to Aurora Baby!</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          style={{ display: 'block', margin: '10px 0' }}
        />
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
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} style={{ color: 'blue', textDecoration: 'underline' }}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;