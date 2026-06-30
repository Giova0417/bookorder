import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { caricaPrenotazioniStaff, eliminaPrenotazioneTavolo } from '../api/tavoli';

function StaffTavoli() {
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [loading, setLoading] = useState(true);

    async function aggiornaPrenotazioni() {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login come staff');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setPrenotazioni(await caricaPrenotazioniStaff());
            setErrore('');
        } catch (e) {
            setErrore(e.message || 'Errore nel caricamento delle prenotazioni');
        } finally {
            setLoading(false);
        }
    }

    async function handleElimina(prenotazioneId) {
        try {
            setErrore('');
            setSuccesso('');
            const dati = await eliminaPrenotazioneTavolo(prenotazioneId);
            setSuccesso(dati.message || 'Prenotazione eliminata');
            aggiornaPrenotazioni();
        } catch (e) {
            setErrore(e.message || 'Prenotazione non eliminata');
        }
    }

    useEffect(function avviaPaginaStaffTavoli() {
        aggiornaPrenotazioni();
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
        }}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        Staff tavoli
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.68)', fontWeight: 800, mt: 1 }}>
                        {prenotazioni.length} prenotazioni
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
                {successo && <Alert severity="success" sx={{ mb: 3 }}>{successo}</Alert>}

                {errore.includes('login') && (
                    <Button component={Link} to="/login" variant="contained" sx={{ mb: 3 }}>
                        Vai al login
                    </Button>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : prenotazioni.length === 0 ? (
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                        Nessuna prenotazione
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {prenotazioni.map((prenotazione) => (
                            <Card key={prenotazione._id} sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '22px' }}>
                                            Tavolo {prenotazione.numeroTavolo} - {prenotazione.orario}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.62)', mt: 0.5 }}>
                                            {prenotazione.nomeUtente}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleElimina(prenotazione._id)}
                                        sx={{ backgroundColor: '#ff8400', color: '#111', fontWeight: 900 }}
                                    >
                                        Elimina
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default StaffTavoli;
