import React, { useEffect, useState } from 'react';
// Importiamo Material UI
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [utente, setUtente] = useState(null);
  const location = useLocation();
  const VerifySession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUtente(null);
      return;
    }
    try{
    const risposta = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!risposta.ok) {
      localStorage.removeItem('token');
      setUtente(null);
      return;
    }
    const dati = await risposta.json();
    setUtente(dati.utente);
  }catch(errore){
    setUtente(null)
  }
  };

  useEffect(() => {

    VerifySession();
  }, [location.pathname]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUtente(null);
  };
  return (
    // AppBar 
    <AppBar position="fixed" color="warning" sx={{ maxWidth: '100%', background: 'linear-gradient(135deg, #000000 0%, #1c1816 50%, #000000 100%)', }}>
      <Toolbar>
        {/* L'icona del menu a sinistra */}
        <IconButton size="large" edge="start" color="inherit" component={Link}
          to='/' sx={{ mr: 2 }}>
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
        {utente ? (
          <Button color="inherit" onClick={handleLogout}>
            Esci
          </Button>
        ) : (
          <IconButton
            color="inherit"
            size="large"
            component={Link}
            to="/login"
          >
            <PersonIcon sx={{ fontSize: 28 }} />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
