import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { login } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fix: Use a flag to prevent infinite loop
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use window.location instead of navigate to avoid the loop
      window.location.href = '/dashboard';
    }
  }, []); // Empty dependency array - runs only once

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(username, password);
      
      if (response.success) {
        // Clear any existing data first
        localStorage.clear();
        // Set new login data
        localStorage.setItem('token', response.access);
        localStorage.setItem('user', response.username);
        localStorage.setItem('userId', response.user_id);
        localStorage.setItem('userEmail', response.email || `${response.username}@example.com`);
        // Use window.location to avoid loop
        window.location.href = '/dashboard';
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            🏗️ Construction Tracking System
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Login to your account
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1976d2' }}>
                Create an account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;