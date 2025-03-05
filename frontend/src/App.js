import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [babyName, setBabyName] = useState('');
  const [babyAge, setBabyAge] = useState('');
  const [token, setToken] = useState(null);
  const [activity, setActivity] = useState('');
  const [careType, setCareType] = useState('');
  const [careDetails, setCareDetails] = useState('');
  const [progress, setProgress] = useState(null);

  // Onboard a baby
  const handleOnboard = async () => {
    try {
      const res = await axios.post('http://localhost:5000/onboard', { babyName, babyAge });
      setToken(res.data.token);
      alert('Baby onboarded! Token received.');
    } catch (err) {
      alert('Error onboarding: ' + (err.response?.data.error || err.message));
    }
  };

  // Log an activity
  const handleActivity = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/journey/activity',
        { activity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Activity logged: ${res.data.activity}, Star Fragments: ${res.data.starFragments}`);
    } catch (err) {
      alert('Error logging activity: ' + (err.response?.data.error || err.message));
    }
  };

  // Log a care entry
  const handleCareLog = async () => {
    try {
      const timestamp = new Date().toISOString();
      const res = await axios.post(
        'http://localhost:5000/care/log',
        { type: careType, details: careDetails, timestamp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Care logged: ${res.data.careEntry.type}, Star Fragments: ${res.data.starFragments}`);
    } catch (err) {
      alert('Error logging care: ' + (err.response?.data.error || err.message));
    }
  };

  // Get progress
  const handleProgress = async () => {
    try {
      const res = await axios.get('http://localhost:5000/journey/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(res.data);
    } catch (err) {
      alert('Error fetching progress: ' + (err.response?.data.error || err.message));
    }
  };

  return (
    <div className="App">
      <h1>Aurora Baby MVP</h1>

      {!token ? (
        <div>
          <h2>Onboard a Baby</h2>
          <input
            type="text"
            placeholder="Baby Name"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Baby Age"
            value={babyAge}
            onChange={(e) => setBabyAge(e.target.value)}
          />
          <button onClick={handleOnboard}>Onboard</button>
        </div>
      ) : (
        <div>
          <h2>Journey Mode</h2>
          <input
            type="text"
            placeholder="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          <button onClick={handleActivity}>Log Activity</button>

          <h2>Care Tracking</h2>
          <input
            type="text"
            placeholder="Care Type (e.g., feeding)"
            value={careType}
            onChange={(e) => setCareType(e.target.value)}
          />
          <input
            type="text"
            placeholder="Details"
            value={careDetails}
            onChange={(e) => setCareDetails(e.target.value)}
          />
          <button onClick={handleCareLog}>Log Care</button>

          <button onClick={handleProgress}>Get Progress</button>
          {progress && (
            <div>
              <p>Star Fragments: {progress.starFragments}</p>
              <p>Activities: {progress.activities.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;