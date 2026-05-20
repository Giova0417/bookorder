const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utente = require('../models/Utente');
const router = express.Router();
function creaToken(utente) {
  return jwt.sign(
    {
      id: utente._id,
      email: utente.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Compila tutti i campi' });
    }

    const utenteEsistente = await Utente.findOne({ email });

    if (utenteEsistente) {
      return res.status(400).json({ message: 'Email gia registrata' });
    }

    const passwordCriptata = await bcrypt.hash(password, 10);

    const nuovoUtente = await Utente.create({
      name,
      email,
      password: passwordCriptata,
    });

    return res.status(201).json({
      message: 'Utente registrato',
      utente: {
        id: nuovoUtente._id,
        name: nuovoUtente.name,
        email: nuovoUtente.email,
      },
    });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Compila tutti i campi' });
    }

    const utente = await Utente.findOne({ email });

    if (!utente) {
      return res.status(400).json({ message: 'Email o password errate' });
    }

    const passwordCorretta = await bcrypt.compare(password, utente.password);

    if (!passwordCorretta) {
      return res.status(400).json({ message: 'Email o password errate' });
    }

    const token = creaToken(utente);

    return res.status(200).json({
      message: 'Autenticazione effettuata',
      token,
    });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
