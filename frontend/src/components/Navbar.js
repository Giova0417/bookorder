import React from 'react';
// Importiamo Material UI
import { AppBar, Toolbar, Typography,IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    // AppBar Piazzata in alto che conterrà altri elementi
    <AppBar position="fixed" color="warning" sx={{maxWidth:'100%',background:'linear-gradient(135deg, #000000 0%, #1c1816 50%, #000000 100%)',}}>
      <Toolbar>
        {/* L'icona del menu a sinistra */}
        <IconButton size="large" edge="start" color="inherit"  sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h4" component="div" sx={{
          flexGrow: 1,
          fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
          fontWeight: 900,
          letterSpacing: 0,
          textShadow: '0 3px 10px rgba(0,0,0,0.45)',
        }}>
          Book&Order
        </Typography>
        {/* Il pulsante di Login a destra */}
        <IconButton color="inherit" size='large' 
          component={Link}
          to='/login'
        >
         <PersonIcon sx={{ fontSize: 28 }}/>  
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
