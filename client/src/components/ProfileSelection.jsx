import React, { useState, useEffect } from 'react';

function ProfileSelection({ onSelect }) {
  const [profiles, setProfiles] = useState({ parent: null, children: [] });
  const [selectedChild, setSelectedChild] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/profiles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch profiles');
        return response.json();
      })
      .then(data => {
        setProfiles(data);
        setError('');
      })
      .catch(error => {
        console.error('Fetch profiles error:', error);
        setError(error.message);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedChild) onSelect(selectedChild);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Select Your Child</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {profiles.parent && (
        <p>Parent: {profiles.parent.name} ({profiles.parent.relationship})</p>
      )}
      <form onSubmit={handleSubmit}>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          style={{ margin: '10px 0' }}
        >
          <option value="">Choose a child</option>
          {profiles.children.map(child => (
            <option key={child._id} value={child._id}>{child.name}</option>
          ))}
        </select>
        <button type="submit" disabled={!selectedChild}>Continue</button>
      </form>
    </div>
  );
}

export default ProfileSelection;