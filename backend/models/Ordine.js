const mongoose = require('mongoose');

const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];

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
    stato: {
        type: String,
        enum: statiOrdine,
        default: 'In preparazione'
    },
    numeroTavolo:{type:String,required:true}
});
//CREAZIONE MODELLO ORDINE
const Ordine = mongoose.model('Ordine', ordineSchema);
//FUNZIONE PER GENERARE ID UNICO PER OGNI ORDINE
function generaIdOrdine() {
    const ordineId = Math.random().toString(36).substr(2, 9);
    return ordineId;
}
module.exports = { Ordine, statiOrdine };
