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

// OrdineCard è un componente figlio: riceve i dati dell'ordine come "prop" dal componente genitore (Ordini).
// Le props sono il meccanismo con cui React passa dati dall'alto verso il basso nell'albero dei componenti
// (flusso dati unidirezionale: genitore → figlio, mai il contrario).
// { ordine } è destructuring: equivale a scrivere function OrdineCard(props) e poi usare props.ordine.
function OrdineCard({ ordine }) {
    return (
        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                            Ordine #{ordine.numeroOrdine}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                            {/* Ternario inline per gestire il plurale */}
                            {ordine.cartItems.length} {ordine.cartItems.length === 1 ? 'prodotto' : 'prodotti'}
                        </Typography>
                    </Box>
                    <Typography sx={{ ...statoSx(ordine.stato), fontWeight: 900, fontSize: '13px', borderRadius: '8px', px: 1.5, py: 0.5 }}>
                        {ordine.stato}
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                {/* .map() trasforma l'array cartItems in una lista di elementi JSX.
                    key={`${ordine._id}-${item.id}`} combina i due ID per garantire unicità
                    anche se lo stesso prodotto appare in ordini diversi. */}
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
}

// Ordini è il componente genitore: gestisce lo stato e passa i dati a OrdineCard tramite props.
// Separare la logica (Ordini) dalla presentazione (OrdineCard) rende il codice più leggibile
// e riutilizzabile — OrdineCard potrebbe essere usata anche in altre parti dell'app.
function Ordini() {
    // useState inizializza lo stato. React garantisce che questi valori persistano
    // tra i re-render del componente (a differenza di variabili normali che vengono
    // ricreate da zero ad ogni chiamata della funzione).
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

    // useEffect con [] vuoto: esegue il codice una sola volta, dopo il primo render.
    // È l'equivalente React del "al caricamento della pagina".
    // Restituisce la cleanup function di collegaRealtimeOrdini che chiude il socket
    // quando il componente si smonta (l'utente cambia pagina).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        caricaOrdini(true);
        const token = getAccessToken();
        if (!token) return;
        return collegaRealtimeOrdini(token, () => caricaOrdini());
    }, []);

    // ordiniConNumero è un dato DERIVATO dallo stato: non serve salvarlo in useState
    // perché viene ricalcolato automaticamente ad ogni render quando ordini cambia.
    // .map() crea un nuovo array aggiungendo la prop numeroOrdine a ogni ordine.
    // Il numero è inverso all'indice (l'ordine più recente ha numero più alto).
    const ordiniConNumero = ordini.map((ordine, index) => ({ ...ordine, numeroOrdine: ordini.length - index }));

    // .filter() crea un nuovo array con solo gli ordini che soddisfano la condizione.
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
                    {/* Dato derivato usato direttamente nel JSX: React lo ricalcola ad ogni render. */}
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {ordiniInPreparazione.length} in preparazione
                    </Typography>
                </Box>

                {/* Rendering condizionale: && mostra il componente solo se la condizione è vera. */}
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
                        {/* Colonna sinistra: pannello degli ordini in preparazione */}
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

                        {/* Colonna destra: lista completa degli ordini.
                            .map() su ordiniConNumero passa ogni ordine al componente figlio OrdineCard
                            tramite la prop ordine={ordine}. OrdineCard non conosce Ordini e non può
                            modificarne lo stato — può solo leggere i dati che riceve. */}
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
                                ordiniConNumero.map((ordine) => <OrdineCard key={ordine._id} ordine={ordine} />)
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Ordini;
