import React from 'react';
import { useNavigate } from 'react-router-dom'; // If you're using React Router

const NotFound = () => {
  const navigate = useNavigate(); // Hook from React Router for navigation

  const handleGoHome = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.message}>Oops! The page you're looking for doesn't exist.</p>
      <button style={styles.button} onClick={handleGoHome}>
        Go Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  title: {
    fontSize: '96px',
    fontWeight: 'bold',
    color: '#343a40',
  },
  message: {
    fontSize: '20px',
    color: '#6c757d',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default NotFound;