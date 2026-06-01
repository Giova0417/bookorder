const bcrypt = require('bcryptjs');
const Utente = require('../models/Utente');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('../services/tokenService');

async function issueRefreshToken(res, utente) {
  const refreshToken = tokenService.createRefreshToken();

  await RefreshToken.create({
    user: utente._id,
    tokenHash: tokenService.hashRefreshToken(refreshToken),
    expiresAt: tokenService.getRefreshTokenExpiresAt(),
  });

  res.cookie('refreshToken', refreshToken, tokenService.getRefreshCookieOptions());
}

async function me(req, res) {
  return res.status(200).json({ utente: req.user });
}

async function register(req, res) {
  try {
    const { name, email, password, role, staffCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Compila tutti i campi' });
    }

    const requestedRole = role === 'staff' ? 'staff' : 'cliente';

    if (requestedRole === 'staff') {
      if (!process.env.STAFF_CODE) {
        return res.status(500).json({ message: 'Codice staff non configurato nel server' });
      }

      if (staffCode !== process.env.STAFF_CODE) {
        return res.status(403).json({ message: 'Codice staff non valido' });
      }
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
      role: requestedRole,
    });

    return res.status(201).json({
      message: 'Utente registrato',
      utente: {
        id: nuovoUtente._id,
        name: nuovoUtente.name,
        email: nuovoUtente.email,
        role: nuovoUtente.role,
      },
    });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore durante la registrazione' });
  }
}

async function login(req, res) {
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

    const token = tokenService.createAccessToken(utente);
    await issueRefreshToken(res, utente);

    return res.status(200).json({
      message: 'Autenticazione effettuata',
      accessToken: token,
      token,
      utente: {
        id: utente._id,
        name: utente.name,
        email: utente.email,
        role: utente.role,
      },
    });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore del server' });
  }
}

async function refresh(req, res) {
  try {
    const refreshToken = tokenService.getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token mancante' });
    }

    const tokenHash = tokenService.hashRefreshToken(refreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash, revokedAt: null }).populate('user');

    if (!storedToken || !storedToken.user) {
      return res.status(401).json({ message: 'Refresh token non valido' });
    }

    if (storedToken.expiresAt <= new Date()) {
      storedToken.revokedAt = new Date();
      await storedToken.save();
      return res.status(401).json({ message: 'Refresh token scaduto' });
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const token = tokenService.createAccessToken(storedToken.user);
    await issueRefreshToken(res, storedToken.user);

    return res.status(200).json({
      message: 'Access token rigenerato',
      accessToken: token,
      token,
    });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore durante il refresh della sessione' });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = tokenService.getRefreshTokenFromRequest(req);

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        {
          tokenHash: tokenService.hashRefreshToken(refreshToken),
          revokedAt: null,
        },
        { revokedAt: new Date() }
      );
    }

    const { maxAge, ...clearCookieOptions } = tokenService.getRefreshCookieOptions();
    res.clearCookie('refreshToken', clearCookieOptions);

    return res.status(200).json({ message: 'Logout effettuato' });
  } catch (errore) {
    return res.status(500).json({ message: 'Errore durante il logout' });
  }
}

module.exports = {
  me,
  register,
  login,
  refresh,
  logout,
};
