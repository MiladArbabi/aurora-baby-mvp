// src/screens/HomeScreen.tsx
import React from 'react';

const HomeScreen: React.FC = () => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        Home
      </h1>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        {/* Harmony Box */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '300px',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => alert('Harmony clicked!')} // Placeholder action
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#007bff', // Blue for Harmony
              marginBottom: '10px',
            }}
          >
            Harmony
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Find peace in your daily routines
          </p>
        </div>

        {/* Care Box */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '300px',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => alert('Care clicked!')} // Placeholder action
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#28a745', // Green for Care
              marginBottom: '10px',
            }}
          >
            Care
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Track your baby’s needs with ease
          </p>
        </div>

        {/* Wonder Box */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '300px',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => alert('Wonder clicked!')} // Placeholder action
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ff9800', // Orange for Wonder
              marginBottom: '10px',
            }}
          >
            Wonder
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Celebrate your baby’s milestones
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;