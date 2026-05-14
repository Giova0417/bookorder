const mongoose = require('mongoose');
//DEFINISCO LO SCHEMA DEL PIATTO
const piattoSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},});
//CREO IL MODELLO DEL PIATTO
const Piatto = mongoose.model('Piatto', piattoSchema);
module.exports = Piatto;
