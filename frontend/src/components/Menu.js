import React, { useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const prodottiMenu = [
  {
    id: 1,
    nome: 'Classic Burger',
    categoria: 'Burger',
    desc: 'Hamburger di manzo, lattuga, pomodoro, cheddar e salsa burger.',
    prezzo: '7,50 EUR',
  },
  {
    id: 2,
    nome: 'Double Beef Burger',
    categoria: 'Burger',
    desc: 'Doppio hamburger di manzo, doppio cheddar, lattuga e salsa speciale.',
    prezzo: '9,00 EUR',
  },
  {
    id: 3,
    nome: 'BBQ Bacon Burger',
    categoria: 'Burger',
    desc: 'Manzo, bacon croccante, cheddar, cipolla caramellata e salsa BBQ.',
    prezzo: '9,50 EUR',
  },
  {
    id: 4,
    nome: 'Crispy Chicken Burger',
    categoria: 'Burger',
    desc: 'Pollo croccante, lattuga, pomodoro e maionese.',
    prezzo: '8,50 EUR',
  },
  {
    id: 5,
    nome: 'Spicy Jalapeno Burger',
    categoria: 'Burger',
    desc: 'Manzo, cheddar, jalapeno, insalata e salsa piccante.',
    prezzo: '9,20 EUR',
  },
  {
    id: 6,
    nome: 'Veggie Burger',
    categoria: 'Burger',
    desc: 'Burger vegetale, lattuga, pomodoro, cipolla e salsa yogurt.',
    prezzo: '8,00 EUR',
  },
  {
    id: 7,
    nome: 'Pulled Pork Sandwich',
    categoria: 'Panini Speciali',
    desc: 'Maiale sfilacciato, coleslaw e salsa BBQ.',
    prezzo: '8,80 EUR',
  },
  {
    id: 8,
    nome: 'Chicken Club',
    categoria: 'Panini Speciali',
    desc: 'Pollo grigliato, bacon, lattuga, pomodoro e maionese.',
    prezzo: '8,20 EUR',
  },
  {
    id: 9,
    nome: 'Hot Dog Deluxe',
    categoria: 'Panini Speciali',
    desc: 'Wurstel, cheddar, cipolla croccante, ketchup e senape.',
    prezzo: '6,50 EUR',
  },
  {
    id: 10,
    nome: 'Patatine Classiche',
    categoria: 'Fritti',
    desc: 'Patatine fritte croccanti con sale.',
    prezzo: '3,00 EUR',
  },
  {
    id: 11,
    nome: 'Patatine Cheddar & Bacon',
    categoria: 'Fritti',
    desc: 'Patatine con cheddar fuso e bacon croccante.',
    prezzo: '4,50 EUR',
  },
  {
    id: 12,
    nome: 'Onion Rings',
    categoria: 'Fritti',
    desc: 'Anelli di cipolla fritti e croccanti.',
    prezzo: '3,80 EUR',
  },
  {
    id: 13,
    nome: 'Chicken Nuggets',
    categoria: 'Fritti',
    desc: 'Bocconcini di pollo croccanti con salsa a scelta.',
    prezzo: '4,50 EUR',
  },
  {
    id: 14,
    nome: 'Mozzarella Sticks',
    categoria: 'Fritti',
    desc: 'Bastoncini di mozzarella filante impanati.',
    prezzo: '4,20 EUR',
  },
  {
    id: 15,
    nome: 'Salsa Burger',
    categoria: 'Salse',
    desc: 'Salsa cremosa della casa.',
    prezzo: '0,50 EUR',
  },
  {
    id: 16,
    nome: 'Salsa BBQ',
    categoria: 'Salse',
    desc: 'Salsa affumicata dolce.',
    prezzo: '0,50 EUR',
  },
  {
    id: 17,
    nome: 'Salsa Piccante',
    categoria: 'Salse',
    desc: 'Salsa spicy per burger e fritti.',
    prezzo: '0,50 EUR',
  },
  {
    id: 18,
    nome: 'Maionese',
    categoria: 'Salse',
    desc: 'Classica maionese.',
    prezzo: '0,30 EUR',
  },
  {
    id: 19,
    nome: 'Ketchup',
    categoria: 'Salse',
    desc: 'Classico ketchup.',
    prezzo: '0,30 EUR',
  },
  {
    id: 20,
    nome: 'Acqua Naturale',
    categoria: 'Bevande',
    desc: 'Bottiglia 50 cl.',
    prezzo: '1,20 EUR',
  },
  {
    id: 21,
    nome: 'Acqua Frizzante',
    categoria: 'Bevande',
    desc: 'Bottiglia 50 cl.',
    prezzo: '1,20 EUR',
  },
  {
    id: 22,
    nome: 'Coca-Cola',
    categoria: 'Bevande',
    desc: 'Lattina 33 cl.',
    prezzo: '2,50 EUR',
  },
  {
    id: 23,
    nome: 'Fanta',
    categoria: 'Bevande',
    desc: 'Lattina 33 cl.',
    prezzo: '2,50 EUR',
  },
  {
    id: 24,
    nome: 'Sprite',
    categoria: 'Bevande',
    desc: 'Lattina 33 cl.',
    prezzo: '2,50 EUR',
  },
  {
    id: 25,
    nome: 'Birra Artigianale',
    categoria: 'Bevande',
    desc: 'Bottiglia 33 cl.',
    prezzo: '4,50 EUR',
  },
  {
    id: 26,
    nome: 'Brownie al Cioccolato',
    categoria: 'Dolci',
    desc: 'Brownie morbido con cioccolato fondente.',
    prezzo: '4,00 EUR',
  },
  {
    id: 27,
    nome: 'Cheesecake',
    categoria: 'Dolci',
    desc: 'Cheesecake con topping ai frutti rossi.',
    prezzo: '4,50 EUR',
  },
  {
    id: 28,
    nome: 'Milkshake Vaniglia',
    categoria: 'Dolci',
    desc: 'Milkshake cremoso alla vaniglia.',
    prezzo: '4,00 EUR',
  },
  {
    id: 29,
    nome: 'Milkshake Cioccolato',
    categoria: 'Dolci',
    desc: 'Milkshake cremoso al cioccolato.',
    prezzo: '4,00 EUR',
  },
];



function Menu(){
    return (
        <Box
            sx={{
      width: '100%',
      background: '#1a1a1a',
      py: 10,
      px: { xs: 3, md: 10 },
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      minHeight:'100vh'
    }}>

        </Box>
    )
}
export default Menu
