import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_BASE_URL, apiFetch, refreshAccessToken } from '../api/client';

const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

function statoSx(stato) {
    if (stato === 'In preparazione') {
        return {
            backgroundColor: '#ff8400',
            color: '#111',
        };
    }

    if (stato === 'Pronto' || stato === 'Consegnato' || stato === 'Completato') {
        return {
            backgroundColor: '#2e7d32',
            color: '#fff',
        };
    }

    return {
        backgroundColor: '#333',
        color: '#fff',
    };
}

function totaleOrdine(ordine) {
    return ordine.cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
}

function OrdineCard({ ordine }) {
    return (
        <Card sx={{
            backgroundColor: '#242424',
            borderRadius: '18px',
            border: '1px solid rgba(255,132,0,0.24)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
        }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    flexWrap: 'wrap',
                }}>
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                            Ordine #{ordine.numeroOrdine}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                            {ordine.cartItems.length} {ordine.cartItems.length === 1 ? 'prodotto' : 'prodotti'}
                        </Typography>
                    </Box>

                    <Chip
                        label={ordine.stato}
                        sx={{
                            ...statoSx(ordine.stato),
                            fontWeight: 900,
                            borderRadius: '10px',
                        }}
                    />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
                    {ordine.cartItems.map((item) => (
                        <Box
                            key={`${ordine._id}-${item.id}`}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr) auto',
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{
                                    color: '#fff',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {item.nome}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
                                    {item.quantita} x {formatPrice(item.prezzo)}
                                </Typography>
                            </Box>

                            <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                {formatPrice(item.prezzo * item.quantita)}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900 }}>
                        Totale
                    </Typography>
                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '20px' }}>
                        {formatPrice(totaleOrdine(ordine))}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

function Ordini() {
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);
    const [ultimoAggiornamento, setUltimoAggiornamento] = useState('');

    const caricaOrdini = async (mostraLoading) => {
        const token = localStorage.getItem('token');

        if (!token) {
            setErrore('Devi effettuare il login per vedere i tuoi ordini');
            setOrdini([]);
            setLoading(false);
            return;
        }

        try {
            if (mostraLoading) {
                setLoading(true);
            }

            const risposta = await apiFetch('/api/order', {
                method: 'GET',
            });

            const dati = await risposta.json();

            if (!risposta.ok) {
                setErrore(dati.message || 'Ordini non disponibili');
                setOrdini([]);
                return;
            }

            setErrore('');
            setOrdini(dati.ordini || []);
            setUltimoAggiornamento(new Date().toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }));
        }
        catch (errore) {
            setErrore('Errore di connessione al server');
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        caricaOrdini(true);
        const token = localStorage.getItem('token');

        if (!token) {
            return undefined;
        }

        let active = true;
        const socket = io(API_BASE_URL, {
            auth: { token },
        });

        const aggiornaOrdini = () => {
            caricaOrdini(false);
        };

        socket.on('orderCreated', aggiornaOrdini);
        socket.on('orderUpdated', aggiornaOrdini);
        socket.on('connect_error', async () => {
            const nuovoToken = await refreshAccessToken();

            if (!active || !nuovoToken) {
                return;
            }

            socket.auth = { token: nuovoToken };
            socket.connect();
        });

        return () => {
            active = false;
            socket.disconnect();
        };
    }, []);

    const ordiniConNumero = ordini.map((ordine, index) => ({
        ...ordine,
        numeroOrdine: ordini.length - index,
    }));
    const ordiniInPreparazione = ordiniConNumero.filter((ordine) => ordine.stato === 'In preparazione');

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 4,
                }}>
                    <Box>
                        <Typography sx={{
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: { xs: '32px', md: '44px' },
                            lineHeight: 1,
                        }}>
                            I tuoi ordini
                        </Typography>
                        <Typography sx={{
                            color: 'rgba(0, 0, 0, 0.66)',
                            fontSize: { xs: '14px', md: '16px' },
                            mt: 1,
                        }}>
                            {ordiniInPreparazione.length} in preparazione
                        </Typography>
                    </Box>

                    {ultimoAggiornamento && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 800 }}>
                            Aggiornato alle {ultimoAggiornamento}
                        </Typography>
                    )}
                </Box>

                {errore && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            backgroundColor: '#2a1d1d',
                            color: '#ffffff',
                            border: '1px solid rgba(255,132,0,0.35)',
                            '& .MuiAlert-icon': {
                                color: '#ff8400',
                            },
                        }}
                    >
                        {errore}
                    </Alert>
                )}

                {errore.includes('login') && (
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        sx={{
                            mb: 3,
                            backgroundColor: '#ff8400',
                            color: '#111',
                            fontWeight: 900,
                            borderRadius: '12px',
                            px: 4,
                            py: 1.2,
                            '&:hover': {
                                backgroundColor: '#ff9d2e',
                            },
                        }}
                    >
                        Vai al login
                    </Button>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : (!errore || ordini.length > 0) && (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '340px minmax(0, 1fr)' },
                        gap: 3,
                        alignItems: 'start',
                    }}>
                        <Card sx={{
                            backgroundColor: '#242424',
                            borderRadius: '18px',
                            border: '1px solid rgba(255,132,0,0.24)',
                            boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', mb: 2 }}>
                                    In preparazione
                                </Typography>

                                {ordiniInPreparazione.length === 0 ? (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>
                                        Nessun ordine in preparazione
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {ordiniInPreparazione.map((ordine) => (
                                            <Box
                                                key={ordine._id}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    backgroundColor: '#1d1d1d',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                <Typography sx={{ color: '#fff', fontWeight: 900 }}>
                                                    Ordine #{ordine.numeroOrdine}
                                                </Typography>
                                                <Typography sx={{ color: '#ff8400', fontWeight: 900, mt: 0.5 }}>
                                                    {formatPrice(totaleOrdine(ordine))}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {ordini.length === 0 && !errore ? (
                                <Card sx={{
                                    backgroundColor: '#242424',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(255,132,0,0.24)',
                                }}>
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                            Nessun ordine trovato
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to="/menu"
                                            variant="contained"
                                            sx={{
                                                mt: 2,
                                                backgroundColor: '#ff8400',
                                                color: '#111',
                                                fontWeight: 900,
                                                borderRadius: '12px',
                                                '&:hover': {
                                                    backgroundColor: '#ff9d2e',
                                                },
                                            }}
                                        >
                                            Vai al menu
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                ordiniConNumero.map((ordine) => (
                                    <OrdineCard key={ordine._id} ordine={ordine} />
                                ))
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Ordini;
