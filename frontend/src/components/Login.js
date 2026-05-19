import React from 'react';
import '../Login.css';
import { Box, Typography, TextField, Card, CardContent, Button } from '@mui/material';

function Login() {
   return (
      <Box sx={{
         background: '#1a1a1a',
         minHeight: '100vh',
         py: '5%'
      }}>
         <Card sx={{
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            maxWidth: 420,
            width: '100%',
            height:'70vh',
            borderRadius:'35px',
            mx: 'auto',
            display:'flex',
            flexDirection:'column',
            overflow: 'hidden'
         }}>
            <CardContent sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
               <Typography variant="h4" sx={{ color: '#fff', textAlign:'center', fontWeight: 900,fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
   letterSpacing: '2px'}}>Login</Typography>

               <TextField label="Email" variant="standard" fullWidth sx={{p:2, background: 'rgba(0, 0, 0, 0.08)', borderRadius: 5}} />
               <TextField label="Password" type="password" fullWidth variant="standard" sx={{ p:2,bgcolor: 'rgba(0, 0, 0, 0.08)', borderRadius: 5}} />

               <Button variant="contained" fullWidth sx={{ background:'black', borderRadius:'30px' ,fontSize:'20px', fontFamily:'"Segoe UI Black", "Arial Black", sans-serif', py: 1.25 }}>
                  Accedi
               </Button>
            </CardContent>

            <Box sx={{ p: 2, textAlign: 'center', background: 'rgba(0,0,0,0.06)' }}>
               <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>Non hai un account? Registrati</Typography>
            </Box>

         </Card>


      </Box>
   )

}
export default Login
