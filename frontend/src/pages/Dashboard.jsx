import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Paper, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Avatar, Divider, Snackbar, Alert, MenuItem, Rating, LinearProgress
} from '@mui/material';
import {
  Engineering, Warning, Inventory, CheckCircle, Comment, Send, Close,
  Business, Construction, Phone, Email, Person, ThumbUp, LocationOn
} from '@mui/icons-material';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 3,
    openIncidents: 2,
    lowStockMaterials: 4,
    avgProgress: 68,
  });
  const [recentProjects, setRecentProjects] = useState([
    { id: 1, name: 'Nairobi Mall Construction', progress: 70, status: 'In Progress', location: 'Nairobi, Kenya' },
    { id: 2, name: 'Mombasa Bridge Project', progress: 45, status: 'In Progress', location: 'Mombasa, Kenya' },
    { id: 3, name: 'Kisumu School Building', progress: 100, status: 'Completed', location: 'Kisumu, Kenya' },
  ]);
  const [user, setUser] = useState('');
  
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
    
    const savedRequests = localStorage.getItem('serviceRequests');
    if (savedRequests) {
      setMyRequests(JSON.parse(savedRequests));
    }
  }, []);

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

  const handleServiceRequestSubmit = () => {
    setSubmitting(true);
    const newRequest = {
      id: Date.now(),
      ...serviceRequest,
      status: 'PENDING',
      admin_response: '',
      created_at: new Date().toISOString(),
    };
    const updatedRequests = [newRequest, ...myRequests];
    setMyRequests(updatedRequests);
    localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));
    setSnackbar({ open: true, message: 'Request sent!', severity: 'success' });
    setOpenDialog(false);
    setServiceRequest({ name: '', email: '', phone: '', projectType: '', description: '', budget: '', timeline: '' });
    setSubmitting(false);
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ 
      height: 90, 
      bgcolor: color, 
      color: 'white', 
      cursor: 'pointer', 
      '&:hover': { transform: 'scale(1.02)' },
      backdropFilter: 'blur(5px)',
      backgroundColor: `${color}dd`,
    }} onClick={onClick}>
      <CardContent sx={{ py: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    if (status === 'IN_PROGRESS') return 'warning';
    if (status === 'COMPLETED') return 'success';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'COMPLETED') return 'Completed';
    return 'Pending';
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: 'url("https://images.pexels.com/photos/163789/construction-worker-building-architect-163789.jpeg?auto=compress&cs=tinysrgb&w=1600")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1,
      },
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 3 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
          <Typography variant="h5">Welcome, {user}! 👷</Typography>
          <Typography variant="body2" color="textSecondary">Here's what's happening with your construction projects today.</Typography>
        </Paper>
        
        {/* Stats Cards */}
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Active Projects" value={stats.totalProjects} icon={<Engineering />} color="#1976d2" onClick={() => window.location.href = '/projects'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Open Incidents" value={stats.openIncidents} icon={<Warning />} color="#dc004e" onClick={() => window.location.href = '/incidents'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Low Stock" value={stats.lowStockMaterials} icon={<Inventory />} color="#ed6c02" onClick={() => window.location.href = '/materials'} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Avg Progress" value={`${stats.avgProgress}%`} icon={<CheckCircle />} color="#2e7d32" />
          </Grid>
        </Grid>
        
        {/* Construction Services Section */}
        <Paper sx={{ mt: 2, p: 2, background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', color: 'white', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <Box display="flex" alignItems="center" gap={1}>
                <Construction />
                <Typography variant="h6">Need Construction Services?</Typography>
              </Box>
              <Typography variant="caption">Quality work, on-time delivery, safe construction.</Typography>
              <Button size="small" variant="contained" startIcon={<Business />} onClick={() => setOpenDialog(true)} sx={{ mt: 1, bgcolor: '#ff9800', color: '#1a237e' }}>
                Request Free Quote
              </Button>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Construction sx={{ fontSize: 60, opacity: 0.8 }} />
            </Grid>
          </Grid>
        </Paper>
        
        {/* Three Sections Side by Side */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Recent Projects - Left */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, height: '100%', minHeight: 400, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>📋 Recent Projects</Typography>
              <Divider />
              <Box sx={{ mt: 1, maxHeight: 350, overflow: 'auto' }}>
                {recentProjects.map((project) => (
                  <Card key={project.id} sx={{ mb: 1, bgcolor: '#fafafa' }}>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">{project.name}</Typography>
                        <Chip label={project.status} size="small" color={project.status === 'Completed' ? 'success' : 'primary'} />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">{project.location}</Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption">Progress</Typography>
                          <Typography variant="caption" fontWeight="bold">{project.progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={project.progress} sx={{ height: 4, borderRadius: 2 }} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button size="small" fullWidth onClick={() => window.location.href = '/projects'} sx={{ mt: 1 }}>View All →</Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* My Service Requests - Middle */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, height: '100%', minHeight: 400, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">📝 My Requests</Typography>
                <Button size="small" variant="outlined" startIcon={<Business />} onClick={() => setOpenDialog(true)}>New</Button>
              </Box>
              <Divider />
              <Box sx={{ mt: 1, maxHeight: 350, overflow: 'auto' }}>
                {myRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Business sx={{ fontSize: 40, color: '#ccc' }} />
                    <Typography variant="caption" color="textSecondary">No requests yet</Typography>
                  </Box>
                ) : (
                  myRequests.map((req) => (
                    <Card key={req.id} sx={{ mb: 1, borderLeft: `3px solid ${req.status === 'APPROVED' ? '#4caf50' : req.status === 'REJECTED' ? '#f44336' : '#ff9800'}` }}>
                      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
                            {req.projectType?.replace('_', ' ').toUpperCase() || 'Project'}
                          </Typography>
                          <Chip label={getStatusLabel(req.status)} size="small" color={getStatusColor(req.status)} />
                        </Box>
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                          {req.description?.substring(0, 60)}...
                        </Typography>
                        {req.admin_response && (
                          <Box sx={{ mt: 1, p: 0.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="caption" color="primary">✓ {req.admin_response}</Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                          {new Date(req.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Comments & Feedback - Right */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 1.5, height: '100%', minHeight: 400, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">💬 Comments & Feedback</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={averageRating} readOnly precision={0.5} size="small" />
                  <Typography variant="caption">({comments.length})</Typography>
                </Box>
              </Box>
              <Divider />
              
              {/* Add Comment */}
              <Box sx={{ mt: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="caption">Rate:</Typography>
                  <Rating value={newRating} onChange={(e, v) => setNewRating(v || 0)} size="small" />
                </Box>
                <Box display="flex" gap={1}>
                  <TextField fullWidth size="small" placeholder="Share your thoughts..." value={newComment} onChange={(e) => setNewComment(e.target.value)} multiline rows={2} />
                  <Button variant="contained" size="small" onClick={handleAddComment} disabled={!newComment.trim()}>Post</Button>
                </Box>
              </Box>
              
              {/* Comments List */}
              <Box sx={{ mt: 1, maxHeight: 280, overflow: 'auto' }}>
                {comments.length === 0 ? (
                  <Typography color="textSecondary" align="center" sx={{ py: 2 }}>No comments yet.</Typography>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} sx={{ mb: 1, bgcolor: '#f9f9f9' }}>
                      <CardContent sx={{ py: 0.5, '&:last-child': { pb: 0.5 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2', fontSize: 12 }}>{comment.user?.charAt(0) || 'U'}</Avatar>
                            <Typography variant="caption" fontWeight="bold">{comment.user}</Typography>
                            <Rating value={comment.rating || 0} readOnly size="small" />
                            <Typography variant="caption" color="textSecondary">{comment.date.split(',')[0]}</Typography>
                          </Box>
                          <IconButton size="small" onClick={() => handleDeleteComment(comment.id)}><Close fontSize="small" /></IconButton>
                        </Box>
                        <Typography variant="caption" display="block" sx={{ ml: 4 }}>{comment.text}</Typography>
                        <Button size="small" onClick={() => handleLikeComment(comment.id)} startIcon={<ThumbUp sx={{ fontSize: 12 }} />} sx={{ ml: 3, mt: 0.5, fontSize: 11 }}>
                          {comment.likes} Likes
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Service Request Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Request Construction Services</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Full Name" name="name" margin="dense" required value={serviceRequest.name} onChange={handleServiceRequestChange} />
            <TextField fullWidth label="Email" name="email" type="email" margin="dense" required value={serviceRequest.email} onChange={handleServiceRequestChange} />
            <TextField fullWidth label="Phone" name="phone" margin="dense" required value={serviceRequest.phone} onChange={handleServiceRequestChange} />
            <TextField fullWidth select label="Project Type" name="projectType" margin="dense" required value={serviceRequest.projectType} onChange={handleServiceRequestChange}>
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="road">Road Construction</MenuItem>
              <MenuItem value="bridge">Bridge Construction</MenuItem>
              <MenuItem value="renovation">Renovation</MenuItem>
            </TextField>
            <TextField fullWidth label="Budget (KES)" name="budget" margin="dense" value={serviceRequest.budget} onChange={handleServiceRequestChange} />
            <TextField fullWidth label="Timeline" name="timeline" margin="dense" value={serviceRequest.timeline} onChange={handleServiceRequestChange} />
            <TextField fullWidth multiline rows={2} label="Description" name="description" margin="dense" required value={serviceRequest.description} onChange={handleServiceRequestChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleServiceRequestSubmit} variant="contained" disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Dashboard;