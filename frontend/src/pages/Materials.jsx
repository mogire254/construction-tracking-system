import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Chip } from '@mui/material';
import { getMaterials } from '../services/api';

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container><Typography>Loading materials...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📦 Material Inventory</Typography>
      <Grid container spacing={3}>
        {materials.length === 0 ? (
          <Grid item xs={12}>
            <Card><CardContent><Typography>No materials added yet. Add materials in the admin panel.</Typography></CardContent></Card>
          </Grid>
        ) : (
          materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{material.name}</Typography>
                    <Chip label={material.is_low_stock ? 'Low Stock!' : 'In Stock'} color={material.is_low_stock ? 'error' : 'success'} size="small" />
                  </Box>
                  <Typography variant="body2" color="textSecondary">Unit: {material.unit}</Typography>
                  <Typography variant="h3" align="center">{material.quantity_in_stock}</Typography>
                  <Typography variant="body2" align="center" color="textSecondary">units in stock</Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>💰 Price: KES {material.unit_price}</Typography>
                  {material.supplier_name && <Typography variant="body2">🏭 Supplier: {material.supplier_name}</Typography>}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default Materials;