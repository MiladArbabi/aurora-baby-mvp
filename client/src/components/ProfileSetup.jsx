import React, { useState } from 'react';

function ProfileSetup({ onComplete }) {
  const [relationship, setRelationship] = useState('Mother');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');

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
        body: JSON.stringify({ relationship, parentName, childName, dateOfBirth }),
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
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#ccc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '20px',
            }}
          >
            <span>{parentName ? parentName[0].toUpperCase() : 'P'}</span>
          </div>
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
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#ccc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '20px',
            }}
          >
            <span>{childName ? childName[0].toUpperCase() : 'C'}</span>
          </div>
        </div>

        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
          Continue
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;