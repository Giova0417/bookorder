const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const REFRESH_COOKIE_NAME = 'refreshToken';

// Crea un access token JWT firmato con la chiave segreta.
// Il JWT contiene un payload (id, email, ruolo) leggibile da chiunque,
// ma la FIRMA garantisce che non sia stato modificato.
// jwt.verify() in seguito controlla proprio questa firma.
// Scade dopo 15 minuti: breve durata riduce il rischio se viene rubato.
function createAccessToken(utente) {
    const payload = {
        id: utente._id,
        email: utente.email,
        role: utente.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

// Verifica la firma del JWT e restituisce il payload se valido.
// Lancia un errore se il token è scaduto o la firma non corrisponde.
// Questo errore viene catturato dal middleware requireAuth.
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

// Il refresh token non è un JWT: è solo una stringa casuale lunga 128 caratteri hex.
// Non contiene dati: serve solo come "chiave" per trovare la sessione nel database.
// La casualità di 64 byte lo rende impossibile da indovinare.
function createRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

// Nel database non salviamo il refresh token originale, ma il suo hash SHA-256.
// Se il database venisse compromesso, l'attaccante non potrebbe usare gli hash
// per autenticarsi: senza il token originale, l'hash è inutile.
function hashRefreshToken(refreshToken) {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

function getRefreshTokenExpiresAt() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
    return expiresAt;
}

// Il cookie è HttpOnly: JavaScript nel browser non può leggerlo.
// Questo protegge dal furto tramite XSS (Cross-Site Scripting).
// In produzione è anche Secure (solo HTTPS) e SameSite: 'none' (necessario per
// cookie cross-origin tra Vercel e Render). In sviluppo usiamo SameSite: 'lax'.
// path: '/api/auth' significa che il browser manda il cookie SOLO alle rotte /api/auth/*.
function getRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth',
        maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    };
}

// Legge il refresh token dal cookie della richiesta.
// I cookie arrivano come stringa unica: "nome=valore; altro=valore2".
// Scorriamo le coppie finché non troviamo quella giusta.
function getRefreshTokenFromRequest(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const nomeCookie = `${REFRESH_COOKIE_NAME}=`;

    for (const cookie of cookieHeader.split(';')) {
        const cookiePulito = cookie.trim();
        if (cookiePulito.startsWith(nomeCookie)) {
            return decodeURIComponent(cookiePulito.substring(nomeCookie.length));
        }
    }

    return null;
}

module.exports = {
    REFRESH_COOKIE_NAME,
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiresAt,
    getRefreshCookieOptions,
    getRefreshTokenFromRequest,
};
