import React from 'react';
// Importiamo Material UI
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function Navbar() {
  return (
    // AppBar Piazzata in alto che conterrà altri elementi
    <AppBar position="static" color="warning">
      <Toolbar>
        
        {/* L'icona del menu a sinistra */}
        <IconButton size="large" edge="start" color="inherit"  sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        
        <Typography variant="h4" component="div" sx={{ flexGrow: 5 }}>
          Book&Order
        </Typography>

        {/* Il pulsante di Login a destra */}
        <Button color="inherit">Login</Button>
        
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; // Lo rendiamo disponibile per gli altri file