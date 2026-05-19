import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, LinearProgress, Paper, IconButton, Tab, Tabs,
  Tooltip, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  Inventory, CheckCircle, Pending, Warning, Add, Close,
  History, TrendingUp, AttachMoney, Refresh, Edit
} from '@mui/icons-material';
import axios from 'axios';

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openUsageDialog, setOpenUsageDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [usageData, setUsageData] = useState({
    quantity_used: '',
    date_used: new Date().toISOString().split('T')[0],
    used_by: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsRes = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projectsRes.data);
      
      // Fetch materials
      const materialsRes = await axios.get('http://127.0.0.1:8000/api/materials/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(materialsRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getMaterialsByProject = (projectId) => {
    return materials.filter(m => m.project === projectId);
  };

  const getProjectStats = (projectId) => {
    const projectMaterials = materials.filter(m => m.project === projectId);
    const totalRequired = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.required_quantity) || 0), 0);
    const totalUsed = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.used_quantity) || 0), 0);
    const totalCost = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.required_cost) || 0), 0);
    const totalUsedCost = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.used_cost) || 0), 0);
    const overallProgress = totalRequired > 0 ? (totalUsed / totalRequired) * 100 : 0;
    
    return { totalRequired, totalUsed, totalCost, totalUsedCost, overallProgress };
  };

  const handleRecordUsage = async () => {
    if (!usageData.quantity_used || usageData.quantity_used <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid quantity', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // First, update the material's used quantity
      const newUsedQuantity = (selectedMaterial.used_quantity || 0) + parseFloat(usageData.quantity_used);
      const newUsedCost = newUsedQuantity * (selectedMaterial.unit_price || 0);
      
      await axios.patch(
        `http://127.0.0.1:8000/api/materials/${selectedMaterial.id}/`,
        {
          used_quantity: newUsedQuantity,
          used_cost: newUsedCost,
          status: newUsedQuantity >= (selectedMaterial.required_quantity || 0) ? 'COMPLETED' : 'ONGOING'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({ open: true, message: 'Material usage recorded!', severity: 'success' });
      setOpenUsageDialog(false);
      setUsageData({ quantity_used: '', date_used: new Date().toISOString().split('T')[0], used_by: '', notes: '' });
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error recording usage:', error);
      setSnackbar({ open: true, message: 'Failed to record usage', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'success';
      case 'ONGOING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'ONGOING': return <TrendingUp sx={{ fontSize: 16 }} />;
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
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Inventory sx={{ fontSize: 28, color: '#ed6c02' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Material Inventory Management
            </Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Project Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={selectedProject || 0} 
          onChange={(e, v) => setSelectedProject(v === 0 ? null : v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Projects" value={0} />
          {projects.map(project => (
            <Tab key={project.id} label={project.name} value={project.id} />
          ))}
        </Tabs>
      </Paper>

      {/* Materials List */}
      <Grid container spacing={2}>
        {(selectedProject ? getMaterialsByProject(selectedProject) : materials).map((material) => {
          const required = material.required_quantity || 0;
          const used = material.used_quantity || 0;
          const remaining = required - used;
          const progress = required > 0 ? (used / required) * 100 : 0;
          
          return (
            <Grid item xs={12} md={6} key={material.id}>
              <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                <CardContent>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Inventory color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {material.name}
                      </Typography>
                    </Box>
                    <Chip 
                      icon={getStatusIcon(material.status)}
                      label={material.status || 'PENDING'} 
                      size="small" 
                      color={getStatusColor(material.status)}
                    />
                  </Box>

                  {/* Project info */}
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                    📋 Project: {projects.find(p => p.id === material.project)?.name || 'Unknown'}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">Material Usage Progress</Typography>
                      <Typography variant="caption" fontWeight="bold">{progress.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={progress >= 100 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                    />
                  </Box>

                  {/* Quantity Stats */}
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="caption" color="textSecondary">Required</Typography>
                        <Typography variant="h6">{required} {material.unit}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#c8e6c9' }}>
                        <Typography variant="caption" color="textSecondary">Used</Typography>
                        <Typography variant="h6">{used} {material.unit}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1, textAlign: 'center', bgcolor: remaining < (required * 0.2) ? '#ffcdd2' : '#fff3e0' }}>
                        <Typography variant="caption" color="textSecondary">Remaining</Typography>
                        <Typography variant="h6">{remaining} {material.unit}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Cost Stats */}
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Budgeted Cost</Typography>
                      <Typography variant="body2" fontWeight="bold">KES {(material.required_cost || 0).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Used Cost</Typography>
                      <Typography variant="body2" fontWeight="bold">KES {(material.used_cost || 0).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Unit Price</Typography>
                      <Typography variant="body2" fontWeight="bold">KES {material.unit_price}/{material.unit}</Typography>
                    </Grid>
                  </Grid>

                  {/* Action Button */}
                  {material.status !== 'COMPLETED' && required > 0 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setOpenUsageDialog(true);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Record Usage
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Project Summary Cards */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Project Material Summary</Typography>
      <Grid container spacing={2}>
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ 
                borderRadius: 2, 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6 },
                bgcolor: project.status === 'COMPLETED' ? '#e8f5e9' : '#ffffff'
              }} 
              onClick={() => setSelectedProject(project.id)}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{project.name}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">Overall Progress</Typography>
                      <Typography variant="caption" fontWeight="bold">{stats.overallProgress.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={stats.overallProgress} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Materials Required</Typography>
                      <Typography variant="body2">{stats.totalRequired} units</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Materials Used</Typography>
                      <Typography variant="body2">{stats.totalUsed} units</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Budgeted Cost</Typography>
                      <Typography variant="body2">KES {stats.totalCost.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Used Cost</Typography>
                      <Typography variant="body2">KES {stats.totalUsedCost.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                  {project.status === 'COMPLETED' && (
                    <Chip label="Completed" size="small" color="success" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Record Usage Dialog */}
      <Dialog open={openUsageDialog} onClose={() => setOpenUsageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Record Material Usage</Typography>
            <IconButton onClick={() => setOpenUsageDialog(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{selectedMaterial.name}</Typography>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Remaining: {(selectedMaterial.required_quantity - selectedMaterial.used_quantity).toFixed(2)} {selectedMaterial.unit}
              </Typography>
              
              <TextField
                fullWidth
                label="Quantity Used *"
                type="number"
                value={usageData.quantity_used}
                onChange={(e) => setUsageData({ ...usageData, quantity_used: e.target.value })}
                margin="normal"
                size="small"
                InputProps={{ 
                  inputProps: { min: 0, max: selectedMaterial.required_quantity - selectedMaterial.used_quantity }
                }}
              />
              
              <TextField
                fullWidth
                label="Date Used"
                type="date"
                value={usageData.date_used}
                onChange={(e) => setUsageData({ ...usageData, date_used: e.target.value })}
                margin="normal"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Used By"
                value={usageData.used_by}
                onChange={(e) => setUsageData({ ...usageData, used_by: e.target.value })}
                margin="normal"
                size="small"
                placeholder={localStorage.getItem('user')}
              />
              
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={usageData.notes}
                onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                margin="normal"
                size="small"
                placeholder="e.g., Used for foundation work"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRecordUsage} variant="contained" disabled={!usageData.quantity_used}>
            Record Usage
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Materials;