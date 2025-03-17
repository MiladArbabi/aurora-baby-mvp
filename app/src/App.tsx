// client/src/components/App.tsx
import React, { useState, useEffect } from 'react';
import Signup from './components/auth/Signup';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ProfileSelectionScreen from './screens/ProfileSelectionScreen';

// Define interfaces for User and Child (adjust fields based on your API response)
interface User {
  _id: string;
  name: string;
  // Add other fields as needed from your API
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState<boolean>(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>('');

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
        .then((data: User[]) => setUsers(data || []))
        .catch((error) => {
          console.error('Error fetching users:', error);
          setUsers([]);
        });
    }
  }, [isAuthenticated, selectedChild]);

  const handleAuthSuccess = (isNewUser: boolean): void => {
    setIsAuthenticated(true);
    setIsProfileSetupComplete(!isNewUser);
  };

  const handleProfileComplete = (): void => {
    setIsProfileSetupComplete(true);
    setSelectedChild('default-child-id'); // Replace with actual logic
  };

  const handleProfileSelect = (childId: string): void => {
    setSelectedChild(childId);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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
      .then((data: User) => {
        console.log('New user data:', data);
        setUsers((prevUsers) => [...prevUsers, data]);
        setName('');
      })
      .catch((error) => console.error('Error adding user:', error));
  };

  if (isAuthenticated && !selectedChild && isProfileSetupComplete) {
    return <ProfileSelectionScreen onSelect={handleProfileSelect} />;
  }

  if (isAuthenticated && !isProfileSetupComplete) {
    return <ProfileSetupScreen onComplete={handleProfileComplete} />;
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
};

export default App;