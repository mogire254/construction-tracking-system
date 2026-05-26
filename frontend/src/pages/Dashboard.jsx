import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Paper, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Avatar, Divider, Snackbar, Alert, MenuItem, Rating, LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Engineering, Warning, Inventory, CheckCircle, Comment, Send, Close,
  Business, Construction, Phone, Email, Person, ThumbUp, LocationOn,
  TrendingUp, Assignment, Build, SafetyDivider, ArrowForward
} from '@mui/icons-material';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    openIncidents: 0,
    lowStockMaterials: 4,
    avgProgress: 68,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [user, setUser] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  
  const [myRequests, setMyRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [serviceRequest, setServiceRequest] = useState({
    name: '', email: '', phone: '', projectType: '', description: '', budget: '', timeline: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userName = localStorage.getItem('user') || 'User';
    setUser(userName);
    
    const savedComments = localStorage.getItem('siteComments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
    
    fetchDashboardData();
    fetchMyRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const projectsRes = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projects = projectsRes.data;
      
      const incidentsRes = await axios.get('http://127.0.0.1:8000/api/incidents/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const incidents = incidentsRes.data;
      const openIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      
      setStats({
        totalProjects: projects.length,
        openIncidents: openIncidentsCount,
        lowStockMaterials: 4,
        avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length) : 0,
      });
      
      setRecentProjects(projects.slice(0, 3));
      setRecentIncidents(incidents.filter(i => i.status !== 'RESOLVED').slice(0, 2));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/service-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    if (comments.length > 0) {
      const total = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
      setAverageRating(total / comments.length);
    }
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('siteComments', JSON.stringify(comments));
  }, [comments]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        user: user,
        rating: newRating,
        date: new Date().toLocaleString(),
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setNewRating(0);
      setSnackbar({ open: true, message: 'Comment added!', severity: 'success' });
    }
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
    setSnackbar({ open: true, message: 'Comment deleted', severity: 'info' });
  };

  const handleServiceRequestChange = (e) => {
    setServiceRequest({ ...serviceRequest, [e.target.name]: e.target.value });
  };

  const handleServiceRequestSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        name: serviceRequest.name,
        email: serviceRequest.email,
        phone: serviceRequest.phone,
        project_type: serviceRequest.projectType,
        description: serviceRequest.description,
        budget: serviceRequest.budget,
        timeline: serviceRequest.timeline,
      };
      
      await axios.post('http://127.0.0.1:8000/api/service-requests/', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Request sent to admin!', severity: 'success' });
      setOpenDialog(false);
      setServiceRequest({ name: '', email: '', phone: '', projectType: '', description: '', budget: '', timeline: '' });
      fetchMyRequests();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit request', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewContactDetails = (request) => {
    setSelectedRequest(request);
    setContactDialogOpen(true);
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ 
      borderRadius: 2,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
      height: 80,
    }} onClick={onClick}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    if (status === 'IN_PROGRESS') return 'warning';
    return 'default';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return '#f44336';
      case 'MEDIUM': return '#ed6c02';
      case 'LOW': return '#2e7d32';
      case 'CRITICAL': return '#dc004e';
      default: return '#1976d2';
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      py: 2,
    }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            Welcome, {user}! 👷
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your construction projects at a glance
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Active Projects" value={stats.totalProjects} icon={<Engineering sx={{ fontSize: 24 }} />} color="#1976d2" onClick={() => window.location.href = '/projects'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Open Incidents" value={stats.openIncidents} icon={<Warning sx={{ fontSize: 24 }} />} color="#dc004e" onClick={() => window.location.href = '/incidents'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Low Stock" value={stats.lowStockMaterials} icon={<Inventory sx={{ fontSize: 24 }} />} color="#ed6c02" onClick={() => window.location.href = '/materials'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Avg Progress" value={`${stats.avgProgress}%`} icon={<TrendingUp sx={{ fontSize: 24 }} />} color="#2e7d32" />
          </Grid>
        </Grid>

        {/* Three Sections */}
        <Grid container spacing={1.5}>
          {/* Recent Projects */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 1.5, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }} onClick={() => window.location.href = '/projects'}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Assignment sx={{ fontSize: 18, color: '#1976d2' }} /> Recent Projects
                </Typography>
                <ArrowForward sx={{ fontSize: 16, color: '#1976d2' }} />
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box>
                {recentProjects.length === 0 ? (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
                    No projects yet
                  </Typography>
                ) : (
                  recentProjects.map((project) => (
                    <Box key={project.id} sx={{ mb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{project.name}</Typography>
                        <Chip label={project.status?.replace('_', ' ') || 'Planning'} size="small" color={project.status === 'COMPLETED' ? 'success' : 'primary'} />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn sx={{ fontSize: 10, color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">{project.location || 'Location not set'}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={project.progress_percentage || 0} sx={{ height: 3, borderRadius: 2, mt: 0.5 }} />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Open Incidents */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 1.5, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }} onClick={() => window.location.href = '/incidents'}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: '#dc004e' }} /> Open Incidents
                </Typography>
                <ArrowForward sx={{ fontSize: 16, color: '#dc004e' }} />
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box>
                {recentIncidents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      No open incidents
                    </Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<Warning />} 
                      onClick={(e) => { e.stopPropagation(); window.location.href = '/incidents'; }}
                      sx={{ mt: 1, fontSize: 11 }}
                    >
                      Report Incident
                    </Button>
                  </Box>
                ) : (
                  recentIncidents.map((incident) => (
                    <Box key={incident.id} sx={{ mb: 1, p: 0.5, bgcolor: '#fef5e8', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{incident.title}</Typography>
                        <Chip 
                          label={incident.severity} 
                          size="small" 
                          sx={{ bgcolor: getSeverityColor(incident.severity), color: 'white', height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {incident.location || 'Location not specified'}
                      </Typography>
                    </Box>
                  ))
                )}
                {recentIncidents.length > 0 && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Warning />} 
                    onClick={(e) => { e.stopPropagation(); window.location.href = '/incidents'; }}
                    sx={{ mt: 1, fontSize: 11, width: '100%' }}
                  >
                    Report New Incident
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Service Requests */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Build sx={{ fontSize: 18, color: '#ed6c02' }} /> Service Requests
                </Typography>
                <Button size="small" variant="contained" startIcon={<Business sx={{ fontSize: 14 }} />} onClick={() => setOpenDialog(true)} sx={{ py: 0, px: 1, fontSize: 11 }}>
                  New
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                {myRequests.length === 0 ? (
                  <Typography variant="caption" color="textSecondary" align="center" sx={{ display: 'block', py: 2 }}>
                    No requests yet. Click "New" to get a quote.
                  </Typography>
                ) : (
                  myRequests.map((req) => (
                    <Card key={req.id} sx={{ 
                      mb: 1, 
                      borderRadius: 1, 
                      boxShadow: 'none', 
                      bgcolor: req.status === 'APPROVED' ? '#e8f5e9' : '#f8f9fa',
                      borderLeft: `4px solid ${req.status === 'APPROVED' ? '#4caf50' : '#ff9800'}`
                    }}>
                      <CardContent sx={{ py: 0.5, px: 1, '&:last-child': { pb: 0.5 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {req.project_type?.replace('_', ' ').substring(0, 15) || 'Project'}
                          </Typography>
                          <Chip 
                            label={req.status === 'APPROVED' ? 'Approved ✓' : 'Pending ⏳'} 
                            size="small" 
                            color={req.status === 'APPROVED' ? 'success' : 'default'} 
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        </Box>
                        
                        {/* View Contact Details Button */}
                        {req.status === 'APPROVED' && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => handleViewContactDetails(req)}
                            sx={{ mt: 0.5, p: 0.5, fontSize: 10 }}
                          >
                            View Contact Details
                          </Button>
                        )}
                        
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                          📅 {new Date(req.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Need Services Banner */}
        <Paper sx={{ 
          mt: 1.5, 
          p: 1.5, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white'
        }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={8}>
              <Box display="flex" alignItems="center" gap={1}>
                <SafetyDivider sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Need Construction Services?</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>Free quote, quality work</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Button size="small" variant="contained" startIcon={<Business sx={{ fontSize: 14 }} />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#ff9800', color: '#1a237e', py: 0.5 }}>
                Quote
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Comments & Feedback Section */}
        <Paper sx={{ p: 1.5, mt: 1.5, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Comment sx={{ fontSize: 18, color: '#dc004e' }} /> Comments & Feedback
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Rating value={averageRating} readOnly precision={0.5} size="small" />
              <Typography variant="caption">({comments.length})</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          
          <Box display="flex" gap={0.5} mb={1}>
            <Rating value={newRating} onChange={(e, v) => setNewRating(v || 0)} size="small" />
          </Box>
          <Box display="flex" gap={0.5}>
            <TextField size="small" placeholder="Share your thoughts..." value={newComment} onChange={(e) => setNewComment(e.target.value)} fullWidth sx={{ '& .MuiInputBase-root': { fontSize: 12 } }} />
            <Button size="small" variant="contained" onClick={handleAddComment} disabled={!newComment.trim()} sx={{ minWidth: 50 }}>Post</Button>
          </Box>
          
          <Box sx={{ maxHeight: 150, overflow: 'auto', mt: 1 }}>
            {comments.length === 0 ? (
              <Typography variant="caption" color="textSecondary" align="center" sx={{ display: 'block', py: 1 }}>No comments yet</Typography>
            ) : (
              comments.slice(0, 2).map((comment) => (
                <Box key={comment.id} sx={{ mb: 1, p: 0.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Avatar sx={{ width: 18, height: 18, bgcolor: '#1976d2', fontSize: 10 }}>{comment.user?.charAt(0) || 'U'}</Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{comment.user}</Typography>
                      <Rating value={comment.rating} readOnly size="small" />
                    </Box>
                    <IconButton size="small" onClick={() => handleDeleteComment(comment.id)}><Close sx={{ fontSize: 12 }} /></IconButton>
                  </Box>
                  <Typography variant="caption" display="block">{comment.text.substring(0, 50)}</Typography>
                  <Button size="small" onClick={() => handleLikeComment(comment.id)} startIcon={<ThumbUp sx={{ fontSize: 12 }} />} sx={{ fontSize: 10 }}>{comment.likes}</Button>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Container>

      {/* Contact Details Dialog - Clean Version (No Call Button, No Project Details) */}
      <Dialog 
        open={contactDialogOpen} 
        onClose={() => setContactDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">📞 Contact Information</Typography>
            <IconButton onClick={() => setContactDialogOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              {/* Office Information */}
              <Box sx={{ mb: 2, p: 1.5, bgcolor: '#bbdefb', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏢 Office Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" alignItems="flex-start" gap={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Office Location:</Typography>
                    <Typography variant="body2">{selectedRequest.office_location || 'Times Tower, 4th Floor Room 200, Nairobi'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Office Phone:</Typography>
                    <Typography variant="body2">{selectedRequest.office_phone || '0714347129'}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Personal Contact */}
              <Box sx={{ mb: 2, p: 1.5, bgcolor: '#c8e6c9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  👤 Personal Contact
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Contact Person:</Typography>
                    <Typography variant="body2">{selectedRequest.contact_person || 'Muthoni Muthoga'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Contact Phone:</Typography>
                    <Typography variant="body2">{selectedRequest.contact_phone || '0713688443'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Personal Phone:</Typography>
                    <Typography variant="body2">{selectedRequest.personal_phone || '0704071967'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>Contact Email:</Typography>
                    <Typography variant="body2">{selectedRequest.contact_email || 'muthoni@construction.com'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Service Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ py: 1.5, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6">Request Construction Services</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name *"
            name="name"
            margin="dense"
            size="small"
            required
            value={serviceRequest.name}
            onChange={handleServiceRequestChange}
          />
          <TextField
            fullWidth
            label="Email *"
            name="email"
            type="email"
            margin="dense"
            size="small"
            required
            value={serviceRequest.email}
            onChange={handleServiceRequestChange}
          />
          <TextField
            fullWidth
            label="Phone *"
            name="phone"
            margin="dense"
            size="small"
            required
            value={serviceRequest.phone}
            onChange={handleServiceRequestChange}
          />
          <TextField
            fullWidth
            select
            label="Project Type *"
            name="projectType"
            margin="dense"
            size="small"
            required
            value={serviceRequest.projectType}
            onChange={handleServiceRequestChange}
          >
            <MenuItem value="">Select project type</MenuItem>
            <MenuItem value="residential">🏠 Residential Building</MenuItem>
            <MenuItem value="commercial">🏢 Commercial Building</MenuItem>
            <MenuItem value="road">🛣️ Road Construction</MenuItem>
            <MenuItem value="bridge">🌉 Bridge Construction</MenuItem>
            <MenuItem value="renovation">🔨 Renovation</MenuItem>
            <MenuItem value="industrial">🏭 Industrial Building</MenuItem>
            <MenuItem value="water">💧 Water Supply System</MenuItem>
            <MenuItem value="other">📋 Other</MenuItem>
          </TextField>
          
          <TextField
            fullWidth
            label="Budget (KES)"
            name="budget"
            type="number"
            margin="dense"
            size="small"
            value={serviceRequest.budget}
            onChange={handleServiceRequestChange}
            placeholder="e.g., 5000000"
            InputProps={{
              startAdornment: <InputAdornment position="start">KES</InputAdornment>,
            }}
          />
          
          <TextField
            fullWidth
            label="Timeline"
            name="timeline"
            margin="dense"
            size="small"
            value={serviceRequest.timeline}
            onChange={handleServiceRequestChange}
            placeholder="e.g., 6 months"
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Project Description *"
            name="description"
            margin="dense"
            size="small"
            required
            value={serviceRequest.description}
            onChange={handleServiceRequestChange}
            placeholder="Describe what you need built..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleServiceRequestSubmit} 
            variant="contained" 
            disabled={submitting || !serviceRequest.name || !serviceRequest.email || !serviceRequest.projectType}
          >
            {submitting ? 'Sending...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;