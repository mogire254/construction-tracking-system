import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, LinearProgress, Chip, Box } from '@mui/material';
import { getProjects } from '../services/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'PLANNING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading projects...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📋 Construction Projects
      </Typography>
      
      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography>No projects yet. Add your first project in the admin panel.</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Go to: http://127.0.0.1:8000/admin/construction_projects/project/add/
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          projects.map((project) => (
            <Grid item xs={12} md={6} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip 
                      label={project.status?.replace('_', ' ') || 'Planning'} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    📍 {project.location || 'Location not specified'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {project.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{project.progress_percentage || 0}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress_percentage || 0} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💰 Budget: KES {(project.budget || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      📅 Start: {project.start_date || 'Not set'}
                    </Typography>
                    <Typography variant="body2">
                      📅 End: {project.end_date || 'Not set'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">View Details</Button>
                  <Button size="small" color="secondary">Update Progress</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default Projects;