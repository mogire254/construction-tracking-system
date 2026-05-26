import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, CircularProgress, Avatar, Chip
} from '@mui/material';
import {
  People, Add, Close, Refresh, CheckCircle, Cancel,
  Engineering, Construction, Leaderboard, Today, Save
} from '@mui/icons-material';
import axios from 'axios';

function Workers() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Worker count data structure
  const [workerCounts, setWorkerCounts] = useState({
    // Skilled Workers
    skilled: {
      plumber: 0,
      electrician: 0,
      steel_fixer: 0,
      welder: 0,
      carpenter: 0,
      mason: 0,
      painter: 0,
    },
    // Unskilled Workers
    unskilled: {
      laborer: 0,
      helper: 0,
    },
    // Plant Operators
    plant: {
      crane_operator: 0,
      excavator_operator: 0,
      mixer_operator: 0,
    },
    // Professional Team
    professional: {
      engineer: 0,
      architect: 0,
      surveyor: 0,
      supervisor: 0,
      project_manager: 0,
    }
  });

  // Saved attendance records
  const [savedAttendance, setSavedAttendance] = useState({});

  useEffect(() => {
    fetchProjects();
    loadSavedAttendance();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAttendance = () => {
    const saved = localStorage.getItem(`attendance_${selectedDate}_${selectedProject}`);
    if (saved) {
      setWorkerCounts(JSON.parse(saved));
      setSavedAttendance(JSON.parse(saved));
    } else {
      // Reset counts
      resetCounts();
    }
  };

  const resetCounts = () => {
    setWorkerCounts({
      skilled: {
        plumber: 0,
        electrician: 0,
        steel_fixer: 0,
        welder: 0,
        carpenter: 0,
        mason: 0,
        painter: 0,
      },
      unskilled: {
        laborer: 0,
        helper: 0,
      },
      plant: {
        crane_operator: 0,
        excavator_operator: 0,
        mixer_operator: 0,
      },
      professional: {
        engineer: 0,
        architect: 0,
        surveyor: 0,
        supervisor: 0,
        project_manager: 0,
      }
    });
  };

  useEffect(() => {
    if (selectedProject && selectedDate) {
      loadSavedAttendance();
    }
  }, [selectedDate, selectedProject]);

  const handleCountChange = (category, trade, increment) => {
    setWorkerCounts(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [trade]: Math.max(0, (prev[category][trade] || 0) + increment)
      }
    }));
  };

  const handleManualInput = (category, trade, value) => {
    const numValue = parseInt(value) || 0;
    setWorkerCounts(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [trade]: Math.max(0, numValue)
      }
    }));
  };

  const saveAttendance = () => {
    setSaving(true);
    localStorage.setItem(`attendance_${selectedDate}_${selectedProject}`, JSON.stringify(workerCounts));
    setSavedAttendance(workerCounts);
    setSnackbar({ open: true, message: 'Attendance saved successfully!', severity: 'success' });
    setSaving(false);
  };

  const getTotalWorkers = () => {
    let total = 0;
    Object.values(workerCounts.skilled).forEach(v => total += v);
    Object.values(workerCounts.unskilled).forEach(v => total += v);
    Object.values(workerCounts.plant).forEach(v => total += v);
    Object.values(workerCounts.professional).forEach(v => total += v);
    return total;
  };

  const getCategoryTotal = (category) => {
    let total = 0;
    Object.values(workerCounts[category]).forEach(v => total += v);
    return total;
  };

  const TradeInput = ({ label, category, trade, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
      <Typography variant="body2" sx={{ width: '40%' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => handleCountChange(category, trade, -1)} sx={{ bgcolor: '#f0f0f0' }}>
          -
        </IconButton>
        <TextField
          size="small"
          value={value}
          onChange={(e) => handleManualInput(category, trade, e.target.value)}
          sx={{ width: 70, '& input': { textAlign: 'center' } }}
          inputProps={{ min: 0, type: 'number' }}
        />
        <IconButton size="small" onClick={() => handleCountChange(category, trade, 1)} sx={{ bgcolor: '#f0f0f0' }}>
          +
        </IconButton>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <People sx={{ fontSize: 28, color: '#1a237e' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Daily Worker Attendance
            </Typography>
            <IconButton onClick={() => { fetchProjects(); loadSavedAttendance(); }}>
              <Refresh />
            </IconButton>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Project"
              >
                {projects.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveAttendance}
              disabled={saving}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              Save Attendance
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary Card */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="textSecondary">Total Workers Today</Typography>
            <Typography variant="h3">{getTotalWorkers()}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="textSecondary">Skilled Workers</Typography>
            <Typography variant="h4" color="primary">{getCategoryTotal('skilled')}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="textSecondary">Unskilled Workers</Typography>
            <Typography variant="h4" color="warning.main">{getCategoryTotal('unskilled')}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="textSecondary">Plant Operators</Typography>
            <Typography variant="h4" color="success.main">{getCategoryTotal('plant')}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="textSecondary">Professional Team</Typography>
            <Typography variant="h4" color="info.main">{getCategoryTotal('professional')}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Workers Categories */}
      <Grid container spacing={2}>
        {/* Skilled Workers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Engineering sx={{ color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🔧 Skilled Workers</Typography>
                <Chip label={getCategoryTotal('skilled')} size="small" color="primary" />
              </Box>
              <TradeInput label="Plumbers" category="skilled" trade="plumber" value={workerCounts.skilled.plumber} />
              <TradeInput label="Electricians" category="skilled" trade="electrician" value={workerCounts.skilled.electrician} />
              <TradeInput label="Steel Fixers" category="skilled" trade="steel_fixer" value={workerCounts.skilled.steel_fixer} />
              <TradeInput label="Welders" category="skilled" trade="welder" value={workerCounts.skilled.welder} />
              <TradeInput label="Carpenters" category="skilled" trade="carpenter" value={workerCounts.skilled.carpenter} />
              <TradeInput label="Masons" category="skilled" trade="mason" value={workerCounts.skilled.mason} />
              <TradeInput label="Painters" category="skilled" trade="painter" value={workerCounts.skilled.painter} />
            </CardContent>
          </Card>
        </Grid>

        {/* Unskilled Workers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Construction sx={{ color: '#ed6c02' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>👷 Unskilled Workers</Typography>
                <Chip label={getCategoryTotal('unskilled')} size="small" color="warning" />
              </Box>
              <TradeInput label="Laborers" category="unskilled" trade="laborer" value={workerCounts.unskilled.laborer} />
              <TradeInput label="Helpers" category="unskilled" trade="helper" value={workerCounts.unskilled.helper} />
            </CardContent>
          </Card>
        </Grid>

        {/* Plant Operators */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Leaderboard sx={{ color: '#2e7d32' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🏗️ Plant Operators</Typography>
                <Chip label={getCategoryTotal('plant')} size="small" color="success" />
              </Box>
              <TradeInput label="Crane Operators" category="plant" trade="crane_operator" value={workerCounts.plant.crane_operator} />
              <TradeInput label="Excavator Operators" category="plant" trade="excavator_operator" value={workerCounts.plant.excavator_operator} />
              <TradeInput label="Mixer Operators" category="plant" trade="mixer_operator" value={workerCounts.plant.mixer_operator} />
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Team */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Leaderboard sx={{ color: '#9c27b0' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>👔 Professional Team</Typography>
                <Chip label={getCategoryTotal('professional')} size="small" color="secondary" />
              </Box>
              <TradeInput label="Engineers" category="professional" trade="engineer" value={workerCounts.professional.engineer} />
              <TradeInput label="Architects" category="professional" trade="architect" value={workerCounts.professional.architect} />
              <TradeInput label="Surveyors" category="professional" trade="surveyor" value={workerCounts.professional.surveyor} />
              <TradeInput label="Supervisors" category="professional" trade="supervisor" value={workerCounts.professional.supervisor} />
              <TradeInput label="Project Managers" category="professional" trade="project_manager" value={workerCounts.professional.project_manager} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Confirmation */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Workers;