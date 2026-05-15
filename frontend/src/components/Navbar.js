import React from 'react';
// Importiamo Material UI
import { AppBar, Toolbar, Typography,IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';

function Navbar() {
  return (
    // AppBar Piazzata in alto che conterrà altri elementi
    <AppBar position="sticky" color="warning">
      <Toolbar>
        {/* L'icona del menu a sinistra */}
        <IconButton size="large" edge="start" color="inherit"  sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Book&Order
        </Typography>
        {/* Il pulsante di Login a destra */}
        <IconButton color="inherit" size='large' >
         <PersonIcon sx={{ fontSize: 28 }}/>  
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; // Lo rendiamo disponibile per gli altri file