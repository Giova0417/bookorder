const express = require('express');
const router = express.Router();
const tavoliController = require('../controllers/tavoliController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// GET /api/tavoli/mie
// Cliente loggato: vede solo le sue prenotazioni.
router.get('/mie', requireAuth(), tavoliController.getMiePrenotazioni);

// GET /api/tavoli/staff
// Staff: vede tutte le prenotazioni.
router.get('/staff', requireAuth(), requireRole('staff'), tavoliController.getPrenotazioniStaff);

// DELETE /api/tavoli/staff/:id
// Staff: elimina una prenotazione.
router.delete('/staff/:id', requireAuth(), requireRole('staff'), tavoliController.eliminaPrenotazione);

// DELETE /api/tavoli/mie/:id
// Cliente loggato: annulla in sicurezza la SUA prenotazione
router.delete('/mie/:id', requireAuth(), tavoliController.annullaMiaPrenotazione);

// GET /api/tavoli
// Cliente loggato: vede tavoli liberi e occupati per un orario.
router.get('/', requireAuth(), tavoliController.getTavoli);

// POST /api/tavoli
// Cliente loggato: prenota un tavolo solo se e libero.
router.post('/', requireAuth(), tavoliController.prenotaTavolo);

module.exports = router;
