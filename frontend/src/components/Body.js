import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import burger from '../assets/Burger.png';

function Body() {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a00 0%, #8B1a00 50%, #c0392b 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        color: '',
        justifyContent: 'space-between', // Spaziatura tra testo e immagine
      }}
    >
      {/* usiamo Box diretto con paddingLeft fisso */}
      <Box
        sx={{
          width: '50%',
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
        {/* Immagine del burger a destra, con dimensioni fisse e margine */}
        <Box
          component="img"
          src={burger}
           sx={{
              position: 'absolute',
              left: '50%',      // esce dal bordo destro
              width: '82%',
              height: 'auto',
            
  }}
        />
    </Box>
  );
}

export default Body;