const mongoose = require('mongoose');

const numeriTavoli = ['1', '2', '3', '4', '5', '6'];
const orariPrenotazione = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];

const prenotazioneTavoloSchema = new mongoose.Schema({
  numeroTavolo: {
    type: String,
    enum: numeriTavoli,
    required: true,
  },

  orario: {
    type: String,
    enum: orariPrenotazione,
    required: true,
  },

  idUtente: {
    type: String,
    required: true,
  },

  nomeUtente: {
    type: String,
    required: true,
  },

  dataPrenotazione: {
    type: Date,
    default: Date.now,
  },
});

prenotazioneTavoloSchema.index({ numeroTavolo: 1, orario: 1 }, { unique: true });

const PrenotazioneTavolo = mongoose.model('PrenotazioneTavolo', prenotazioneTavoloSchema, 'prenotazioni_tavoli');

module.exports = {
  PrenotazioneTavolo,
  numeriTavoli,
  orariPrenotazione,
};
