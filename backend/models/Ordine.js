const mongoose = require('mongoose');
//CREAZIONE SCHEMA ORDINE
const ordineSchema = new mongoose.Schema({
    id_ordine: { type: String, required: true, unique: true, default: generaIdOrdine },
    cartItems: [{
        id: Number,
        nome: String,
        prezzo: Number,
        quantita: Number,
    }],
    idUtente: { type: String, required: true },
    stato: { type: String, default: 'In preparazione' }
});
//CREAZIONE MODELLO ORDINE
const Ordine = mongoose.model('Ordine', ordineSchema);
//FUNZIONE PER GENERARE ID UNICO PER OGNI ORDINE
function generaIdOrdine() {
    const ordineId = Math.random().toString(36).substr(2, 9);
    return ordineId;
}
//FUNZIONE AGGIORNA STATO ORDINE
function aggiornaStatoOrdine(ordine) {
    ordine.stato = !ordine.stato; // Cambia lo stato da true a false o viceversa;
}

module.exports = { Ordine };
