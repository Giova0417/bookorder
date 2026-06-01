const mongoose = require('mongoose');
//GESTIAMO AUTENTICAZIONE UTENTE
const utenteSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    role:{type:String, enum:['cliente', 'staff'], default:'cliente'},
});
const Utente = mongoose.model('Utente', utenteSchema);
module.exports = Utente;
