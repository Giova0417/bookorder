import React, { useEffect, useState } from 'react';
// Importiamo Material UI
import { Grow, Box, AppBar, Toolbar, Typography, IconButton, Button, Popover, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext'


function Navbar() {
  const { cartItems, totalQuantity , addItem, decreaseItem } = useCart();
  const [utente, setUtente] = useState(null);
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAnchor, setCartAnchor] = useState(null);
  const handleCartClick = (event) => {
    setCartAnchor(event.currentTarget);
    setCartOpen(true);
  };
  const handleCartClose = () => {
    setCartOpen(false);
    setCartAnchor(null);
  };
  const VerifySession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUtente(null);
      return;
    }
    try {
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
    } catch (errore) {
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
        {/* I pulsanti di Login e carrello a destra */}
        <IconButton color="inherit"
          size="large"
          onClick={handleCartClick}>
          <ShoppingCartIcon />
        </IconButton>
        <Popover
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                width: { xs: 'calc(100vw - 32px)', sm: 340 },
                backgroundColor: '#151515',
                color: '#fff',
                border: '1px solid rgba(255, 132, 0, 0.45)',
                borderRadius: '14px',
                boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
                overflow: 'hidden',
              }
            }
          }}
          TransitionComponent={Grow}
          transitionDuration={400}
          open={cartOpen}
          anchorEl={cartAnchor}
          onClose={handleCartClose}
          disableScrollLock
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: 'right'
          }}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>
                Carrello
              </Typography>

              <Typography sx={{ color: '#ff8400', fontWeight: 700, fontSize: 13 }}>
                {totalQuantity} articoli
              </Typography>

            </Box>
            
            <Box sx={{ my: 2, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
           {totalQuantity ? (<Box sx={{minHeight:'100px'}}>
              {cartItems.map((item) => (
                <Box key={item.id}>
                  <Grid sx={{display:'flex',gap:2}}> <Typography>
                    {item.nome}
                  </Typography>
                  <Typography sx={{background:'#ff6200f2', borderRadius:'10px', width:'10%', textAlign:'center', fontWeight:'bold'}}>
                    {item.quantita}
                  </Typography>
                  <Typography sx={{color:'#ff6200'}}>
                    {item.quantita*item.prezzo} EUR
                  </Typography>
                  </Grid>
                   <Typography>
                    {item.prezzo} EUR
                  </Typography>
                 
                </Box>
              ))}
            </Box>): ( <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', py: 3 }}>
              Il carrello è vuoto
            </Typography>) }
            

            <Box sx={{ my: 2, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#ff8400',
                color: '#111',
                fontWeight: 900,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#ff9d2e',
                }
              }}
              component={Link}
              to='/cart'
              onClick={handleCartClose}
            >

              Vai all'ordine
            </Button>
          </Box>
        </Popover>
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
