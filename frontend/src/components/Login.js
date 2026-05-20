import React from 'react';
import '../Login.css';
import { Box, Typography, TextField, Card, CardContent, Button} from '@mui/material';
import { Link } from 'react-router-dom';

function Login() {
   return (
      <Box sx={{
         background: '#1a1a1a',
         height: '100vh',
         py: { xs: '20%', md: '5%' },
         display: 'flex',
alignItems: 'center',
justifyContent: 'center'
      }}>
         <Card sx={{
            background: 'linear-gradient(135deg, #ff8400 0%, #e89211 50%, #2d2825 100%)',
            maxWidth: 700,
            width: { xs: '90%', md: '70%' },
            height: { xs: '70%', md: '70%' },
            borderRadius: '35px',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
         }}>
            <CardContent sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
               <Typography sx={{
                  color: '#fff', textAlign: 'center', fontWeight: 900, fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                  letterSpacing: '2px', fontSize: {
                     xs: '40px',
                     sm: '50px',
                    
                  }
               }}>Login</Typography>

               <TextField label="Email" variant="standard" fullWidth sx={{ p: 2, background: 'rgba(0, 0, 0, 0.08)', borderRadius: 5 }} />
               <TextField label="Password" type="password" fullWidth variant="standard" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.08)', borderRadius: 5 }} />

               <Button variant="contained" fullWidth sx={{ background: 'black', borderRadius: '30px', fontSize: '20px', fontFamily: '"Segoe UI Black", "Arial Black", sans-serif', py: 1.25 }}>
                  Accedi
               </Button>
            </CardContent>

            <Box sx={{ p: 2, textAlign: 'center', background: 'rgba(0,0,0,0.06)' }}>
               <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>Non hai un account?</Typography> <Button component={Link} to='/register' sx={{fontFamily: '"Segoe UI Black", "Arial Black", sans-serif', background: 'black', color:'white', borderRadius:'10px' }}>Registrati</Button>
            </Box>

         </Card>


      </Box>
   )

}
export default Login
