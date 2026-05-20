const mongoose = require('mongoose');
//GESTIAMO AUTENTICAZIONE UTENTE
const utenteSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    ///tipo:{type:String, required:true} // cliente, cameriere, cuoco
});
const Utente = mongoose.model('Utente', utenteSchema);
module.exports = Utente;

function creaOrdinePerUtente(utente, ordine) {
    const nuovoOrdine = new Ordine({
        id_ordine: generaIdOrdine(),
        tavolo: ordine.tavolo,
        piatti: ordine.piatti, 
    })};
