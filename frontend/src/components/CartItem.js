import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatPrice } from '../utils';

// Stili condivisi dei bottoni quantità: definiti fuori dal componente
// perché non cambiano mai — se fossero dentro, React li ricreerebbe ad ogni render.
const quantityButtonSx = {
    width: 38,
    height: 38,
    borderRadius: '10px',
    backgroundColor: '#161616',
    color: '#ff8400',
    border: '1px solid rgba(255,132,0,0.22)',
    '&:hover': { backgroundColor: '#211a14', borderColor: '#ff8400' },
};

// CartItem è un componente figlio di Cart.
// Riceve l'item e le funzioni di modifica tramite props:
//   item      → il prodotto (nome, prezzo, quantita, img)
//   onAdd     → chiama addItem del CartContext tramite il padre
//   onDecrease→ chiama decreaseItem del CartContext tramite il padre
// Il componente non sa nulla del carrello globale: sa solo cosa mostrare
// e quali funzioni chiamare quando l'utente clicca.
function CartItem({ item, onAdd, onDecrease }) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '86px minmax(0, 1fr)',
            gap: 1.5,
            alignItems: 'center',
            p: 1.5,
            borderRadius: '14px',
            backgroundColor: '#1d1d1d',
            border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <Box
                component="img"
                src={item.img}
                alt={item.nome}
                sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px' }}
            />
            <Box>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '17px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.nome}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.56)', fontSize: '14px', mt: 0.5 }}>
                    {formatPrice(item.prezzo)}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    {/* Controlli quantità: − numero +
                        onDecrease e onAdd sono passate dal padre: il figlio le chiama
                        senza sapere cosa fanno internamente. */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={onDecrease} sx={quantityButtonSx}><RemoveIcon /></IconButton>
                        <Typography sx={{ color: '#fff', minWidth: 24, textAlign: 'center', fontWeight: 900 }}>
                            {item.quantita}
                        </Typography>
                        <IconButton onClick={onAdd} sx={quantityButtonSx}><AddIcon /></IconButton>
                    </Box>
                    <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                        {formatPrice(item.prezzo * item.quantita)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default CartItem;
