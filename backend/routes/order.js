const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Ordine } = require('../models/Ordine');

router.get('', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Devi effettuare il login per vedere gli ordini' });
        }

        const datiToken = jwt.verify(token, process.env.JWT_SECRET);
        const idUtente = datiToken.id;

        const ordini = await Ordine.find({ idUtente }).sort({ _id: -1 }).lean();

        return res.status(200).json({ ordini });
    }
    catch (errore) {
        console.log(errore);

        if (errore.name === 'JsonWebTokenError' || errore.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Devi effettuare il login per vedere gli ordini' });
        }

        return res.status(500).json({ message: 'Errore nel recupero degli ordini' });
    }
});

router.post('', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }

        const datiToken = jwt.verify(token, process.env.JWT_SECRET)
        const idUtente = datiToken.id;


        if (!idUtente) {
            return res.status(401).json({ message: 'Utente non esiste' });
        }

        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Il carrello e vuoto' });
        }

        const ordine = await Ordine.create({
            cartItems,
            idUtente,
        });

        return res.status(201).json({
            message: 'ORDINE EFFETTUATO CON SUCCESSO',
            ordine,
        });
    }
    catch (errore) {
        console.log(errore);

        if (errore.name === 'JsonWebTokenError' || errore.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Devi effettuare il login prima di ordinare' });
        }

        return res.status(500).json({ message: 'Ordine non registrato nel database. Riprova.' });
    }
}
)
module.exports = router
