//IMPORTO GLI STRUMENTI NECESSARI PER CREARE IL SERVER
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') }); // Carica sempre backend/.env
const app = express();
//CREAZIONE DELL'APP (IL SERVER)
const server = http.createServer(app);
const authRoutes = require('./routes/auth');
const orderRoutes= require('./routes/order')
const { initializeRealtime } = require('./services/realtimeService');
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origine non consentita da CORS'));
  },
  credentials: true,
};

initializeRealtime(server, corsOptions);

// 3. IMPOSTIAMO LE REGOLE BASE 
app.use(cors(corsOptions)); // Permette al frontend React di parlare con noi e ricevere cookie HTTPOnly
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
server.listen(PORT, () => {
  console.log(`Server partito con successo! Ascolto sulla porta ${PORT}`);
});
