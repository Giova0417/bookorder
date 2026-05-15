import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import photoBody from '../assets/BodyPng.jpg';

function Body() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        backgroundImage: `url(${photoBody})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: '',
      }}
    >
      {/* Niente Container — usiamo Box diretto con paddingLeft fisso */}
      <Box
        sx={{
          maxWidth: '480px',
          paddingLeft: { xs: '24px', md: '80px' },
          paddingRight: '24px',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#ff8400' ,textShadow: '2px 2px 4px rgba(176, 181, 164, 0.7)'}}>
          Prova la novità del mese Double Beef Burger!
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: '#ffffff' , textShadow: '2px 2px 4px rgba(176, 181, 164, 0.7)'}}>
          Un'esplosione di gusto con due succulenti hamburger di carne, formaggio fuso,
          lattuga fresca e salsa speciale, il tutto racchiuso in un morbido panino.
          Vieni a provarlo oggi stesso!
        </Typography>
        <Button variant="contained" color="warning"  sx={{ height: '50px', width: '60%', borderRadius: '300px', fontSize: '18px' }}>
          Ordina Ora
        </Button>
      </Box>
    </Box>
  );
}

export default Body;