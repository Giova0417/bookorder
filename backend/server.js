//IMPORTO GLI STRUMENTI NECESSARI PER CREARE IL SERVER
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Carica le variabili d'ambiente dal file .env
//CREAZIONE DELL'APP (IL SERVER)
const app = express();
const authRoutes = require('./routes/auth');
const orderRoutes= require('./routes/order')

// 3. IMPOSTIAMO LE REGOLE BASE 
app.use(cors()); // Permette al futuro frontend (React) di parlare con noi 
app.use(express.json()); // Permette al server di leggere e capire i dati scritti in formato JSON
// CREIAMO LA PRIMA ROTTA (Il primo "tavolo" del nostro ristorante)
// Quando qualcuno visita l'indirizzo base ('/'), il server risponde con questo messaggio:
app.get('/', (req, res) => {
  res.send('Ciao! Il motore di Book&Order è acceso e funzionante!');
});
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
// IL COMANDO DI CONNESSIONE
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    // Se la chiamata va a buon fine, entra qui
    console.log("Connesso al database MongoDB con successo!");
})
.catch((errore) => {
    // Se la chiamata fallisce (es. password errata), entra qui
    console.log("Errore di connessione al database:", errore);
});
// 5. ACCENDIAMO IL SERVER
// Diciamo al server di restare in ascolto sulla porta 3000
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server partito con successo! Ascolto sulla porta ${PORT}`);
});