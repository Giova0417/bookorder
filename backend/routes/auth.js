const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/auth/me
// Ritorna l'utente loggato. Serve alla navbar per capire se esiste una sessione.
router.get('/me', requireAuth(), authController.me);

// POST /api/auth/register
// Crea un nuovo utente cliente o staff.
router.post('/register', authController.register);

// POST /api/auth/login
// Controlla email/password e crea access token + refresh cookie.
router.post('/login', authController.login);

// POST /api/auth/refresh
// Usa il refresh cookie per generare un nuovo access token.
// Il controller ruota anche il refresh token: quello vecchio viene revocato e ne arriva uno nuovo.
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
// Revoca il refresh token e cancella il cookie.
router.post('/logout', authController.logout);

module.exports = router;
