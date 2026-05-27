import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useCart } from './CartContext'
function Cart() {
    const { cartItems, addItem, decreaseItem } = useCart();
    return (
        <Box sx={{
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            height: '100vh',
            py: { xs: '20%', md: '5%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Card sx={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#2a2a2a',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                overflow: 'hidden',
            }} >

                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {cartItems.map((item) => (
                        <Box sx={{
                            display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
                        }} key={item.id}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, height: '100px' }} >
                                <Typography sx={{
                                    color: '#ffffff',
                                    fontWeight: 900,
                                    fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                                    letterSpacing: 0,
                                    fontSize: { xs: '18px', sm: '22px' },
                                    lineHeight: 1,
                                    textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
                                }}>
                                    {item.nome}
                                </Typography>

                                <Typography sx={{
                                    color: '#ffffff',
                                    fontWeight: 900,
                                    fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                                    letterSpacing: 0,
                                    fontSize: { xs: '18px', sm: '22px' },
                                    lineHeight: 1,
                                    textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
                                }}>
                                    ×{item.quantita}
                                </Typography>
                                <Typography sx={{
                                    mb: '20px',
                                    color: '#ffffff',
                                    fontWeight: 900,
                                    fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                                    letterSpacing: 0,
                                    fontSize: { xs: '18px', sm: '22px' },
                                    lineHeight: 1,
                                    textShadow: '0 4px 0 rgba(0,0,0,0.18), 0 14px 30px rgba(0,0,0,0.35)',
                                }}>
                                    {item.prezzo.toFixed(2).replace('.', ',')} EUR
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, height: '50%' }}>
                                <Button onClick={() =>
                                    decreaseItem(item.id)
                                } sx={{
                                    backgroundColor: '#1a1a1a',
                                    fontWeight: 900,
                                    fontSize: '30px',
                                    color: '#ff8400',
                                    borderRadius: '10px',
                                    p: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    −
                                </Button>

                                <Button sx={{
                                    backgroundColor: '#1a1a1a',
                                    fontWeight: 900,
                                    fontSize: '30px',
                                    color: '#ff8400',
                                    borderRadius: '10px',
                                    p: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }} onClick={() => addItem(item)}>+</Button>
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
    )
}

export default Cart
