import React, { useState, useEffect } from 'react';

// Define interfaces for profiles
interface Profile {
  name: string;
  relationship?: string; // Optional for parent profile
  _id?: string; // Optional for child profiles
}

interface Profiles {
  parent: Profile | null;
  children: Profile[];
}

// Define props interface
interface ProfileSelectionProps {
  onSelect: (childId: string) => void;
}

const ProfileSelectionScreen: React.FC<ProfileSelectionProps> = ({ onSelect }) => {
  const [profiles, setProfiles] = useState<Profiles>({ parent: null, children: [] });
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please sign in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5001/api/profiles', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(response.status === 401 ? 'Unauthorized access' : 'Failed to fetch profiles');
        }
        const data: Profiles = await response.json();
        setProfiles(data);
        setError('');
      } catch (error: any) {
        console.error('Fetch profiles error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedChild) {
      setError('Please select a child to continue.');
      return;
    }
    onSelect(selectedChild);
  };

  if (isLoading) {
    return <p>Loading profiles...</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Select Your Child</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {profiles.parent && (
        <p>
          Parent: {profiles.parent.name} ({profiles.parent.relationship})
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          style={{ margin: '10px 0' }}
        >
          <option value="">Choose a child</option>
          {profiles.children && profiles.children.length > 0 ? (
            profiles.children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name}
              </option>
            ))
          ) : (
            <option disabled>No children available</option>
          )}
        </select>
        <button type="submit" disabled={!selectedChild}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default ProfileSelectionScreen;