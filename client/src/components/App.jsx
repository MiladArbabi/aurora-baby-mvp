import React, { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import ProfileSetup from './ProfileSetup';
import ProfileSelection from './ProfileSelection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // Check if user is logged in
  const [isNewUser, setIsNewUser] = useState(false); // Track if user just registered
  const [isProfileSetup, setIsProfileSetup] = useState(false); // Track profile setup completion
  const [selectedChild, setSelectedChild] = useState(null); // Selected child ID
  const [users, setUsers] = useState([]); // List of users
  const [name, setName] = useState(''); // Input for new user name

  // Fetch users after authentication and profile selection (for returning users)
  useEffect(() => {
    if (isAuthenticated && selectedChild) {
      fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(response => {
          if (!response.ok) {
            console.warn('Failed to fetch users:', response.status);
            return [];
          }
          return response.json();
        })
        .then(data => setUsers(data || []))
        .catch(error => {
          console.error('Error fetching users:', error);
          setUsers([]);
        });
    }
  }, [isAuthenticated, selectedChild]);

  const handleRegister = () => {
    setIsAuthenticated(true);
    setIsNewUser(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsNewUser(false);
  };

  const handleProfileComplete = () => {
    setIsProfileSetup(true);
  };

  const handleProfileSelect = (childId) => {
    setSelectedChild(childId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5001/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to add user: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('New user data:', data); // Debug POST response
        setUsers(prevUsers => [...prevUsers, data]); // Ensure full object is added
        setName('');
      })
      .catch(error => console.error('Error adding user:', error));
  };

  if (!isAuthenticated) {
    return isNewUser ? (
      <Register onRegister={handleRegister} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setIsNewUser(true)} />
    );
  }

  if (isNewUser && !isProfileSetup) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (!selectedChild) {
    return <ProfileSelection onSelect={handleProfileSelect} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Aurora Baby</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name"
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Add User</button>
      </form>
      {/* Render list of users */}
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;