const Utente = require('../models/Utente');
const tokenService = require('../services/tokenService');

function getBearerToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function requireAuth(options = {}) {
  const missingMessage = options.missingMessage || 'Token mancante';
  const invalidMessage = options.invalidMessage || 'Token non valido o scaduto';

  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);

      if (!token) {
        return res.status(401).json({ message: missingMessage });
      }

      const datiToken = tokenService.verifyAccessToken(token);
      const utente = await Utente.findById(datiToken.id).select('-password');

      if (!utente) {
        return res.status(401).json({ message: 'Utente non esiste piu' });
      }

      req.user = utente;
      req.userId = utente._id.toString();
      return next();
    } catch (errore) {
      return res.status(401).json({ message: invalidMessage });
    }
  };
}

module.exports = {
  requireAuth,
};
