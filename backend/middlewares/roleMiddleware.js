function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Devi effettuare il login' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Non hai i permessi per questa operazione' });
    }

    return next();
  };
}

module.exports = {
  requireRole,
};
