  // app/src/screens/ProfileSetupScreen.tsx
  import React, { useState } from 'react';

  // Define props interface
  interface ProfileSetupProps {
    onComplete: () => void;
  }

  // Define types for file uploads (if needed)
  interface AvatarFile extends File {}

  const ProfileSetupScreen: React.FC<ProfileSetupProps> = ({ onComplete }) => {
    const [relationship, setRelationship] = useState<string>('Mother');
    const [parentName, setParentName] = useState<string>('');
    const [childName, setChildName] = useState<string>('');
    const [dateOfBirth, setDateOfBirth] = useState<string>('');
    const [parentAvatar, setParentAvatar] = useState<AvatarFile | null>(null);
    const [childAvatar, setChildAvatar] = useState<AvatarFile | null>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please sign in again.');
        return;
      }
      try {
        const response = await fetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            relationship,
            parentName,
            childName,
            dateOfBirth,
            parentAvatar: parentAvatar ? URL.createObjectURL(parentAvatar) : null,
            childAvatar: childAvatar ? URL.createObjectURL(childAvatar) : null,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Profile setup failed');
        }
        onComplete();
      } catch (error: any) {
        console.error('Profile setup error:', error);
        setError(error.message);
      }
    };

    const handleAvatarChange = (type: 'parent' | 'child', e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        if (type === 'parent') setParentAvatar(file);
        else if (type === 'child') setChildAvatar(file);
      } else {
        setError('Please select a valid image file.');
      }
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Set Up Your Profiles</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Parent Section */}
          <div
            style={{
              marginBottom: '20px',
              padding: '10px',
              background: '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1' }}>
              <h2>Parent Information</h2>
              <label>
                Your Relationship:
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  style={{ margin: '10px 0', display: 'block', width: '200px' }}
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Your Name"
                style={{ display: 'block', margin: '10px 0', width: '200px' }}
              />
            </div>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                data-testid="parent-avatar-input"
                onChange={(e) => handleAvatarChange('parent', e)}
                style={{ display: 'none' }}
              />
              <div
                data-testid="parent-avatar"
                title="Edit avatar"
                data-src={parentAvatar ? URL.createObjectURL(parentAvatar) : null}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundImage: parentAvatar ? `url(${URL.createObjectURL(parentAvatar)})` : 'none',
                  backgroundColor: parentAvatar ? 'transparent' : '#ccc',
                  backgroundSize: 'cover',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: '20px',
                  position: 'relative',
                }}
              >
                {!parentAvatar && <span>{parentName ? parentName[0].toUpperCase() : 'P'}</span>}
                <svg
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    fill: '#666',
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
            </label>
          </div>

          {/* Separator */}
          <hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />

          {/* Child Section */}
          <div
            style={{
              padding: '10px',
              background: '#e6f7ff',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1' }}>
              <h2>Child Information</h2>
              <input
        placeholder="Baby's Name"
        style={{ display: 'block', margin: '10px 0', width: '200px' }}
        type="text"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
      />
      <input
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        style={{ display: 'block', margin: '10px 0', width: '200px' }}
        data-testid="child-date-of-birth"
      />
            </div>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                data-testid="child-avatar-input"
                onChange={(e) => handleAvatarChange('child', e)}
                style={{ display: 'none' }}
              />
              <div
                data-testid="child-avatar"
                title="Edit avatar"
                data-src={childAvatar ? URL.createObjectURL(childAvatar) : null}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundImage: childAvatar ? `url(${URL.createObjectURL(childAvatar)})` : 'none',
                  backgroundColor: childAvatar ? 'transparent' : '#ccc',
                  backgroundSize: 'cover',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: '20px',
                  position: 'relative',
                }}
              >
                {!childAvatar && <span>{childName ? childName[0].toUpperCase() : 'C'}</span>}
                <svg
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    fill: '#666',
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
            </label>
          </div>

          <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
            Continue
          </button>
        </form>
      </div>
    );
  };

  export default ProfileSetupScreen;