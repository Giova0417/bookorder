const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    // Collegamento all'utente proprietario della sessione.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utente',
      required: true,
    },

    // Hash del refresh token. Il token vero resta solo nel cookie del browser.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    // Data di scadenza del refresh token.
    expiresAt: {
      type: Date,
      required: true,
    },

    // Se valorizzato, il token non e' piu' valido.
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indice TTL: MongoDB puo' eliminare automaticamente i token scaduti.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
