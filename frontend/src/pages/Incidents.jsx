import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, TextField, Button, MenuItem, Box, Card, CardContent, Alert } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { getIncidents, getProjects } from '../services/api';
import axios from 'axios';

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ title: '', incident_type: 'SAFETY', severity: 'MEDIUM', description: '', location: '', project: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const incidentsData = await getIncidents();
      const projectsData = await getProjects();
      setIncidents(incidentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('incident_type', formData.incident_type);
    submitData.append('severity', formData.severity);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('project', formData.project);
    if (imageFile) submitData.append('photo', imageFile);

    try {
      await axios.post('http://127.0.0.1:8000/api/incidents/', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitSuccess(true);
      setFormData({ title: '', incident_type: 'SAFETY', severity: 'MEDIUM', description: '', location: '', project: '' });
      setSelectedImage(null);
      setImageFile(null);
      fetchData();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to report incident');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return '#dc004e';
      case 'MEDIUM': return '#ed6c02';
      default: return '#1976d2';
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>⚠️ Safety Incidents & Hazards</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📸 Report New Incident</Typography>
            {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Incident reported successfully!</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Title" name="title" margin="normal" required value={formData.title} onChange={handleChange} />
              <TextField fullWidth select label="Incident Type" name="incident_type" margin="normal" value={formData.incident_type} onChange={handleChange}>
                <MenuItem value="SAFETY">Safety Hazard</MenuItem>
                <MenuItem value="QUALITY">Quality Issue</MenuItem>
                <MenuItem value="ACCIDENT">Accident</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
              <TextField fullWidth select label="Severity" name="severity" margin="normal" value={formData.severity} onChange={handleChange}>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </TextField>
              <TextField fullWidth select label="Project" name="project" margin="normal" required value={formData.project} onChange={handleChange}>
                {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Location" name="location" margin="normal" value={formData.location} onChange={handleChange} />
              <TextField fullWidth multiline rows={3} label="Description" name="description" margin="normal" required value={formData.description} onChange={handleChange} />
              <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ mt: 2 }}>
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {selectedImage && <Box sx={{ mt: 2 }}><img src={selectedImage} alt="Preview" style={{ width: 100, borderRadius: 4 }} /></Box>}
              <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>Report Incident</Button>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>Recent Incidents</Typography>
          {incidents.length === 0 ? (
            <Card><CardContent><Typography>No incidents reported yet.</Typography></CardContent></Card>
          ) : (
            incidents.map((incident) => (
              <Card key={incident.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">{incident.title}</Typography>
                    <Box sx={{ color: getSeverityColor(incident.severity), fontWeight: 'bold' }}>{incident.severity}</Box>
                  </Box>
                  <Typography color="textSecondary">📍 {incident.location || 'Unknown location'}</Typography>
                  <Typography variant="body2">{incident.description}</Typography>
                  {incident.photo && <Typography variant="caption" color="primary">📷 Photo attached</Typography>}
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Reported: {new Date(incident.reported_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Incidents;