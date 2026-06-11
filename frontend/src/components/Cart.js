import React, { useState } from 'react';
import '../Cart.css';
import {
    Box, Typography, Card, CardContent,
    Button, IconButton, Alert, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { getAccessToken } from '../api/client';
import { creaOrdine } from '../api/orders';

const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

// Array di stringhe fuori dal componente: non cambia mai, non ha senso tenerlo dentro
// dove verrebbe ricreato ad ogni render.
const tavoli = ['1', '2', '3', '4', '5', '6'];

// Oggetto di stili condiviso tra tutti i bottoni quantità: definito fuori dal componente
// per la stessa ragione — viene creato una volta sola, non ad ogni render.
const quantityButtonSx = {
    width: 38,
    height: 38,
    borderRadius: '10px',
    backgroundColor: '#161616',
    color: '#ff8400',
    border: '1px solid rgba(255,132,0,0.22)',
    '&:hover': { backgroundColor: '#211a14', borderColor: '#ff8400' },
};

function Cart() {
    // useCart() legge i dati dal CartContext (stato globale del carrello).
    // cartItems è l'array dei prodotti nel carrello, addItem/decreaseItem li modificano,
    // totalQuantity è il totale degli articoli, clearCart svuota il carrello.
    // Questi dati arrivano "dall'alto" tramite il Context — non sono props dirette.
    const { cartItems, addItem, decreaseItem, totalQuantity, clearCart } = useCart();

    // subtotal è un dato derivato da cartItems: si ricalcola automaticamente ad ogni render.
    // .reduce() accumula un valore sommando tutti gli elementi: parte da sum=0 e aggiunge
    // (prezzo × quantità) per ogni articolo.
    const subtotal = cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);

    // Stato locale del componente Cart: errore, successo e numero tavolo.
    // Sono locali perché servono solo qui — non ha senso metterli nel Context globale.
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [numeroTavolo, setNumeroTavolo] = useState('');

    async function handleOrder() {
        setErrore('');
        setSuccesso('');

        // Validazione lato client: controlla i dati prima di fare la chiamata al server,
        // per un feedback immediato all'utente senza aspettare la rete.
        if (!numeroTavolo) { setErrore('Seleziona il tavolo'); return; }
        if (!getAccessToken()) { setErrore('Devi effettuare il login prima di ordinare'); return; }

        try {
            const dati = await creaOrdine({ cartItems, numeroTavolo });
            clearCart();
            setSuccesso(dati.message || 'ORDINE EFFETTUATO CON SUCCESSO');
        } catch (e) {
            setErrore(e.message || 'Ordine non registrato. Controlla la connessione e riprova.');
            setTimeout(() => setErrore(''), 3000);
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
                    {/* Ternario per il plurale: totalQuantity === 1 → "prodotto", altrimenti "prodotti" */}
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {totalQuantity} {totalQuantity === 1 ? 'prodotto selezionato' : 'prodotti selezionati'}
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
                {successo && <Alert severity="success" sx={{ mb: 3 }}>{successo}</Alert>}

                {/* Ternario principale: carrello vuoto → messaggio, altrimenti → layout con prodotti */}
                {cartItems.length === 0 ? (
                    <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                        <CardContent sx={{
                            minHeight: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 2,
                            p: { xs: 3, md: 5 },
                        }}>
                            <Typography sx={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>
                                Il carrello è vuoto
                            </Typography>
                            <Typography sx={{ maxWidth: 420, color: 'rgba(255,255,255,0.62)' }}>
                                Scegli qualcosa dal menu e lo troverai qui pronto per l'ordine.
                            </Typography>
                            <Button component={Link} to="/menu" variant="contained" sx={{
                                mt: 1, backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                                borderRadius: '12px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#ff9d2e' },
                            }}>
                                Vai al menu
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* TextField controllato: value e onChange lavorano insieme.
                                        value={numeroTavolo} lega il valore mostrato allo stato React.
                                        onChange aggiorna lo stato ad ogni selezione dell'utente.
                                        Senza onChange il campo sarebbe "read-only" — React blocca
                                        le modifiche agli input che hanno value senza onChange. */}
                                    <TextField
                                        value={numeroTavolo}
                                        onChange={(e) => setNumeroTavolo(e.target.value)}
                                        className="numero-tavolo"
                                        select
                                        label="Numero tavolo"
                                        variant="standard"
                                        sx={{
                                            p: 2,
                                            background: '#00000069',
                                            borderRadius: 5,
                                            border: '2px solid #ff7300',
                                            '& .MuiInputLabel-root': { color: '#ffffff', fontWeight: 800 },
                                            '& .MuiInputLabel-root.Mui-focused': { color: '#ff8400' },
                                            '& .MuiInputBase-root': { color: '#ffffff' },
                                            '& .MuiSelect-icon': { color: '#ff8400' },
                                            '& .MuiInput-root:before': { borderBottomColor: 'rgba(255,255,255,0.25)' },
                                            '& .MuiInput-root:hover:before': { borderBottomColor: '#ff8400' },
                                            '& .MuiInput-root:after': { borderBottomColor: '#ff8400' },
                                        }}
                                        slotProps={{
                                            select: {
                                                MenuProps: {
                                                    slotProps: {
                                                        paper: {
                                                            sx: {
                                                                backgroundColor: '#181818',
                                                                borderRadius: '14px',
                                                                '& .MuiMenuItem-root': { color: '#fff', fontWeight: 800 },
                                                                '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(255,132,0,0.18)' },
                                                                '& .MuiMenuItem-root.Mui-selected': { backgroundColor: 'rgba(255,132,0,0.28)', color: '#ff8400' },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {/* .map() sull'array tavoli per creare i MenuItem senza ripetere il codice 6 volte */}
                                        {tavoli.map((n) => (
                                            <MenuItem key={n} value={n}>Tavolo {n}</MenuItem>
                                        ))}
                                    </TextField>

                                    {/* .map() su cartItems: per ogni prodotto nel carrello crea una riga.
                                        key={item.id} è obbligatorio: React lo usa per identificare
                                        quale riga aggiornare quando la quantità cambia. */}
                                    {cartItems.map((item) => (
                                        <Box key={item.id} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '86px minmax(0, 1fr)',
                                            gap: 1.5,
                                            alignItems: 'center',
                                            p: 1.5,
                                            borderRadius: '14px',
                                            backgroundColor: '#1d1d1d',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                        }}>
                                            <Box component="img" src={item.img} alt={item.nome} sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px' }} />
                                            <Box>
                                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '17px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.nome}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.56)', fontSize: '14px', mt: 0.5 }}>
                                                    {formatPrice(item.prezzo)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/* onClick={() => decreaseItem(item.id)}: arrow function necessaria
                                                            per passare l'id del prodotto specifico.
                                                            item è la variabile del .map() corrente — ogni bottone
                                                            "cattura" il proprio item grazie alla closure JavaScript. */}
                                                        <IconButton onClick={() => decreaseItem(item.id)} sx={quantityButtonSx}><RemoveIcon /></IconButton>
                                                        <Typography sx={{ color: '#fff', minWidth: 24, textAlign: 'center', fontWeight: 900 }}>{item.quantita}</Typography>
                                                        <IconButton onClick={() => addItem(item)} sx={quantityButtonSx}><AddIcon /></IconButton>
                                                    </Box>
                                                    <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>{formatPrice(item.prezzo * item.quantita)}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* position: sticky fa sì che il riepilogo rimanga visibile mentre si scrolla la lista */}
                        <Card sx={{
                            backgroundColor: '#242424',
                            borderRadius: '18px',
                            border: '1px solid rgba(255,132,0,0.24)',
                            position: { md: 'sticky' },
                            top: { md: 96 },
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', mb: 2 }}>Riepilogo</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>Subtotale</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#fff' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>Servizio</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#fff' }}>{formatPrice(0)}</Typography>
                                </Box>

                                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>Totale</Typography>
                                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '24px' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                {/* onClick={handleOrder} senza (): passa il riferimento alla funzione,
                                    non il risultato. React chiamerà handleOrder() quando l'utente clicca. */}
                                <Button fullWidth variant="contained" onClick={handleOrder} sx={{
                                    backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                                    borderRadius: '12px', py: 1.4, '&:hover': { backgroundColor: '#ff9d2e' },
                                }}>
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
