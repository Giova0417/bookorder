import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { formatPrice } from '../utils';

// ProdottoCard è un componente figlio di Menu.
//
// Riceve tutto ciò di cui ha bisogno tramite props:
//   prodotto   → i dati del prodotto (nome, desc, prezzo, img, categoria)
//   quantita   → quante unità sono già nel carrello, letta dal padre tramite getQuantity
//   onAdd      → funzione da chiamare quando si clicca "+"
//   onDecrease → funzione da chiamare quando si clicca "−"
//
// Il componente NON conosce il CartContext, non sa cosa fa onAdd/onDecrease:
// sa solo che deve chiamarle. Tutta la logica resta nel padre (Menu).
// Questo è il principio di separazione delle responsabilità:
// il figlio si occupa solo di mostrare, il padre di gestire la logica.
function ProdottoCard({ prodotto, quantita, onAdd, onDecrease }) {
    return (
        <Card sx={{
            backgroundColor: '#2a2a2a',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            height: '410px',
            width: { xs: '85vw', sm: '300px' },
            scrollSnapAlign: 'start',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s',
            '&:hover': {
                transform: 'translateY(-6px)',
                border: '1px solid #ff8400',
                boxShadow: '0 12px 40px rgba(255,132,0,0.2)',
            },
        }}>
            <Box
                component="img"
                src={prodotto.img}
                alt={prodotto.nome}
                sx={{ width: '100%', height: '165px', objectFit: 'cover', display: 'block' }}
            />

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: '#ff8400', fontSize: '11px', fontWeight: 'bold', letterSpacing: 2, mb: 1 }}>
                    {prodotto.categoria.toUpperCase()}
                </Typography>
                <Typography sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px', mb: 1 }}>
                    {prodotto.nome}
                </Typography>
                <Typography sx={{ height: '44px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', mb: 2 }}>
                    {prodotto.desc}
                </Typography>
                <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '20px' }}>
                    {formatPrice(prodotto.prezzo)}
                </Typography>

                {/* Controlli quantità: − numero +
                    onDecrease e onAdd sono funzioni ricevute dal padre tramite props.
                    Le passiamo a onClick senza (): non vogliamo eseguirle subito,
                    vogliamo che React le chiami solo quando l'utente clicca. */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mt: 2 }}>
                    <Button onClick={onDecrease} sx={{
                        backgroundColor: '#1a1a1a', fontWeight: 900, fontSize: '30px',
                        color: '#ff8400', borderRadius: '10px', p: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        −
                    </Button>
                    <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: '25px' }}>
                        {quantita}
                    </Typography>
                    <Button onClick={onAdd} sx={{
                        backgroundColor: '#1a1a1a', fontWeight: 900, fontSize: '30px',
                        color: '#ff8400', borderRadius: '10px', p: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        +
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ProdottoCard;
