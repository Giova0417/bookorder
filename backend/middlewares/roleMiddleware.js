// requireRole è una factory function che restituisce un middleware.
// Va sempre usato DOPO requireAuth nella catena, perché legge req.user
// che viene impostato da requireAuth.
//
// 401 = non autenticato (chi sei?)
// 403 = non autorizzato (so chi sei, ma non puoi farlo)
// La distinzione è importante: 401 dice al client di fare login, 403 dice che il login
// non basta — serve un ruolo diverso.
function requireRole(allowedRole) {
    return function requireRoleMiddleware(req, res, next) {
        if (!req.user) {
            return res.status(401).json({ message: 'Devi effettuare il login' });
        }

        if (req.user.role !== allowedRole) {
            return res.status(403).json({ message: 'Non hai i permessi per questa operazione' });
        }

        return next();
    };
}

module.exports = { requireRole };
