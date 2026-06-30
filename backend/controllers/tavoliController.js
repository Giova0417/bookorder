const mongoose = require('mongoose');
const { PrenotazioneTavolo, numeriTavoli, orariPrenotazione } = require('../models/PrenotazioneTavolo');

async function getTavoli(req, res) {
    try {
        const orario = req.query.orario || orariPrenotazione[0];

        if (!orariPrenotazione.includes(orario)) {
            return res.status(400).json({ message: 'Orario non valido' });
        }

        const prenotazioni = await PrenotazioneTavolo.find({ orario }).lean();

        const tavoli = numeriTavoli.map(function preparaTavolo(numero) {
            const prenotazione = prenotazioni.find(function trova(item) {
                return item.numeroTavolo === numero;
            });

            return {
                numero,
                libero: !prenotazione,
                miaPrenotazione: prenotazione ? String(prenotazione.idUtente) === String(req.userId) : false,
                prenotazione,
            };
        });

        return res.status(200).json({ tavoli, orari: orariPrenotazione });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore nel recupero dei tavoli' });
    }
}

async function getMiePrenotazioni(req, res) {
    try {
        const prenotazioni = await PrenotazioneTavolo
            .find({ idUtente: req.userId })
            .sort({ orario: 1, numeroTavolo: 1 })
            .lean();

        return res.status(200).json(prenotazioni);
    } catch (errore) {
        return res.status(500).json({ message: 'Errore nel recupero delle prenotazioni' });
    }
}

async function getPrenotazioniStaff(req, res) {
    try {
        const prenotazioni = await PrenotazioneTavolo
            .find({})
            .sort({ orario: 1, numeroTavolo: 1 })
            .lean();

        return res.status(200).json({ prenotazioni, orari: orariPrenotazione });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore nel recupero delle prenotazioni' });
    }
}

async function prenotaTavolo(req, res) {
    try {
        const { numeroTavolo, orario } = req.body;

        if (!numeriTavoli.includes(numeroTavolo) || !orariPrenotazione.includes(orario)) {
            return res.status(400).json({ message: 'Tavolo o orario non valido' });
        }

        // BLOCCO PRENOTAZIONI MULTIPLE: Controlla se l'utente ha già prenotato PER QUESTO ORARIO
        const giaPrenotato = await PrenotazioneTavolo.findOne({ idUtente: req.userId, orario });
        if (giaPrenotato) {
            return res.status(400).json({ message: 'Hai già prenotato un tavolo per questo orario' });
        }

        const occupato = await PrenotazioneTavolo.findOne({ numeroTavolo, orario });

        if (occupato) {
            return res.status(409).json({ message: 'Questo tavolo è già prenotato per questo orario' });
        }

        const prenotazione = await PrenotazioneTavolo.create({
            numeroTavolo,
            orario,
            idUtente: req.userId,
            nomeUtente: req.user.name,
        });

        return res.status(201).json({ message: `Tavolo ${numeroTavolo} prenotato alle ${orario}`, prenotazione });
    } catch (errore) {
        return res.status(500).json({ message: 'Prenotazione non registrata' });
    }
}

// FUNZIONE CLIENTE: Elimina in sicurezza solo le SUE prenotazioni
async function annullaMiaPrenotazione(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Id prenotazione non valido' });
        }

        const prenotazione = await PrenotazioneTavolo.findOneAndDelete({
            _id: req.params.id,
            idUtente: req.userId,
        });

        if (!prenotazione) {
            return res.status(404).json({ message: 'Prenotazione non trovata o non autorizzata' });
        }

        return res.status(200).json({ message: 'Prenotazione annullata' });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante annullamento prenotazione' });
    }
}

async function eliminaPrenotazione(req, res) {
    try {
        const prenotazione = await PrenotazioneTavolo.findByIdAndDelete(req.params.id);

        if (!prenotazione) {
            return res.status(404).json({ message: 'Prenotazione non trovata' });
        }

        return res.status(200).json({ message: 'Prenotazione eliminata' });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante eliminazione prenotazione' });
    }
}

module.exports = {
    getTavoli,
    getMiePrenotazioni,
    getPrenotazioniStaff,
    prenotaTavolo,
    annullaMiaPrenotazione,
    eliminaPrenotazione,
};
