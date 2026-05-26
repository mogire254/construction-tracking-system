import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  LinearProgress, Chip, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Snackbar, Alert,
  Paper, InputAdornment, Tooltip, Tab, Tabs, FormControl, InputLabel, Select,
  CircularProgress, Divider
} from '@mui/material';
import {
  LocationOn, AttachMoney, CalendarToday, Edit, Visibility,
  Close, Save, Add, Search, FilterList, Refresh, Image,
  CheckCircle, Pending, TrendingUp, PhotoCamera, Assignment
} from '@mui/icons-material';
import { getProjects } from '../services/api';
import axios from 'axios';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workLogs, setWorkLogs] = useState({});
  const [loadingWorkLogs, setLoadingWorkLogs] = useState(false);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [workLogDialogOpen, setWorkLogDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [updateProgress, setUpdateProgress] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  
  // Work Log states
  const [workLogData, setWorkLogData] = useState({
    work_type: 'DONE',
    title: '',
    description: '',
    photo: null
  });
  const [workLogImagePreview, setWorkLogImagePreview] = useState(null);
  const [submittingWorkLog, setSubmittingWorkLog] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, statusFilter, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({ open: true, message: 'Failed to load projects', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogs = async (projectId) => {
    setLoadingWorkLogs(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/work-logs/?project=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkLogs(prev => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error('Error fetching work logs:', error);
    } finally {
      setLoadingWorkLogs(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  };

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    setSelectedTab(0);
    setViewDialogOpen(true);
    await fetchWorkLogs(project.id);
  };

  const handleUpdateProgress = (project) => {
    setSelectedProject(project);
    setUpdateProgress(project.progress_percentage || 0);
    setUpdateStatus(project.status || 'PLANNING');
    setUpdateNotes('');
    setUpdateDialogOpen(true);
  };

  const handleSaveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://127.0.0.1:8000/api/projects/${selectedProject.id}/`,
        {
          progress_percentage: parseInt(updateProgress),
          status: updateStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({ open: true, message: 'Progress updated successfully!', severity: 'success' });
      setUpdateDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error updating progress:', error);
      setSnackbar({ open: true, message: 'Failed to update progress', severity: 'error' });
    }
  };

  const handleWorkLogChange = (e) => {
    setWorkLogData({ ...workLogData, [e.target.name]: e.target.value });
  };

  const handleWorkLogImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWorkLogData({ ...workLogData, photo: file });
      setWorkLogImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddWorkLog = async () => {
    if (!workLogData.title || !workLogData.description) {
      setSnackbar({ open: true, message: 'Please fill title and description', severity: 'warning' });
      return;
    }
    
    setSubmittingWorkLog(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('project', selectedProject.id);
      formData.append('work_type', workLogData.work_type);
      formData.append('title', workLogData.title);
      formData.append('description', workLogData.description);
      if (workLogData.photo) {
        formData.append('photo', workLogData.photo);
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/work-logs/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state with new work log
      setWorkLogs(prev => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), response.data]
      }));
      
      setSnackbar({ open: true, message: 'Work update added!', severity: 'success' });
      setWorkLogDialogOpen(false);
      setWorkLogData({ work_type: 'DONE', title: '', description: '', photo: null });
      setWorkLogImagePreview(null);
    } catch (error) {
      console.error('Error adding work log:', error);
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to add work update', severity: 'error' });
    } finally {
      setSubmittingWorkLog(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'PLANNING': return 'warning';
      case 'ON_HOLD': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'IN_PROGRESS': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'COMPLETED': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'PLANNING': return <Pending sx={{ fontSize: 16 }} />;
      default: return <Pending sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header with Tools */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              📋 Construction Projects
            </Typography>
            <Tooltip title="Refresh projects">
              <IconButton onClick={fetchProjects} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
            
            <TextField
              size="small"
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 130 }}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PLANNING">Planning</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Projects Grid */}
      <Grid container spacing={2}>
        {filteredProjects.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No projects found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search or filter
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ 
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Project Photo */}
                {project.display_photo_url && (
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={project.display_photo_url} 
                      alt={project.name}
                      style={{ 
                        width: '100%', 
                        height: 180, 
                        objectFit: 'cover',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8
                      }}
                    />
                    {project.status === 'COMPLETED' && (
                      <Chip 
                        icon={<CheckCircle />}
                        label="COMPLETED"
                        color="success"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* No Photo Placeholder */}
                {!project.display_photo_url && (
                  <Box sx={{ 
                    height: 120, 
                    bgcolor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}>
                    <Image sx={{ fontSize: 50, color: '#ccc' }} />
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {project.name}
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(project.status)}
                      label={project.status?.replace('_', ' ') || 'Planning'}
                      size="small"
                      color={getStatusColor(project.status)}
                      sx={{ fontSize: '0.7rem', height: 24 }}
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="textSecondary">
                      {project.location || 'Location not specified'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5, fontSize: '0.75rem' }}>
                    {project.description?.substring(0, 80) || 'No description provided'}
                    {project.description?.length > 80 && '...'}
                  </Typography>
                  
                  <Box sx={{ mb: 1.5 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="textSecondary">Progress</Typography>
                      <Typography variant="caption" fontWeight="bold">{project.progress_percentage || 0}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress_percentage || 0} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color={project.progress_percentage === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                  
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AttachMoney sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary">
                        Budget: KES {(project.budget || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    {project.actual_cost > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachMoney sx={{ fontSize: 12, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main">
                          Actual Cost: KES {(project.actual_cost || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary">
                        Start: {project.start_date || 'Not set'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary">
                        End: {project.end_date || 'Not set'}
                      </Typography>
                    </Box>
                    {project.completed_at && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CheckCircle sx={{ fontSize: 12, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main">
                          Completed: {new Date(project.completed_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 1.5, pt: 0, gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(project)}
                    sx={{ flex: 1, textTransform: 'none' }}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => handleUpdateProgress(project)}
                    sx={{ flex: 1, textTransform: 'none' }}
                  >
                    Update Progress
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* View Details Dialog with Work Logs */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedProject?.name} - Project Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProject && (
            <Box>
              {/* Project Photos */}
              {(selectedProject.display_photo_url || selectedProject.display_completion_photo_url) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Project Photos</Typography>
                  <Grid container spacing={1}>
                    {selectedProject.display_photo_url && (
                      <Grid item xs={6}>
                        <img 
                          src={selectedProject.display_photo_url} 
                          alt="Project"
                          style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <Typography variant="caption" color="textSecondary">Project Photo</Typography>
                      </Grid>
                    )}
                    {selectedProject.display_completion_photo_url && (
                      <Grid item xs={6}>
                        <img 
                          src={selectedProject.display_completion_photo_url} 
                          alt="Completed"
                          style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <Typography variant="caption" color="success.main">Completion Photo</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedProject.name}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip 
                  label={selectedProject.status?.replace('_', ' ') || 'Planning'} 
                  color={getStatusColor(selectedProject.status)}
                  size="small"
                />
                <Chip 
                  label={`${selectedProject.progress_percentage || 0}% Complete`} 
                  color={selectedProject.progress_percentage === 100 ? 'success' : 'info'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>📍 Location:</strong> {selectedProject.location || 'Not specified'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>📝 Description:</strong> {selectedProject.description || 'No description'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>💰 Budget:</strong> KES {(selectedProject.budget || 0).toLocaleString()}
              </Typography>
              {selectedProject.actual_cost > 0 && (
                <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                  <strong>💰 Actual Cost:</strong> KES {(selectedProject.actual_cost || 0).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>📅 Start Date:</strong> {selectedProject.start_date || 'Not set'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>📅 End Date:</strong> {selectedProject.end_date || 'Not set'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>🔄 Progress:</strong> {selectedProject.progress_percentage || 0}%
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Daily Work Updates Section */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">📋 Daily Work Updates</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => setWorkLogDialogOpen(true)} 
                  size="small"
                >
                  Add Update
                </Button>
              </Box>
              
              <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
                <Tab label="✅ Work Done" />
                <Tab label="📋 Work To Be Done" />
              </Tabs>
              
              <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                {loadingWorkLogs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : (workLogs[selectedProject.id] || []).filter(log => (selectedTab === 0 ? log.work_type === 'DONE' : log.work_type === 'TODO')).length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                    <Assignment sx={{ fontSize: 48, color: '#ccc' }} />
                    <Typography>No {selectedTab === 0 ? 'work done' : 'planned work'} yet.</Typography>
                    <Button size="small" startIcon={<Add />} onClick={() => setWorkLogDialogOpen(true)} sx={{ mt: 1 }}>
                      Add your first update
                    </Button>
                  </Paper>
                ) : (
                  (workLogs[selectedProject.id] || []).filter(log => (selectedTab === 0 ? log.work_type === 'DONE' : log.work_type === 'TODO')).map((log) => (
                    <Card key={log.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{log.title}</Typography>
                        <Typography variant="body2" color="textSecondary">{log.description}</Typography>
                        {log.photo && (
                          <img 
                            src={log.photo} 
                            alt="Work" 
                            style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} 
                          />
                        )}
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                          Added by: {log.created_by_name || 'Unknown'} on {new Date(log.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Project Progress</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedProject.name}
              </Typography>
              
              <TextField
                fullWidth
                label="Progress Percentage"
                type="number"
                value={updateProgress}
                onChange={(e) => setUpdateProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                margin="normal"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              
              <TextField
                fullWidth
                select
                label="Status"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                margin="normal"
                size="small"
              >
                <MenuItem value="PLANNING">📋 Planning</MenuItem>
                <MenuItem value="IN_PROGRESS">🔄 In Progress</MenuItem>
                <MenuItem value="ON_HOLD">⏸️ On Hold</MenuItem>
                <MenuItem value="COMPLETED">✅ Completed</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Update Notes (Optional)"
                multiline
                rows={2}
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                margin="normal"
                size="small"
                placeholder="Add any notes about this update..."
              />
              
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Current Progress: {selectedProject.progress_percentage || 0}%
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProgress} variant="contained" startIcon={<Save />}>
            Save Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Work Update Dialog */}
      <Dialog open={workLogDialogOpen} onClose={() => setWorkLogDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Daily Work Update</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Work Type</InputLabel>
            <Select
              name="work_type"
              value={workLogData.work_type}
              onChange={handleWorkLogChange}
              label="Work Type"
            >
              <MenuItem value="DONE">✅ Work Done</MenuItem>
              <MenuItem value="TODO">📋 Work To Be Done</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Title"
            name="title"
            margin="dense"
            size="small"
            required
            value={workLogData.title}
            onChange={handleWorkLogChange}
            placeholder="e.g., Foundation pouring completed"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            margin="dense"
            size="small"
            required
            value={workLogData.description}
            onChange={handleWorkLogChange}
            placeholder="Detailed description of the work..."
          />
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ mt: 1 }}
          >
            Upload Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleWorkLogImageChange}
            />
          </Button>
          
          {workLogImagePreview && (
            <Box sx={{ mt: 1, position: 'relative' }}>
              <img 
                src={workLogImagePreview} 
                alt="Preview" 
                style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 8 }} 
              />
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'white' }}
                onClick={() => {
                  setWorkLogImagePreview(null);
                  setWorkLogData({ ...workLogData, photo: null });
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkLogDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddWorkLog} 
            variant="contained" 
            disabled={submittingWorkLog || !workLogData.title || !workLogData.description}
          >
            {submittingWorkLog ? 'Adding...' : 'Add Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
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

export default Projects;