import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import burger from '../assets/Burger.png';
import { Link } from 'react-router-dom';

function Body() {
  return (
    <Box sx={{
      width:'100%',
      maxWidth: '100vw',
      minHeight: {xs : '60vh', md : '70vh'},
      background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'

    }}>

      {/* TESTO */}
      <Box sx={{
        width: { xs: '100%', md: '48%' },
        paddingLeft: { xs: '32px', md: '80px' },
        paddingRight: { xs: '32px', md: '0' },
        paddingTop: { xs: '60px', md: '0' },
        paddingBottom: { xs: '300px', md: '0' }, //il burger si sposta sotto
        boxSizing: 'border-box'
      }}>

        {/* Badge */}
        <Box sx={{
          display: 'inline-block',
          backgroundColor: '#ff8400',
          color: 'white',
          fontSize: '22px', 
          fontWeight: 'bold',
          px: 2, py: 0.5,
          borderRadius: '20px',
          mb: 2,
          letterSpacing: '1.5px',
        }}>
           NOVITÀ DEL MESE
        </Box>

        <Typography sx={{
          fontFamily: '"Arial Black", Impact, sans-serif',
          fontWeight: 900,
          mb: 2,
          color: '#ffffff',
          fontSize: { xs: '2.2rem', md: '3.2rem',xl:'6rem'},
          lineHeight: 1.05,
          textTransform: 'uppercase',
          letterSpacing: 0,
          textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
          maxWidth: '520px',
        }}>
          Double Beef Burger
        </Typography>

        <Typography sx={{
          mb: 4,
          color: 'rgba(255,255,255,0.8)',
          fontSize: { xs: '1rem', md: '1.15rem' },
          lineHeight: 1.7,
          maxWidth: '420px',
        }}>
          Due succulenti hamburger, cheddar fuso, lattuga fresca e salsa speciale
          in un morbido panino. Riserva il tuo tavolo!
        </Typography>

        <Box  sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button component={Link} to='/menu' variant="contained" color="warning" sx={{
            height: '52px',
            px: 4,
            borderRadius: '300px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(255,132,0,0.4)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(255,132,0,0.6)',
            },
            transition: 'all 1.3s',
          }}>
            ORDINA ORA
          </Button>
        </Box>
      </Box>

      {/* BURGER */}
      <Box
        component="img"
        src={burger}
        sx={{
          position: 'absolute',
          right: { xs: 'auto', md: '0' },
          left: { xs: '50%', md: 'unset' },
          bottom: { xs: '20px', md: 'auto' },
          transform: { xs: 'translateX(-50%)', md: 'none' },
          width: { xs: '100%', md: '55%' },
          maxWidth: { xs: '800px', md: 'none' },
          height: 'auto',
          filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.6))',
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default Body;
