const mongoose = require('mongoose');

const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];

//CREAZIONE SCHEMA ORDINE
const ordineSchema = new mongoose.Schema({
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
module.exports = { Ordine, statiOrdine };
