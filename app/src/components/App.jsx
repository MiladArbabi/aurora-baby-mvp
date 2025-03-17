// client/src/components/App.jsx
import React, { useState, useEffect } from 'react';
import Signup from './Signup';
import ProfileSetup from './ProfileSetup';
import ProfileSelection from './ProfileSelection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (isAuthenticated && selectedChild) {
      fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
        .then((response) => {
          if (!response.ok) {
            console.warn('Failed to fetch users:', response.status);
            return [];
          }
          return response.json();
        })
        .then((data) => setUsers(data || []))
        .catch((error) => {
          console.error('Error fetching users:', error);
          setUsers([]);
        });
    }
  }, [isAuthenticated, selectedChild]);

  const handleAuthSuccess = (isNewUser) => {
    setIsAuthenticated(true);
    setIsProfileSetupComplete(!isNewUser);
  };

  const handleProfileComplete = () => {
    setIsProfileSetupComplete(true);
    setSelectedChild('default-child-id'); // Replace with actual logic
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to add user: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('New user data:', data);
        setUsers((prevUsers) => [...prevUsers, data]);
        setName('');
      })
      .catch((error) => console.error('Error adding user:', error));
  };

  if (isAuthenticated && !selectedChild && isProfileSetupComplete) {
    return <ProfileSelection onSelect={handleProfileSelect} />;
  }

  if (isAuthenticated && !isProfileSetupComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (!isAuthenticated) {
    return <Signup onAuthSuccess={handleAuthSuccess} />;
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
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  ); 
}

export default App;