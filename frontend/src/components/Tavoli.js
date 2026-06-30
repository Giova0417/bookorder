import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { caricaTavoli, orariPrenotazione, prenotaTavolo, eliminaMiaPrenotazione } from '../api/tavoli';

function Tavoli() {
    const [tavoli, setTavoli] = useState([]);
    const [orario, setOrario] = useState(orariPrenotazione[0]);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [loading, setLoading] = useState(true);
    const ultimoOrarioRichiesto = useRef(orario);

    const aggiornaTavoli = useCallback(async function aggiornaTavoli(orarioScelto) {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login per prenotare un tavolo');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setTavoli([]);
            ultimoOrarioRichiesto.current = orarioScelto;
            const nuoviTavoli = await caricaTavoli(orarioScelto);
            if (ultimoOrarioRichiesto.current === orarioScelto) {
                setTavoli(nuoviTavoli);
                setErrore('');
            }
        } catch (e) {
            if (ultimoOrarioRichiesto.current === orarioScelto) {
                setErrore(e.message || 'Errore nel caricamento dei tavoli');
            }
        } finally {
            if (ultimoOrarioRichiesto.current === orarioScelto) {
                setLoading(false);
            }
        }
    }, []);

    async function handlePrenota(numeroTavolo) {
        try {
            setErrore('');
            setSuccesso('');
            const dati = await prenotaTavolo(numeroTavolo, orario);

            setSuccesso(dati.message || 'Tavolo prenotato con successo');
            setTimeout(() => setSuccesso(''), 3000);

            await aggiornaTavoli(orario);
        } catch (e) {
            setErrore(e.message || 'Prenotazione non riuscita');
        }
    }

    async function handleAnnulla(idPrenotazione) {
        if (!idPrenotazione) {
            setErrore('Prenotazione non valida');
            return;
        }

        try {
            setErrore('');
            setSuccesso('');
            const dati = await eliminaMiaPrenotazione(idPrenotazione);

            setSuccesso(dati.message || 'Prenotazione annullata!');
            setTimeout(() => setSuccesso(''), 3000);

            await aggiornaTavoli(orario);
        } catch (e) {
            setErrore(e.message || 'Impossibile annullare la prenotazione');
        }
    }

    useEffect(function avviaPaginaTavoli() {
        aggiornaTavoli(orario);
    }, [orario, aggiornaTavoli]);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        Prenota un tavolo
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        Scegli orario e tavolo libero.
                    </Typography>
                </Box>

                <TextField
                    select
                    value={orario}
                    onChange={(e) => {
                        setErrore('');
                        setSuccesso('');
                        setOrario(e.target.value);
                    }}
                    variant="outlined"
                    sx={{
                        mb: 4,
                        minWidth: 160,
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        '& fieldset': { border: 'none' },
                        '& .MuiSelect-select': { fontWeight: 'bold' }
                    }}
                    SelectProps={{
                        sx: {
                            cursor: 'pointer',
                            '& .MuiSelect-select': { cursor: 'pointer' },
                        },
                    }}
                >
                    {orariPrenotazione.map((item) => (
                        <MenuItem key={item} value={item} sx={{ fontWeight: 'bold' }}>{item}</MenuItem>
                    ))}
                </TextField>

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
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {tavoli.map((tavolo) => (
                            <Card key={`${tavolo.numero}-${orario}`} sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                        Tavolo {tavolo.numero}
                                    </Typography>

                                    <Typography sx={{ color: tavolo.miaPrenotazione ? '#3399ff' : (tavolo.libero ? '#4dff88' : '#ff8400'), fontWeight: 900, mt: 1 }}>
                                        {tavolo.miaPrenotazione ? 'Tua Prenotazione' : (tavolo.libero ? 'Libero' : 'Occupato')}
                                    </Typography>

                                    {tavolo.miaPrenotazione ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={!tavolo.prenotazione || !tavolo.prenotazione._id}
                                            onClick={() => handleAnnulla(tavolo.prenotazione && tavolo.prenotazione._id)}
                                            sx={{ mt: 3, backgroundColor: '#f44336', color: '#fff', fontWeight: 900, '&:hover': { backgroundColor: '#d32f2f' } }}
                                        >
                                            Annulla
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={!tavolo.libero}
                                            onClick={() => handlePrenota(tavolo.numero)}
                                            sx={{ mt: 3, backgroundColor: '#ff8400', color: '#111', fontWeight: 900, '&:hover': { backgroundColor: '#e67300' } }}
                                        >
                                            Prenota
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Tavoli;
