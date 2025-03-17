/**
 * ProfileSelectionScreen component for authenticated users to select a child profile.
 * Fetches profiles from API and allows selection for app navigation.
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Callback triggered with selected child ID
 * @returns {JSX.Element} Profile selection form UI
 */
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

  /**
   * Fetches user profiles on mount, requiring a valid token.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please sign in.');
      return;
    }

    fetch('http://localhost:5001/api/profiles', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 ? 'Unauthorized access' : 'Failed to fetch profiles');
        }
        return response.json();
      })
      .then((data: Profiles) => {
        setProfiles(data);
        setError('');
      })
      .catch((error: Error) => {
        console.error('Fetch profiles error:', error);
        setError(error.message);
      });
  }, []);

  /**
   * Handles form submission to select a child and trigger navigation.
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedChild) {
      setError('Please select a child to continue.');
      return;
    }
    onSelect(selectedChild);
  };

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
          {profiles.children.map((child) => (
            <option key={child._id} value={child._id}>
              {child.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selectedChild}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default ProfileSelectionScreen;