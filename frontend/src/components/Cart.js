import React from 'react';
import '../Cart.css';
import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Divider,
    IconButton,
    Alert,
    TextField,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

const quantityButtonSx = {
    width: 38,
    height: 38,
    borderRadius: '10px',
    backgroundColor: '#161616',
    color: '#ff8400',
    border: '1px solid rgba(255,132,0,0.22)',
    '&:hover': {
        backgroundColor: '#211a14',
        borderColor: '#ff8400',
    },
};

function Cart() {
    const { cartItems, addItem, decreaseItem, totalQuantity, clearCart } = useCart();
    const subtotal = cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [numeroTavolo, setNumeroTavolo] = useState('');
    const handleOrder = async () => {
        try {
            setErrore('');
            setSuccesso('');
            const token = localStorage.getItem('token');
            if(!numeroTavolo){
                setErrore('Seleziona il tavolo');
                return;
            }

            if (!token) {
                setErrore('Devi effettuare il login prima di ordinare');
                return;
            }
            const risposta = await fetch('http://localhost:5000/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    cartItems,
                    numeroTavolo

                })
            })
            const dati = await risposta.json();

            if (!risposta.ok) {
                setErrore(dati.message || 'Ordine non registrato. Riprova.');
                return;
            }

            clearCart();
            setSuccesso(dati.message || 'ORDINE EFFETTUATO CON SUCCESSO');
            console.log('Ordine creato:', dati.ordine);
        }
        catch (errore) {
            setErrore('Ordine non registrato. Controlla la connessione e riprova.');
            setTimeout(() => {
                setErrore('');
            }, 3000);
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
                    <Typography sx={{
                        fontWeight: 900,
                        fontSize: { xs: '32px', md: '44px' },
                        lineHeight: 1,
                    }}>
                        Il tuo carrello
                    </Typography>
                    <Typography sx={{
                        color: 'rgba(0, 0, 0, 0.66)',
                        fontSize: { xs: '14px', md: '16px' },
                        mt: 1,
                    }}>
                        {totalQuantity} {totalQuantity === 1 ? 'prodotto selezionato' : 'prodotti selezionati'}
                    </Typography>
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

                {successo && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            backgroundColor: '#388e29',
                            fontWeight: 'bold',
                            color: '#fefefe',
                            border: '1px solid rgba(255,132,0,0.35)',
                            '& .MuiAlert-icon': {
                                color: '#ff8400',
                            },
                        }}
                    >
                        {successo}
                    </Alert>
                )}

                {cartItems.length === 0 ? (
                    <Card sx={{
                        backgroundColor: '#242424',
                        borderRadius: '18px',
                        border: '1px solid rgba(255,132,0,0.24)',
                        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                    }}>
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
                            <Button
                                component={Link}
                                to="/menu"
                                variant="contained"
                                sx={{
                                    mt: 1,
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
                                Vai al menu
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
                        gap: 3,
                        alignItems: 'start',
                    }}>
                        <Card sx={{
                            backgroundColor: '#242424',
                            borderRadius: '18px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                            overflow: 'hidden',
                        }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        value={numeroTavolo}
                                        onChange={(event) => setNumeroTavolo(event.target.value)}
                                        className="numero-tavolo"
                                        select
                                        label="Numero tavolo"
                                        variant="standard"
                                        sx={{
                                            p: 2,
                                            background: '#00000069',
                                            borderRadius: 5,
                                            border: '2px solid #ff7300',
                                            '& .MuiInputLabel-root': {
                                                color: '#ffffff',
                                                fontWeight: 800,
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#ff8400',
                                            },
                                            '& .MuiInputBase-root': {
                                                color: '#ffffff',
                                            },
                                            '& .MuiSelect-icon': {
                                                color: '#ff8400',
                                            },
                                            '& .MuiInput-root:before': {
                                                borderBottomColor: 'rgba(255,255,255,0.25)',
                                            },
                                            '& .MuiInput-root:hover:before': {
                                                borderBottomColor: '#ff8400',
                                            },
                                            '& .MuiInput-root:after': {
                                                borderBottomColor: '#ff8400',
                                            },
                                        }}
                                        slotProps={{
                                            select: {
                                                MenuProps: {
                                                    slotProps: {
                                                        paper: {
                                                            sx: {
                                                                backgroundColor: '#181818',
                                                                color: '#ffffff',
                                                                border: '1px solid rgba(255,132,0,0.45)',
                                                                borderRadius: '14px',
                                                                mt: 1,
                                                                overflow: 'hidden',
                                                                boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
                                                            },
                                                        },
                                                        list: {
                                                            sx: {
                                                                py: 0,
                                                                '& .MuiMenuItem-root': {
                                                                    color: '#ffffff',
                                                                    fontWeight: 800,
                                                                    fontSize: '18px',
                                                                    py: 1.5,
                                                                },
                                                                '& .MuiMenuItem-root:hover': {
                                                                    backgroundColor: 'rgba(255,132,0,0.18)',
                                                                },
                                                                '& .MuiMenuItem-root.Mui-selected': {
                                                                    backgroundColor: 'rgba(255,132,0,0.28)',
                                                                    color: '#ff8400',
                                                                },
                                                                '& .MuiMenuItem-root.Mui-selected:hover': {
                                                                    backgroundColor: 'rgba(255,132,0,0.36)',
                                                                },
                                                            },
                                                        },
                                                    },
                                                }
                                            }
                                        }}>
                                        <MenuItem value={'1'}>Tavolo 1</MenuItem>
                                        <MenuItem value={'2'}>Tavolo 2</MenuItem>
                                        <MenuItem value={'3'}>Tavolo 3</MenuItem>
                                        <MenuItem value={'4'}>Tavolo 4</MenuItem>
                                        <MenuItem value={'5'}>Tavolo 5</MenuItem>
                                        <MenuItem value={'6'}>Tavolo 6</MenuItem>
                                    </TextField>
                                    {cartItems.map((item) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '86px minmax(0, 1fr)', sm: '104px minmax(0, 1fr) auto' },
                                                gap: { xs: 1.5, sm: 2 },
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: '14px',
                                                backgroundColor: '#1d1d1d',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={item.img}
                                                alt={item.nome}
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1 / 1',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px',
                                                }}
                                            />

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{
                                                    color: '#fff',
                                                    fontWeight: 900,
                                                    fontSize: { xs: '17px', sm: '19px' },
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {item.nome}
                                                </Typography>
                                                <Typography sx={{
                                                    color: 'rgba(255,255,255,0.56)',
                                                    fontSize: '14px',
                                                    mt: 0.5,
                                                }}>
                                                    {formatPrice(item.prezzo)}
                                                </Typography>

                                                <Box sx={{
                                                    display: { xs: 'flex', sm: 'none' },
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mt: 1.5,
                                                    gap: 1,
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton onClick={() => decreaseItem(item.id)} sx={quantityButtonSx}>
                                                            <RemoveIcon />
                                                        </IconButton>
                                                        <Typography sx={{ color: '#ffffff', minWidth: 24, textAlign: 'center', fontWeight: 900 }}>
                                                            {item.quantita}
                                                        </Typography>
                                                        <IconButton onClick={() => addItem(item)} sx={quantityButtonSx}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Box>
                                                    <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                                        {formatPrice(item.prezzo * item.quantita)}
                                                    </Typography>

                                                </Box>

                                            </Box>

                                            <Box sx={{
                                                display: { xs: 'none', sm: 'grid' },
                                                gridTemplateColumns: '38px 34px 38px 100px',
                                                gap: 1,
                                                alignItems: 'center',
                                            }}>
                                                <IconButton onClick={() => decreaseItem(item.id)} sx={quantityButtonSx}>
                                                    <RemoveIcon />
                                                </IconButton>
                                                <Typography sx={{ color: '#ffffff', textAlign: 'center', fontWeight: 900, fontSize: '18px' }}>
                                                    {item.quantita}
                                                </Typography>
                                                <IconButton onClick={() => addItem(item)} sx={quantityButtonSx}>
                                                    <AddIcon />
                                                </IconButton>
                                                <Typography sx={{
                                                    color: '#ff8400',
                                                    fontWeight: 900,
                                                    textAlign: 'right',
                                                    fontSize: '16px',
                                                }}>
                                                    {formatPrice(item.prezzo * item.quantita)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{
                            backgroundColor: '#242424',
                            borderRadius: '18px',
                            border: '1px solid rgba(255,132,0,0.24)',
                            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                            position: { md: 'sticky' },
                            top: { md: 96 },
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: '24px', mb: 2 }}>
                                    Riepilogo
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>
                                        Subtotale
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#ffffff', }}>
                                        {formatPrice(subtotal)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>
                                        Servizio
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#ffffff', }}>
                                        {formatPrice(0)}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '20px', color: '#ffffff', }}>
                                        Totale
                                    </Typography>
                                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '24px' }}>
                                        {formatPrice(subtotal)}
                                    </Typography>

                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#ff8400',
                                        color: '#111',
                                        fontWeight: 900,
                                        borderRadius: '12px',
                                        py: 1.4,
                                        '&:hover': {
                                            backgroundColor: '#ff9d2e',
                                        },
                                    }}
                                    onClick={
                                        handleOrder
                                    }
                                >
                                    Conferma ordine
                                </Button>

                                <Button
                                    component={Link}
                                    to="/menu"
                                    fullWidth
                                    sx={{
                                        mt: 1,
                                        color: '#ff8400',
                                        fontWeight: 800,
                                    }}
                                >
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
