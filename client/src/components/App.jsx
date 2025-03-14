import React, { useState, useEffect } from 'react';

// Main app component to display title, user list, and add user form
function App() {
  const [users, setUsers] = useState([]); // State for fetched users
  const [name, setName] = useState('');   // State for form input

  // Fetch users from backend on component mount
  useEffect(() => {
    fetch('/api/users')
      .then(response => {
        if (!response.ok) {
          console.warn('Failed to fetch users:', response.status);
          return [];
        }
        return response.json();
      })
      .then(data => setUsers(data || [])) // Update state, default to empty array
      .catch(error => {
        console.error('Fetch error:', error);
        setUsers([]); // Set empty array on error
      });
  }, []); // Empty dependency array for one-time fetch

  // Handle form submission to add a new user
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setUsers([...users, data]); // Add new user to list
        setName('');                // Clear input
      })
      .catch(error => console.error('Add user error:', error));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Aurora Baby</h1> {/* Display app title */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)} // Update input state
          placeholder="Enter a name"
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Add User</button> {/* Submit form */}
      </form>
      <ul>
        {/* Render list of users */}
        {users.map(user => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;