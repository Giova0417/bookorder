const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Ordine, statiOrdine } = require('../models/Ordine');

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

        const { cartItems, numeroTavolo } = req.body;

        if (!numeroTavolo) {
            return res.status(400).json({ message: 'Inserisci un tavolo' })
        }
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Il carrello e vuoto' });
        }

        const ordine = await Ordine.create({
            cartItems,
            idUtente,
            numeroTavolo
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

router.patch('/:id/stato', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }

        const datiToken = jwt.verify(token, process.env.JWT_SECRET);
        const idUtente = datiToken.id;
        const { stato } = req.body;

        if (!statiOrdine.includes(stato)) {
            return res.status(400).json({ message: 'Stato ordine non valido' });
        }

        const ordine = await Ordine.findOneAndUpdate(
            { _id: req.params.id, idUtente },
            { stato },
            { new: true, runValidators: true }
        );

        if (!ordine) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }

        return res.status(200).json({
            message: 'Stato ordine aggiornato',
            ordine,
        });
    }
    catch (errore) {
        console.log(errore);

        if (errore.name === 'JsonWebTokenError' || errore.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Devi effettuare il login' });
        }

        return res.status(500).json({ message: 'Errore durante aggiornamento stato ordine' });
    }
});

module.exports = router
