const mongoose = require('mongoose');
//CREAZIONE SCHEMA ORDINE
const ordineSchema = new mongoose.Schema({
    id_ordine:{type:String, required:true, unique:true},
    id_tavolo:{type:Number, required:true},
    piatti:{type:Array, required:true},
    stato:{type:Boolean, required:true}
});
//CREAZIONE MODELLO ORDINE
const Ordine = mongoose.model('Ordine', ordineSchema);
//FUNZIONE PER GENERARE ID UNICO PER OGNI ORDINE
function generaIdOrdine() {
    ordineId = Math.random().toString(36).substr(2, 9);
    return ordineId;
}
//FUNZIONE PER AGGIUNGERE UN PIATTO ALL'ORDINE
function aggiungiPiattoAOrdine(ordine, piatto) {
    ordine.piatti.push(piatto);
}
//FUNZIONE PER RIMUOVERE UN PIATTO DALL'ORDINE
function rimuoviPiattoDaOrdine(ordine, piatto) {
    const index = ordine.piatti.indexOf(piatto);
    if (index !== -1) {
        ordine.piatti.splice(index, 1);
    }
    else {
        console.log("Piatto non trovato nell'ordine.");
    }
}
//FUNZIONE AGGIORNA STATO ORDINE
function aggiornaStatoOrdine(ordine) {
    ordine.stato = !ordine.stato; // Cambia lo stato da true a false o viceversa;
}
//FUNZIONE SCEGLI TAVOLO
function scegliTavolo(id_tavolo){
    this.id_tavolo = id_tavolo
}
module.exports = {Ordine, aggiungiPiattoAOrdine, rimuoviPiattoDaOrdine,scegliTavolo};