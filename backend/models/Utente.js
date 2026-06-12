const mongoose = require('mongoose');

const utenteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Qui salviamo l'hash creato con bcrypt, non la password originale.
  password: {
    type: String,
    required: true,
  },

  // Il ruolo decide cosa puo' vedere l'utente:
  // cliente = menu, carrello, propri ordini
  // staff = schermata gestione ordini
  role: {
    type: String,
    enum: ['cliente', 'staff'],
    default: 'cliente',
  },
});

const Utente = mongoose.model('Utente', utenteSchema);

module.exports = Utente;
