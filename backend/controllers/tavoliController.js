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
                miaPrenotazione: prenotazione ? prenotazione.idUtente === req.userId : false,
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

        return res.status(200).json({ prenotazioni });
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

        const occupato = await PrenotazioneTavolo.findOne({ numeroTavolo, orario });

        if (occupato) {
            return res.status(409).json({ message: 'Questo tavolo e gia prenotato per questo orario' });
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
    eliminaPrenotazione,
};
