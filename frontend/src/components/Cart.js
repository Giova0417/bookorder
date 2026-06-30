import React, { useEffect, useState } from 'react';
import '../Cart.css';
import { Box, Typography, Card, CardContent, Button, Alert, TextField, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { getAccessToken } from '../api/client';
import { creaOrdine } from '../api/orders';
import { caricaMiePrenotazioni } from '../api/tavoli';
import { calcolaTotale, formatPrice } from '../utils';
import CartItem from './CartItem';

function Cart() {
    const { cartItems, addItem, decreaseItem, totalQuantity, clearCart } = useCart();
    const subtotal = calcolaTotale(cartItems);

    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [prenotazioneScelta, setPrenotazioneScelta] = useState('');

    useEffect(function caricaPrenotazioni() {
        if (!getAccessToken()) return;

        async function carica() {
            try {
                const lista = await caricaMiePrenotazioni();
                setPrenotazioni(lista);
                if (lista.length > 0) setPrenotazioneScelta(lista[0]._id);
            } catch (e) {
                console.log('Prenotazioni non caricate');
            }
        }

        carica();
    }, []);

    async function handleOrder() {
        setErrore('');
        setSuccesso('');

        if (!getAccessToken()) {
            setErrore('Devi effettuare il login prima di ordinare');
            return;
        }

        if (prenotazioni.length === 0) {
            setErrore('Devi prima prenotare un tavolo');
            return;
        }

        const prenotazione = prenotazioni.find(function trova(item) {
            return item._id === prenotazioneScelta;
        });

        if (!prenotazione) {
            setErrore('Seleziona una tua prenotazione');
            return;
        }

        try {
            const dati = await creaOrdine(cartItems, prenotazione.numeroTavolo, prenotazione.orario);
            clearCart();
            setSuccesso(dati.message || 'ORDINE EFFETTUATO CON SUCCESSO');
        } catch (e) {
            setErrore(e.message || 'Ordine non registrato. Controlla la connessione e riprova.');
            setTimeout(function pulisciErrore() { setErrore(''); }, 3000);
        }
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
            color: '#ffffff',
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        Il tuo carrello
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {totalQuantity} {totalQuantity === 1 ? 'prodotto selezionato' : 'prodotti selezionati'}
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
                {successo && <Alert severity="success" sx={{ mb: 3 }}>{successo}</Alert>}

                {cartItems.length === 0 ? (
                    <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                        <CardContent sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 2, p: { xs: 3, md: 5 } }}>
                            <Typography sx={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>Il carrello e vuoto</Typography>
                            <Button component={Link} to="/menu" variant="contained" sx={{ mt: 1, backgroundColor: '#ff8400', color: '#111', fontWeight: 900 }}>
                                Vai al menu
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        value={prenotazioneScelta}
                                        onChange={(e) => setPrenotazioneScelta(e.target.value)}
                                        select
                                        label="Tua prenotazione"
                                        variant="standard"
                                        sx={{
                                            p: 2,
                                            background: '#00000069',
                                            borderRadius: 5,
                                            border: '2px solid #ff7300',
                                            '& .MuiInputLabel-root': { color: '#ffffff', fontWeight: 800 },
                                            '& .MuiInputBase-root': { color: '#ffffff' },
                                            '& .MuiSelect-icon': { color: '#ff8400' },
                                        }}
                                    >
                                        {prenotazioni.map((prenotazione) => (
                                            <MenuItem key={prenotazione._id} value={prenotazione._id}>
                                                Tavolo {prenotazione.numeroTavolo} - {prenotazione.orario}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {prenotazioni.length === 0 && (
                                        <Alert severity="warning">
                                            Devi prenotare un tavolo prima di ordinare.
                                            <Button component={Link} to="/tavoli" sx={{ ml: 1, fontWeight: 900 }}>
                                                Prenota
                                            </Button>
                                        </Alert>
                                    )}

                                    {cartItems.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onAdd={() => addItem(item)}
                                            onDecrease={() => decreaseItem(item.id)}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)', position: { md: 'sticky' }, top: { md: 96 } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', mb: 2 }}>Riepilogo</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>Subtotale</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#fff' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>Totale</Typography>
                                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '24px' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={prenotazioni.length === 0}
                                    onClick={handleOrder}
                                    sx={{ backgroundColor: '#ff8400', color: '#111', fontWeight: 900, borderRadius: '12px', py: 1.4, '&:hover': { backgroundColor: '#ff9d2e' } }}
                                >
                                    Conferma ordine
                                </Button>

                                <Button component={Link} to="/menu" fullWidth sx={{ mt: 1, color: '#ff8400', fontWeight: 800 }}>
                                    Continua ad aggiungere
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Cart;
