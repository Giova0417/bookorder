const mongoose = require('mongoose');

// Stati ammessi per un ordine.
// Lo stesso array viene esportato e usato dal controller per validare le richieste.
const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];

const ordineSchema = new mongoose.Schema({
  // Prodotti acquistati. Ogni elemento e' una riga del carrello.
  cartItems: [
    {
      id: Number,
      nome: String,
      prezzo: Number,
      quantita: Number,
    },
  ],

  // Id dell'utente che ha creato l'ordine.
  idUtente: {
    type: String,
    required: true,
  },

  stato: {
    type: String,
    enum: statiOrdine,
    default: 'In preparazione',
  },

  numeroTavolo: {
    type: String,
    required: true,
  },

  orarioTavolo: {
    type: String,
    required: true,
  },
});

const Ordine = mongoose.model('Ordine', ordineSchema);

module.exports = {
  Ordine,
  statiOrdine,
};
