import React, { useState } from 'react';
import '../Login.css';
import { Box, Typography, TextField, Card, CardContent, Button, Alert, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { registraUtente } from '../api/auth';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('cliente');
    const [staffCode, setStaffCode] = useState('');
    const [errore, setErrore] = useState('');
    const navigate = useNavigate();

    // Chiama registraUtente che crea l'account sul server.
    // La registrazione non fa login automatico — reindirizza al login.
    // staffCode viene inviato sempre, ma il server lo ignora se role !== 'staff'.
    const handleRegister = async () => {
        try {
            setErrore('');
            await registraUtente({ name, email, password, role, staffCode });
            navigate('/login');
        } catch (error) {
            setErrore(error.message || 'Errore di connessione al server');
            setTimeout(() => setErrore(''), 3000);
        }
    };

    return (
        <Box sx={{
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            height: '100vh',
            py: { xs: '20%', md: '5%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
                <CardContent sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                        <Typography sx={{
                            color: '#ffffff',
                            fontWeight: 900,
                            fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                            fontSize: { xs: '34px', sm: '44px' },
                            lineHeight: 1,
                            textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
                        }}>
                            Registrati
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: { xs: '14px', sm: '15px' }, mt: 1 }}>
                            Crea il tuo account Book&Order
                        </Typography>
                    </Box>

                    <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)}
                        variant="standard" fullWidth sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }} />

                    <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                        variant="standard" fullWidth sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }} />

                    <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        type="password" fullWidth variant="standard" sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }} />

                    {/* Select per scegliere il ruolo. Il valore iniziale è 'cliente'. */}
                    <TextField select label="Tipo account" value={role} onChange={(e) => setRole(e.target.value)}
                        variant="standard" fullWidth sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }}>
                        <MenuItem value="cliente">Cliente</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                    </TextField>

                    {/* Il campo codice staff appare solo se l'utente seleziona il ruolo 'staff'.
                        Il server verifica questo codice segreto prima di creare un account staff. */}
                    {role === 'staff' && (
                        <TextField label="Codice staff" value={staffCode} onChange={(e) => setStaffCode(e.target.value)}
                            type="password" fullWidth variant="standard" sx={{ p: 2, background: 'rgb(255, 255, 255)', borderRadius: 5 }} />
                    )}

                    {errore && <Alert severity="error">{errore}</Alert>}

                    <Button variant="contained" fullWidth onClick={handleRegister} sx={{
                        background: '#ff8400',
                        color: '#000000',
                        borderRadius: '300px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                        py: 1.4,
                        mt: 1,
                        boxShadow: '0 8px 24px rgba(255,132,0,0.32)',
                        '&:hover': { background: '#ff6200', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(255,132,0,0.45)' },
                        transition: 'all 0.2s',
                    }}>
                        Registrati
                    </Button>
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
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)' }}>Hai già un account?</Typography>
                    <Button component={Link} to="/login" sx={{
                        color: '#ff8400',
                        fontWeight: 'bold',
                        fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                        borderRadius: '300px',
                        px: 2,
                        '&:hover': { backgroundColor: 'rgba(255,132,0,0.12)' },
                    }}>
                        Accedi
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}

export default Register;
