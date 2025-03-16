import React, { useState } from 'react';

/**
 * ProfileSetup component for configuring parent and child profiles with avatar uploads.
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback on successful submission
 */
function ProfileSetup({ onComplete }) {
  const [relationship, setRelationship] = useState('Mother');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentAvatar, setParentAvatar] = useState(null); // Avatar file or URL
  const [childAvatar, setChildAvatar] = useState(null); // Avatar file or URL
  const [error, setError] = useState('');

  /**
   * Handles form submission with profile data and avatar URLs.
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
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
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(error.message);
    }
  };

  /**
   * Handles avatar file selection.
   * @param {string} type - 'parent' or 'child'
   * @param {Event} e - File input change event
   */
  const handleAvatarChange = (type, e) => {
    const file = e.target.files[0];
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
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              data-testid="parent-avatar-input"
              onChange={(e) => handleAvatarChange('parent', e)}
              style={{ display: 'none' }}
            />
            <div
              data-testid="parent-avatar"
              data-src={parentAvatar ? URL.createObjectURL(parentAvatar) : null}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: parentAvatar ? `url(${URL.createObjectURL(parentAvatar)})` : '#ccc',
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '20px',
              }}
            >
              {!parentAvatar && <span>{parentName ? parentName[0].toUpperCase() : 'P'}</span>}
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
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Baby's Name"
              style={{ display: 'block', margin: '10px 0', width: '200px' }}
            />
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={{ display: 'block', margin: '10px 0', width: '200px' }}
            />
          </div>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              data-testid="child-avatar-input"
              onChange={(e) => handleAvatarChange('child', e)}
              style={{ display: 'none' }}
            />
            <div
              data-testid="child-avatar"
              data-src={childAvatar ? URL.createObjectURL(childAvatar) : null}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: childAvatar ? `url(${URL.createObjectURL(childAvatar)})` : '#ccc',
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '20px',
              }}
            >
              {!childAvatar && <span>{childName ? childName[0].toUpperCase() : 'C'}</span>}
            </div>
          </label>
        </div>

        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
          Continue
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;