import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { caricaOrdiniCliente } from '../api/orders';
import { collegaRealtimeOrdini } from '../api/realtime';

const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

function statoSx(stato) {
    if (stato === 'In preparazione') return { backgroundColor: '#ff8400', color: '#111' };
    if (stato === 'Pronto' || stato === 'Consegnato' || stato === 'Completato') return { backgroundColor: '#2e7d32', color: '#fff' };
    return { backgroundColor: '#333', color: '#fff' };
}

function totaleOrdine(ordine) {
    return ordine.cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
}

// React.memo "memorizza" il componente: OrdineCard viene ri-renderizzata SOLO se
// le sue props cambiano. Senza memo, ogni aggiornamento di stato in Ordini (il genitore)
// causerebbe il ri-render di TUTTE le card, anche quelle non cambiate.
// Con memo: se arriva un orderUpdated per l'ordine #3, solo quella card si aggiorna.
//
// React.memo fa un confronto superficiale (shallow): per ogni prop controlla
// se il riferimento è cambiato. Ecco perché passiamo ordine dall'array originale
// (non da ordiniConNumero che crea nuovi oggetti) e numeroOrdine come numero separato.
const OrdineCard = React.memo(function OrdineCard({ ordine, numeroOrdine }) {
    return (
        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                            Ordine #{numeroOrdine}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                            {ordine.cartItems.length} {ordine.cartItems.length === 1 ? 'prodotto' : 'prodotti'}
                        </Typography>
                    </Box>
                    <Typography sx={{ ...statoSx(ordine.stato), fontWeight: 900, fontSize: '13px', borderRadius: '8px', px: 1.5, py: 0.5 }}>
                        {ordine.stato}
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
                    {ordine.cartItems.map((item) => (
                        <Box key={`${ordine._id}-${item.id}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900 }}>Totale</Typography>
                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '20px' }}>
                        {formatPrice(totaleOrdine(ordine))}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
});

function Ordini() {
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);

    async function caricaOrdini(mostraLoading = false) {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login per vedere i tuoi ordini');
            setOrdini([]);
            if (mostraLoading) setLoading(false);
            return;
        }
        if (mostraLoading) setLoading(true);
        try {
            const lista = await caricaOrdiniCliente();
            setErrore('');
            setOrdini(lista);
        } catch (e) {
            setErrore(e.message || 'Errore di connessione al server');
        } finally {
            if (mostraLoading) setLoading(false);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        caricaOrdini(true);
        const token = getAccessToken();
        if (!token) return;

        // Il callback riceve (tipo, data) da realtime.js.
        // 'updated': il backend manda { orderId, stato } — abbiamo tutto per aggiornare
        //            localmente senza toccare la rete. Solo la card di quell'ordine si aggiorna.
        // 'created': è arrivato un nuovo ordine, non abbiamo i suoi dati → fetch completo.
        return collegaRealtimeOrdini(token, (tipo, data) => {
            if (tipo === 'updated') {
                setOrdini((prev) => {
                    const existing = prev.find((o) => o._id === data.orderId);
                    // Early return: se lo stato è già aggiornato o l'ordine non esiste,
                    // restituiamo prev invariato → React non vede nessun cambio → nessun re-render.
                    if (!existing || existing.stato === data.stato) return prev;
                    return prev.map((o) => o._id === data.orderId ? { ...o, stato: data.stato } : o);
                });
            } else {
                caricaOrdini();
            }
        });
    }, []);

    // ordiniConNumero serve solo al pannello sinistro per mostrare "Ordine #N".
    // Non viene passato a OrdineCard (userebbe nuovi riferimenti rompendo React.memo).
    const ordiniConNumero = ordini.map((o, i) => ({ ...o, numeroOrdine: ordini.length - i }));
    const ordiniInPreparazione = ordiniConNumero.filter((o) => o.stato === 'In preparazione');

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
                        I tuoi ordini
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {ordiniInPreparazione.length} in preparazione
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

                {errore.includes('login') && (
                    <Button component={Link} to="/login" variant="contained" sx={{
                        mb: 3, backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                        borderRadius: '12px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#ff9d2e' },
                    }}>
                        Vai al login
                    </Button>
                )}

                {loading && ordini.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : (!errore || ordini.length > 0) && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
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
                                            <Box key={ordine._id} sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#1d1d1d', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ color: '#fff', fontWeight: 900 }}>Ordine #{ordine.numeroOrdine}</Typography>
                                                <Typography sx={{ color: '#ff8400', fontWeight: 900, mt: 0.5 }}>{formatPrice(totaleOrdine(ordine))}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {ordini.length === 0 ? (
                                <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                            Nessun ordine trovato
                                        </Typography>
                                        <Button component={Link} to="/menu" variant="contained" sx={{
                                            mt: 2, backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                                            borderRadius: '12px', '&:hover': { backgroundColor: '#ff9d2e' },
                                        }}>
                                            Vai al menu
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                // Passiamo ordine dall'array originale (riferimento stabile)
                                // e numeroOrdine come numero separato — così React.memo
                                // confronta correttamente e ri-renderizza solo la card cambiata.
                                ordini.map((ordine, index) => (
                                    <OrdineCard
                                        key={ordine._id}
                                        ordine={ordine}
                                        numeroOrdine={ordini.length - index}
                                    />
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
