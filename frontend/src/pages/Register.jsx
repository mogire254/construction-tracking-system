import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert, CircularProgress, Grid } from '@mui/material';
import { register } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      if (response.success) {
        setSuccess('Account created successfully! Please login with your credentials.');
        // Clear form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          first_name: '',
          last_name: '',
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            🏗️ Construction Tracking System
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Create Your Account
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <form onSubmit={handleRegister}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username *"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Minimum 3 characters"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Optional"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password *"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Minimum 4 characters"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password *"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
            </Grid>
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1976d2' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;