import React, { useEffect, useState } from 'react';
// Importiamo Material UI
import { Grow, Box, AppBar, Toolbar, Typography, IconButton, Button, Popover, Badge } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext'
import { API_BASE_URL, apiFetch } from '../api/client';


function Navbar() {
  const { cartItems, totalQuantity } = useCart();
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
      const risposta = await apiFetch('/api/auth/me', {
        method: 'GET',
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
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (errore) {
      console.log('Logout server non disponibile');
    }

    localStorage.removeItem('token');
    setUtente(null);
  };
  const subtotal = cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
  const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

  return (
    // AppBar 
    <AppBar position="fixed" color="warning" sx={{ maxWidth: '100%', background: 'linear-gradient(135deg, #000000 0%, #1c1816 50%, #000000 100%)', }}>
      <Toolbar >
        <Typography variant="h4" component={Link} to="/" sx={{
          flexGrow: 1,
          fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
          fontWeight: 900,
          letterSpacing: 0,
          color: '#ffffff',
          textDecoration: 'none',
          textShadow: '0 3px 10px rgba(0,0,0,0.45)',
        }}>
          Book&Order
        </Typography>
        {/* I pulsanti di Login e carrello a destra */}
        {utente?.role === 'staff' && (
          <Button
            color="inherit"
            component={Link}
            to="/staff"
            sx={{ fontWeight: 900 }}
          >
            Staff
          </Button>
        )}

        <IconButton
          color="inherit"
          size="large"
          component={Link}
          to="/ordini"
        >
          <ReceiptLongIcon />
        </IconButton>

        <IconButton color="inherit"
          size="large"
          onClick={handleCartClick}>
          <Badge
            badgeContent={totalQuantity}
            color="warning"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#ff8400',
                color: '#111',
                fontWeight: 900,
              },
            }}
          >
            <ShoppingCartIcon />
          </Badge>
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
          transitionDuration={180}
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
            {totalQuantity ? (<Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 1.5,
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      fontWeight: 800,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.nome}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, mt: 0.3 }}>
                      {item.quantita} x {formatPrice(item.prezzo)}
                    </Typography>
                  </Box>

                  <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: 14 }}>
                    {formatPrice(item.quantita * item.prezzo)}
                  </Typography>
                </Box>
              ))}
            </Box>) : (<Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', py: 3 }}>
              Il carrello è vuoto
            </Typography>)}


            <Box sx={{ my: 2, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            {totalQuantity > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                  Totale
                </Typography>
                <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: 18 }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Box>
            )}

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
