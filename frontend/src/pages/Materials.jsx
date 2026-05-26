import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, LinearProgress, Paper, IconButton,
  Tooltip, Snackbar, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import {
  Inventory, CheckCircle, Pending, Warning, Add, Close,
  TrendingUp, AttachMoney, Refresh, Construction, Build
} from '@mui/icons-material';
import axios from 'axios';

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openUsageDialog, setOpenUsageDialog] = useState(false);
  const [openAddMaterialDialog, setOpenAddMaterialDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [usageData, setUsageData] = useState({
    quantity_used: '',
    date_used: new Date().toISOString().split('T')[0],
    used_by: '',
    notes: ''
  });
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    unit: 'BAGS',
    required_quantity: '',
    unit_price: '',
    supplier_name: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const projectsRes = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projectsRes.data);
      
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
    const totalDelivered = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.required_quantity) || 0), 0);
    const totalUsed = projectMaterials.reduce((sum, m) => sum + (parseFloat(m.used_quantity) || 0), 0);
    const totalRemaining = totalDelivered - totalUsed;
    const overallProgress = totalDelivered > 0 ? (totalUsed / totalDelivered) * 100 : 0;
    
    return { totalDelivered, totalUsed, totalRemaining, overallProgress };
  };

  const handleRecordUsage = async () => {
    // Get the quantity value properly
    let quantityToAdd = 0;
    const quantityValue = usageData.quantity_used;
    
    if (Array.isArray(quantityValue)) {
      quantityToAdd = parseFloat(quantityValue[0]) || 0;
    } else {
      quantityToAdd = parseFloat(quantityValue) || 0;
    }
    
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid quantity', severity: 'error' });
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      const currentUsed = Number(selectedMaterial.used_quantity) || 0;
      const newUsedQuantity = currentUsed + quantityToAdd;
      const unitPrice = Number(selectedMaterial.unit_price) || 0;
      const newUsedCost = newUsedQuantity * unitPrice;
      
      console.log('Updating material:', {
        id: selectedMaterial.id,
        currentUsed,
        quantityToAdd,
        newUsedQuantity,
        newUsedCost
      });
      
      const updateData = {
        used_quantity: newUsedQuantity,
        used_cost: newUsedCost
      };
      
      const requiredQty = Number(selectedMaterial.required_quantity) || 0;
      if (newUsedQuantity >= requiredQty) {
        updateData.status = 'COMPLETED';
      } else if (newUsedQuantity > 0) {
        updateData.status = 'ONGOING';
      }
      
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/materials/${selectedMaterial.id}/`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Update response:', response.data);
      
      setSnackbar({ open: true, message: 'Material usage recorded!', severity: 'success' });
      setOpenUsageDialog(false);
      setUsageData({ quantity_used: '', date_used: new Date().toISOString().split('T')[0], used_by: '', notes: '' });
      fetchData();
      
    } catch (error) {
      console.error('Error recording usage:', error.response?.data || error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to record usage', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.required_quantity || !newMaterial.unit_price) {
      setSnackbar({ open: true, message: 'Please fill required fields', severity: 'warning' });
      return;
    }

    if (!selectedProject) {
      setSnackbar({ open: true, message: 'Please select a project first', severity: 'warning' });
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const requiredQuantity = parseFloat(newMaterial.required_quantity);
      const unitPrice = parseFloat(newMaterial.unit_price);
      const requiredCost = requiredQuantity * unitPrice;
      
      const materialData = {
        name: newMaterial.name,
        unit: newMaterial.unit,
        required_quantity: requiredQuantity,
        required_cost: requiredCost,
        unit_price: unitPrice,
        supplier_name: newMaterial.supplier_name || '',
        project: selectedProject,
        status: 'PENDING',
        used_quantity: 0,
        used_cost: 0
      };
      
      console.log('Adding material:', materialData);
      
      await axios.post('http://127.0.0.1:8000/api/materials/', materialData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: 'Material added successfully!', severity: 'success' });
      setOpenAddMaterialDialog(false);
      setNewMaterial({ name: '', unit: 'BAGS', required_quantity: '', unit_price: '', supplier_name: '' });
      fetchData();
      
    } catch (error) {
      console.error('Error adding material:', error.response?.data || error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add material', severity: 'error' });
    } finally {
      setUpdating(false);
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

  const selectedProjectMaterials = selectedProject ? getMaterialsByProject(selectedProject) : materials;
  const projectStats = selectedProject ? getProjectStats(selectedProject) : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
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

      {/* Project Selection Cards */}
      <Typography variant="h6" sx={{ mb: 2 }}>Select Project</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              borderRadius: 2,
              bgcolor: selectedProject === null ? '#1976d2' : '#f5f5f5',
              color: selectedProject === null ? 'white' : 'inherit',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 }
            }}
            onClick={() => setSelectedProject(null)}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">All Projects</Typography>
              <Typography variant="h3">{materials.length}</Typography>
              <Typography variant="caption">Total Materials</Typography>
            </CardContent>
          </Card>
        </Grid>
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          return (
            <Grid item xs={12} sm={6} md={3} key={project.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: 2,
                  bgcolor: selectedProject === project.id ? '#1976d2' : '#f5f5f5',
                  color: selectedProject === project.id ? 'white' : 'inherit',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 }
                }}
                onClick={() => setSelectedProject(project.id)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Construction sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" noWrap>{project.name}</Typography>
                  <Typography variant="h4">{stats.totalDelivered}</Typography>
                  <Typography variant="caption">Units Delivered</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.overallProgress} 
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Project Summary */}
      {selectedProject && projectStats && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">Delivered</Typography>
              <Typography variant="h5" color="primary">{projectStats.totalDelivered.toFixed(2)} units</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">Used</Typography>
              <Typography variant="h5" color="warning.main">{projectStats.totalUsed.toFixed(2)} units</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">Remaining</Typography>
              <Typography variant="h5" color={projectStats.totalRemaining < 0 ? 'error' : 'success'}>
                {projectStats.totalRemaining.toFixed(2)} units
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Add Material Button */}
      {selectedProject && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAddMaterialDialog(true)}>
            Add Material
          </Button>
        </Box>
      )}

      {/* Materials List */}
      <Grid container spacing={2}>
        {selectedProjectMaterials.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 60, color: '#ccc' }} />
              <Typography>No materials found for this project.</Typography>
              {selectedProject && (
                <Button startIcon={<Add />} onClick={() => setOpenAddMaterialDialog(true)} sx={{ mt: 2 }}>
                  Add Material
                </Button>
              )}
            </Paper>
          </Grid>
        ) : (
          selectedProjectMaterials.map((material) => {
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
                        <Build color="primary" />
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

                    {/* Unit */}
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Unit: {material.unit}
                    </Typography>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">Usage Progress</Typography>
                        <Typography variant="caption" fontWeight="bold">{progress.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                        color={progress >= 100 ? 'success' : 'primary'}
                      />
                    </Box>

                    {/* Material Stats */}
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                          <Typography variant="caption" color="textSecondary">Delivered</Typography>
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
                        <Paper sx={{ p: 1, textAlign: 'center', bgcolor: remaining < 0 ? '#ffcdd2' : '#fff3e0' }}>
                          <Typography variant="caption" color="textSecondary">Remaining</Typography>
                          <Typography variant="h6" sx={{ color: remaining < 0 ? 'error.main' : 'inherit' }}>
                            {remaining.toFixed(2)} {material.unit}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Cost Information */}
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        💰 Unit Price: KES {material.unit_price?.toLocaleString() || 0} / {material.unit}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        💵 Budgeted: KES {(material.required_cost || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="success.main" display="block">
                        💸 Used Cost: KES {(material.used_cost || 0).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Record Usage Button */}
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
          })
        )}
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
                Current Stock: {(selectedMaterial.required_quantity - selectedMaterial.used_quantity).toFixed(2)} {selectedMaterial.unit}
              </Typography>
              
              <TextField
                fullWidth
                label="Quantity Used *"
                type="number"
                value={usageData.quantity_used}
                onChange={(e) => setUsageData({ ...usageData, quantity_used: e.target.value })}
                margin="normal"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
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
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsageDialog(false)}>Cancel</Button>
          <Button onClick={handleRecordUsage} variant="contained" disabled={updating || !usageData.quantity_used}>
            {updating ? 'Recording...' : 'Record Usage'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={openAddMaterialDialog} onClose={() => setOpenAddMaterialDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Material</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Material Name *"
            value={newMaterial.name}
            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
            margin="dense"
            size="small"
            required
          />
          
          <TextField
            fullWidth
            select
            label="Unit *"
            value={newMaterial.unit}
            onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
            margin="dense"
            size="small"
          >
            <MenuItem value="PCS">Pieces (PCS)</MenuItem>
            <MenuItem value="KG">Kilograms (KG)</MenuItem>
            <MenuItem value="LTR">Liters (LTR)</MenuItem>
            <MenuItem value="MTR">Meters (MTR)</MenuItem>
            <MenuItem value="BAGS">Bags (BAGS)</MenuItem>
          </TextField>
          
          <TextField
            fullWidth
            label="Delivered Quantity *"
            type="number"
            value={newMaterial.required_quantity}
            onChange={(e) => setNewMaterial({ ...newMaterial, required_quantity: e.target.value })}
            margin="dense"
            size="small"
            required
            InputProps={{ endAdornment: <InputAdornment position="end">{newMaterial.unit}</InputAdornment> }}
          />
          
          <TextField
            fullWidth
            label="Unit Price (KES) *"
            type="number"
            value={newMaterial.unit_price}
            onChange={(e) => setNewMaterial({ ...newMaterial, unit_price: e.target.value })}
            margin="dense"
            size="small"
            required
          />
          
          <TextField
            fullWidth
            label="Supplier Name (Optional)"
            value={newMaterial.supplier_name}
            onChange={(e) => setNewMaterial({ ...newMaterial, supplier_name: e.target.value })}
            margin="dense"
            size="small"
          />
          
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Total Budgeted Cost: KES {(parseFloat(newMaterial.required_quantity || 0) * parseFloat(newMaterial.unit_price || 0)).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMaterialDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMaterial} variant="contained" disabled={updating}>
            {updating ? 'Adding...' : 'Add Material'}
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