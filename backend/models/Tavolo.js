const mongoose= require('mongoose');
//CREAZIONE SCHEMA TAVOLO
const tavoloSchema = new mongoose.Schema({
    numero_posti:{type:Number, required:true},
    stato:{type:String, required:true},
    id_tavolo:{type:Number, required:true, unique:true}
});
//CREAZIONE MODELLO TAVOLO
const Tavolo = mongoose.model('Tavolo', tavoloSchema);
module.exports = Tavolo;
