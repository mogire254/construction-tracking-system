import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Paper, TextField, Button, MenuItem,
  Box, Card, CardContent, Alert, CircularProgress, FormControl,
  InputLabel, Select, Chip, IconButton, Tooltip, Snackbar
} from '@mui/material';
import {
  PhotoCamera, Send, Close, Warning, ReportProblem,
  CheckCircle, Cancel, Refresh
} from '@mui/icons-material';
import axios from 'axios';

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    incident_type: 'SAFETY',
    severity: 'MEDIUM',
    description: '',
    location: '',
    project: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch projects and incidents on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching projects...');
      // Fetch projects from API
      const projectsRes = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Projects fetched:', projectsRes.data);
      setProjects(projectsRes.data);
      
      // Fetch incidents from API
      const incidentsRes = await axios.get('http://127.0.0.1:8000/api/incidents/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(incidentsRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Photo too large! Max 5MB.', severity: 'error' });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Please upload an image file.', severity: 'error' });
        return;
      }
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate project selection
    if (!formData.project) {
      setSnackbar({ open: true, message: 'Please select a project', severity: 'error' });
      setSubmitting(false);
      return;
    }
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('incident_type', formData.incident_type);
    submitData.append('severity', formData.severity);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('project', formData.project);
    if (imageFile) {
      submitData.append('photo', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/incidents/', submitData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubmitSuccess(true);
      setFormData({
        title: '',
        incident_type: 'SAFETY',
        severity: 'MEDIUM',
        description: '',
        location: '',
        project: ''
      });
      setSelectedImage(null);
      setImageFile(null);
      fetchData(); // Refresh the list
      
      setSnackbar({ open: true, message: 'Incident reported successfully!', severity: 'success' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error reporting incident:', error);
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to report incident', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#dc004e';
      case 'HIGH': return '#f44336';
      case 'MEDIUM': return '#ed6c02';
      case 'LOW': return '#2e7d32';
      default: return '#1976d2';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'CRITICAL': return <Cancel sx={{ fontSize: 16 }} />;
      case 'HIGH': return <Warning sx={{ fontSize: 16 }} />;
      case 'MEDIUM': return <ReportProblem sx={{ fontSize: 16 }} />;
      default: return <CheckCircle sx={{ fontSize: 16 }} />;
    }
  };

  const getIncidentTypeLabel = (type) => {
    switch(type) {
      case 'SAFETY': return '⚠️ Safety Hazard';
      case 'QUALITY': return '🔧 Quality Issue';
      case 'ACCIDENT': return '🚑 Accident';
      default: return '📋 Other';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            ⚠️ Safety Incidents & Hazards
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      <Grid container spacing={2}>
        {/* Report Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoCamera color="primary" /> Report New Incident
            </Typography>
            
            {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Incident reported successfully!</Alert>}
            
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <TextField
                fullWidth
                label="Title *"
                name="title"
                margin="dense"
                size="small"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Broken railing on 2nd floor"
              />
              
              {/* Incident Type */}
              <TextField
                fullWidth
                select
                label="Incident Type *"
                name="incident_type"
                margin="dense"
                size="small"
                required
                value={formData.incident_type}
                onChange={handleChange}
              >
                <MenuItem value="SAFETY">⚠️ Safety Hazard</MenuItem>
                <MenuItem value="QUALITY">🔧 Quality Issue</MenuItem>
                <MenuItem value="ACCIDENT">🚑 Accident</MenuItem>
                <MenuItem value="OTHER">📋 Other</MenuItem>
              </TextField>
              
              {/* Severity */}
              <TextField
                fullWidth
                select
                label="Severity *"
                name="severity"
                margin="dense"
                size="small"
                required
                value={formData.severity}
                onChange={handleChange}
              >
                <MenuItem value="LOW">🟢 Low</MenuItem>
                <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                <MenuItem value="HIGH">🟠 High</MenuItem>
                <MenuItem value="CRITICAL">🔴 Critical</MenuItem>
              </TextField>
              
              {/* Project Dropdown - FIXED */}
              <FormControl fullWidth margin="dense" size="small" required>
                <InputLabel>Project *</InputLabel>
                <Select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  label="Project *"
                >
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects.length === 0 ? (
                    <MenuItem disabled>No projects available. Create a project first.</MenuItem>
                  ) : (
                    projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name} {project.location ? `- ${project.location}` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              {/* Location */}
              <TextField
                fullWidth
                label="Location"
                name="location"
                margin="dense"
                size="small"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Building A, Floor 2"
              />
              
              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description *"
                name="description"
                margin="dense"
                size="small"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what happened..."
              />
              
              {/* Photo Upload */}
              <Box sx={{ mt: 1.5, mb: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-photo"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="upload-photo">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    size="small"
                  >
                    Upload Photo
                  </Button>
                </label>
                {imageFile && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                    {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                )}
              </Box>
              
              {/* Image Preview */}
              {selectedImage && (
                <Box sx={{ mt: 1, position: 'relative' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }} />
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'white' }}
                    onClick={() => {
                      setSelectedImage(null);
                      setImageFile(null);
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Report Incident'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Incidents List */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Recent Incidents ({incidents.length})
          </Typography>
          
          {incidents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <ReportProblem sx={{ fontSize: 48, color: '#ccc' }} />
              <Typography color="textSecondary">No incidents reported yet.</Typography>
              <Typography variant="caption" color="textSecondary">Be the first to report a safety hazard.</Typography>
            </Paper>
          ) : (
            incidents.map((incident) => (
              <Card key={incident.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {incident.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={0.5}>
                        <Chip 
                          label={getIncidentTypeLabel(incident.incident_type)} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          icon={getSeverityIcon(incident.severity)}
                          label={incident.severity} 
                          size="small" 
                          sx={{ 
                            bgcolor: getSeverityColor(incident.severity), 
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                        />
                        <Chip 
                          label={incident.status || 'REPORTED'} 
                          size="small" 
                          color={incident.status === 'RESOLVED' ? 'success' : 'warning'}
                        />
                      </Box>
                    </Box>
                    {incident.photo && (
                      <Tooltip title="Photo attached">
                        <PhotoCamera color="action" sx={{ fontSize: 20 }} />
                      </Tooltip>
                    )}
                  </Box>
                  
                  {incident.location && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      📍 {incident.location}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {incident.description}
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Reported: {new Date(incident.reported_at).toLocaleDateString()}
                  </Typography>
                  
                  {incident.resolution_notes && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                      <Typography variant="caption" color="success.main">
                        ✅ Resolved: {incident.resolution_notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Incidents;