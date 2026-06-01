import React, { useEffect, useRef, useState } from 'react';
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

const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];
const TEMPO_USCITA_ORDINE = 260;
const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

function totaleOrdine(ordine) {
    return ordine.cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
}

function statoSx(stato) {
    if (stato === 'In preparazione') {
        return { backgroundColor: '#ff8400', color: '#111' };
    }

    if (stato === 'Pronto') {
        return { backgroundColor: '#1976d2', color: '#fff' };
    }

    return { backgroundColor: '#2e7d32', color: '#fff' };
}

function StaffOrders() {
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);
    const [ultimoAggiornamento, setUltimoAggiornamento] = useState('');
    const [ordiniInUscita, setOrdiniInUscita] = useState([]);
    const ordiniInUscitaRef = useRef(new Set());

    const filtraOrdiniStaff = (listaOrdini) => {
        return listaOrdini.filter((ordine) => {
            return ordine.stato !== 'Consegnato' || ordiniInUscitaRef.current.has(ordine._id);
        });
    };

    const nascondiOrdineConsegnato = (ordineId) => {
        ordiniInUscitaRef.current.add(ordineId);
        setOrdiniInUscita(Array.from(ordiniInUscitaRef.current));

        window.setTimeout(() => {
            ordiniInUscitaRef.current.delete(ordineId);
            setOrdiniInUscita(Array.from(ordiniInUscitaRef.current));
            setOrdini((ordiniCorrenti) => ordiniCorrenti.filter((ordine) => ordine._id !== ordineId));
        }, TEMPO_USCITA_ORDINE);
    };

    const caricaOrdini = async (mostraLoading) => {
        const token = localStorage.getItem('token');

        if (!token) {
            setErrore('Devi effettuare il login come staff');
            setLoading(false);
            return;
        }

        try {
            if (mostraLoading) {
                setLoading(true);
            }

            const risposta = await apiFetch('/api/order/staff', {
                method: 'GET',
            });
            const dati = await risposta.json();

            if (!risposta.ok) {
                setErrore(dati.message || 'Ordini staff non disponibili');
                setOrdini([]);
                return;
            }

            setErrore('');
            setOrdini(filtraOrdiniStaff(dati.ordini || []));
            setUltimoAggiornamento(new Date().toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }));
        } catch (errore) {
            setErrore('Errore di connessione al server');
        } finally {
            setLoading(false);
        }
    };

    const cambiaStato = async (ordineId, stato) => {
        try {
            const risposta = await apiFetch(`/api/order/staff/${ordineId}/stato`, {
                method: 'PATCH',
                body: JSON.stringify({ stato }),
            });
            const dati = await risposta.json();

            if (!risposta.ok) {
                setErrore(dati.message || 'Stato non aggiornato');
                return;
            }

            setErrore('');
            if (stato === 'Consegnato') {
                setOrdini((ordiniCorrenti) => {
                    return ordiniCorrenti.map((ordine) => {
                        if (ordine._id !== ordineId) {
                            return ordine;
                        }

                        return dati.ordine || {
                            ...ordine,
                            stato,
                        };
                    });
                });
                nascondiOrdineConsegnato(ordineId);
                return;
            }

            await caricaOrdini(false);
        } catch (errore) {
            setErrore('Errore durante aggiornamento stato');
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
        const aggiornaOrdini = () => caricaOrdini(false);

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

    const ordiniInPreparazione = ordini.filter((ordine) => ordine.stato === 'In preparazione').length;
    const ordiniPronti = ordini.filter((ordine) => ordine.stato === 'Pronto').length;

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
                            Staff ordini
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.68)', fontWeight: 800, mt: 1 }}>
                            {ordiniInPreparazione} in preparazione / {ordiniPronti} pronti
                        </Typography>
                    </Box>

                    {ultimoAggiornamento && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 800 }}>
                            Aggiornato alle {ultimoAggiornamento}
                        </Typography>
                    )}
                </Box>

                {errore && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errore}
                    </Alert>
                )}

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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                        {ordini.length === 0 && !errore ? (
                            <Card sx={{ backgroundColor: '#242424', borderRadius: '18px' }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                        Nessun ordine in sala
                                    </Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            ordini.map((ordine) => {
                                const ordineInUscita = ordiniInUscita.includes(ordine._id);

                                return (
                                <Card key={ordine._id} sx={{
                                    backgroundColor: '#242424',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(255,132,0,0.24)',
                                    opacity: ordineInUscita ? 0 : 1,
                                    transform: ordineInUscita ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)',
                                    transition: 'opacity 220ms ease, transform 220ms ease',
                                    pointerEvents: ordineInUscita ? 'none' : 'auto',
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                                            <Box>
                                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                                                    Tavolo {ordine.numeroTavolo}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                                                    Ordine {ordine.id_ordine}
                                                </Typography>
                                            </Box>
                                            <Chip label={ordine.stato} sx={{ ...statoSx(ordine.stato), fontWeight: 900 }} />
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {ordine.cartItems.map((item) => (
                                                <Box key={`${ordine._id}-${item.id}`} sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                                                    gap: 2,
                                                }}>
                                                    <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                        {item.quantita} x {item.nome}
                                                    </Typography>
                                                    <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                                        {formatPrice(item.prezzo * item.quantita)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography sx={{ color: '#fff', fontWeight: 900 }}>Totale</Typography>
                                            <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                                {formatPrice(totaleOrdine(ordine))}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {statiOrdine.map((stato) => (
                                                <Button
                                                    key={stato}
                                                    variant={ordine.stato === stato ? 'contained' : 'outlined'}
                                                    onClick={() => cambiaStato(ordine._id, stato)}
                                                    sx={{
                                                        borderColor: '#ff8400',
                                                        color: ordine.stato === stato ? '#111' : '#ff8400',
                                                        backgroundColor: ordine.stato === stato ? '#ff8400' : 'transparent',
                                                        fontWeight: 900,
                                                        '&:hover': {
                                                            backgroundColor: '#ff9d2e',
                                                            color: '#111',
                                                        },
                                                    }}
                                                >
                                                    {stato}
                                                </Button>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                                );
                            })
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default StaffOrders;
