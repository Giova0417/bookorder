import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useCart } from './CartContext'
function Cart() {
    const { cartItems, addItem, decreaseItem } = useCart();
    return (
        <Box sx={{
            width: '100%',
            minHeight: '100vh',
            background: '#1a1a1a',
            py: 5,
            px: { xs: 3, md: 10 },
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
            {cartItems.map((item) => (
                <Box key={item.id}>
                    <Typography>
                        {item.nome}
                    </Typography>
                    <Typography>
                        {item.prezzo}
                    </Typography>
                    <Typography>
                        {item.quantià}
                    </Typography>
                    <Button onClick={() => decreaseItem(item.id)}>−</Button>
                    <Button onClick={() => addItem(item)}>+</Button>
                </Box>
            ))}
        </Box>
    )
}

export default Cart
