import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Dashboard, Build, Warning, Logout, People } from '@mui/icons-material';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear ALL localStorage items
    localStorage.clear();
    // Use window.location to force a full page reload and clear state
    window.location.href = '/login';
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          🏗️ Construction Tracking System
        </Typography>
        
        <Button color="inherit" onClick={() => navigate('/dashboard')}>
          <Dashboard sx={{ mr: 1 }} /> Dashboard
        </Button>
        
        <Button color="inherit" onClick={() => navigate('/projects')}>
          Projects
        </Button>
        
        <Button color="inherit" onClick={() => navigate('/incidents')}>
          <Warning sx={{ mr: 1 }} /> Incidents
        </Button>
        
        <Button color="inherit" onClick={() => navigate('/materials')}>
          <Build sx={{ mr: 1 }} /> Materials
        </Button>
        
        <Button color="inherit" onClick={() => navigate('/workers')}>
          <People sx={{ mr: 1 }} /> Workers
        </Button>
        
        <Button color="inherit" onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} /> Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;