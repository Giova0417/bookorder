const Utente = require('../models/Utente');
const tokenService = require('../services/tokenService');

// Estrae il JWT dall'header Authorization.
// Il frontend manda: Authorization: Bearer <token>
// Dividiamo la stringa in due parti: "Bearer" e il token vero.
function getBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const parti = authHeader.split(' ');
    const type = parti[0];
    const token = parti[1];

    if (type !== 'Bearer' || !token) return null;
    return token;
}

// requireAuth è una factory function: restituisce un middleware, non lo esegue subito.
// Questo ci permette di personalizzare i messaggi di errore per rotta.
//
// Un middleware in Express è una funzione con firma (req, res, next):
//   req  → la richiesta HTTP in ingresso
//   res  → la risposta che possiamo inviare al client
//   next → funzione che passa il controllo al middleware/controller successivo
//
// Se il token è valido chiamiamo next() e la catena continua.
// Se il token manca o non è valido rispondiamo subito con 401 e la catena si interrompe.
// 401 significa "non autenticato": il server non sa chi sei.
function requireAuth(options = {}) {
    const missingMessage = options.missingMessage || 'Token mancante';
    const invalidMessage = options.invalidMessage || 'Token non valido o scaduto';

    return async function requireAuthMiddleware(req, res, next) {
        try {
            const token = getBearerToken(req);

            if (!token) {
                return res.status(401).json({ message: missingMessage });
            }

            // verifyAccessToken controlla la firma del JWT con la chiave segreta.
            // Se il token è scaduto o manomesso, lancia un errore che finiamo nel catch.
            const datiToken = tokenService.verifyAccessToken(token);

            // Recuperiamo l'utente dal database per assicurarci che esista ancora.
            // .select('-password') esclude la password dall'oggetto restituito.
            const utente = await Utente.findById(datiToken.id).select('-password');

            if (!utente) {
                return res.status(401).json({ message: 'Utente non esiste più' });
            }

            // Aggiungiamo l'utente alla request: così ogni controller che viene dopo
            // può usare req.user senza dover rifare la query al database.
            req.user = utente;
            req.userId = utente._id.toString();

            return next();
        } catch (errore) {
            return res.status(401).json({ message: invalidMessage });
        }
    };
}

module.exports = { requireAuth };
