import React, { useState } from 'react';

// Profile setup after registration
function ProfileSetup({ onComplete }) {
  const [relationship, setRelationship] = useState('Mother');
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ relationship, childName, dateOfBirth })
      });
      if (!response.ok) throw new Error('Profile setup failed');
      onComplete();
    } catch (error) {
      console.error('Profile setup error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Set Up Your Profiles</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Your Relationship:
          <select value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ margin: '10px 0' }}>
            <option value="Mother">Mother</option>
            <option value="Father">Father</option>
            <option value="Guardian">Guardian</option>
          </select>
        </label>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Child's Name"
          style={{ display: 'block', margin: '10px 0' }}
        />
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          style={{ display: 'block', margin: '10px 0' }}
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

export default ProfileSetup;