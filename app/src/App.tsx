// src/App.tsx
import React, { useState, useEffect } from 'react';
import Signup from './components/auth/Signup';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ProfileSelectionScreen from './screens/ProfileSelectionScreen';
import HomeScreen from './screens/HomeScreen';

interface User {
  _id: string;
  name: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    process.env.REACT_APP_DEV_MODE === 'true' ? true : !!localStorage.getItem('token')
  );
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState<boolean>(
    process.env.REACT_APP_DEV_MODE === 'true' ? true : false
  );
  const [selectedChild, setSelectedChild] = useState<string | null>(
    process.env.REACT_APP_DEV_MODE === 'true' ? 'mock-child-id' : null
  );
  const [users, setUsers] = useState<User[]>([]); // Used in handleSubmit
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && selectedChild && process.env.REACT_APP_DEV_MODE !== 'true') {
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
    setSelectedChild(null);
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

  // In dev mode, always show HomeScreen
  if (process.env.REACT_APP_DEV_MODE === 'true') {
    return <HomeScreen />;
  }

  if (isAuthenticated && !selectedChild && isProfileSetupComplete) {
    return <ProfileSelectionScreen onSelect={handleProfileSelect} />;
  }

  if (isAuthenticated && !isProfileSetupComplete) {
    return <ProfileSetupScreen onComplete={handleProfileComplete} />;
  }

  if (!isAuthenticated) {
    return <Signup onAuthSuccess={handleAuthSuccess} />;
  }

  return <HomeScreen />;
};

export default App;