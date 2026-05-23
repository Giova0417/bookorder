import React, { useState } from 'react';
import '../Login.css';
import { Box, Typography, TextField, Card, CardContent, Button , Alert} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
   const [errore, setErrore] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();

   const handleLogin = async () => {
      try {
         setErrore('');
         const risposta = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               email,
               password,
            })

         });
         const dati = await risposta.json();
         if (!risposta.ok) {
            setErrore(dati.message || 'Login non riuscito');
            setTimeout(() => {
               setErrore('');
            }, 3000);
            return;
         }

         localStorage.setItem('token', dati.token);
         navigate('/menu');

      } catch (error) {
         setErrore('Errore di connessione al server');
         setTimeout(() => {
            setErrore('');
         }, 3000);
      }
   }
   return (
      <Box sx={{
         background: 'linear-gradient(135deg, #ff8400 0%, #e89211 50%, #2d2825 100%)',
         height: '100vh',
         py: { xs: '20%', md: '5%' },
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
      }}>
         <Card sx={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#2a2a2a',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
            overflow: 'hidden',
         }}>
            <CardContent sx={{
               p: { xs: 3, sm: 4 },
               display: 'flex',
               flexDirection: 'column',
               gap: 2,
            }}>
               <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Typography sx={{
                     color: '#ffffff',
                     fontWeight: 900,
                     fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                     letterSpacing: 0,
                     fontSize: { xs: '34px', sm: '44px' },
                     lineHeight: 1,
                     textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
                  }}
                  >Login
                  </Typography>
                  <Typography sx={{
                     color: 'rgba(255,255,255,0.65)',
                     fontSize: { xs: '14px', sm: '15px' },
                     mt: 1,
                  }}>
                     Entra nel team
                  </Typography>
               </Box>


               <TextField label="Email"
                  variant="standard"
                  fullWidth
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }} />
               <TextField value={password}
                  onChange={(event) => setPassword(event.target.value)} label="Password" type="password" fullWidth variant="standard" sx={{ p: 2, bgcolor: 'rgb(255, 255, 255)', borderRadius: 5 }} />
               {errore && <Alert severity="error">{errore}</Alert>}
            </CardContent>
            <Box sx={{
               p: 2,
               textAlign: 'center',
               background: 'rgba(0,0,0,0.18)',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               gap: 1,
               flexWrap: 'wrap',
            }}>
               <Button variant="contained" fullWidth onClick={handleLogin} sx={{
                  background: '#ff8400',
                  color: '#000000',
                  borderRadius: '300px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                  py: 1.4,
                  mt: 1,
                  boxShadow: '0 8px 24px rgba(255,132,0,0.32)',
                  '&:hover': {
                     background: '#ff6200',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 12px 32px rgba(255,132,0,0.45)',
                  },
                  transition: 'all 0.2s',
               }
               } >
                  Accedi
               </Button>
               <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>Non hai un account?</Typography>
               <Button component={Link} to='/register' sx={{
                  color: '#ff8400',
                  fontWeight: 'bold',
                  fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                  borderRadius: '300px',
                  px: 2,
                  '&:hover': {
                     backgroundColor: 'rgba(255,132,0,0.12)',
                  }
               }}> Registrati </Button>
            </Box>
         </Card >


      </Box >
   )

}
export default Login
