//IMPORTO GLI STRUMENTI NECESSARI PER CREARE IL SERVER
//Uso CommonJS — require — perché siamo in Node.js, non nel frontend React dove si usa ES Modules con import.
const express = require('express');//express è il framework che semplifica la creazione di server HTTP in Node.
//  Senza Express dovrei gestire manualmente routing, parsing del body e header — con decine di righe di codice grezzo.
const http = require('http');//http è il modulo built-in di Node per creare un server TCP.
//  Lo uso non per fare richieste, ma per creare l'istanza server su cui poi aggancio Socket.IO. Express da sola non basta a Socket.IO — ha bisogno del server HTTP sottostante.
const cors = require('cors');//cors è un middleware che aggiunge gli header HTTP necessari per 
// permettere al browser di fare richieste cross-origin — cioè dal frontend React su localhost:3000 al backend su localhost:5000.
//  Senza cors il browser bloccherebbe tutte le richieste per la same-origin policy.
const mongoose = require('mongoose');//mongoose è l'ODM — Object Document Mapper — che mi permette di definire schemi e interagire con MongoDB usando oggetti JavaScript invece di query grezze.
const dotenv = require('dotenv');//dotenv carica il file .env e inserisce tutte le variabili dentro
//  process.env. Senza dotenv, process.env.MONGO_URI sarebbe undefined.
const path = require('path');//path è un modulo built-in di Node per lavorare con i percorsi di file 
// in modo cross-platform — funziona sia su Windows che su Linux/Mac.
dotenv.config({ path: path.join(__dirname, '.env') }); // dotenv.config deve essere chiamato prima 
// di tutto il resto, altrimenti process.env.MONGO_URI e le altre variabili non sono ancora disponibili quando il codice le legge.
//CREAZIONE DELL'APP (IL SERVER)
const app = express(); //crea l'applicazione Express — è il cuore del server, gestisce routing e middleware.
const server = http.createServer(app); //avvolge l'app Express in un server HTTP di Node.
//  Questo server sarà condiviso sia da Express sia da Socket.IO — è il punto di aggancio comune.
const authRoutes = require('./routes/auth');//importo le rotte express che andrò ad usare
//"Le rotte seguono i principi REST descritti nel PP7: ogni risorsa ha un URL preciso,
//  le operazioni usano i metodi HTTP corretti. L'architettura è three-tier: React è il presentation tier, 
// Express con i suoi controller è l'application tier, 
// MongoDB è il data tier. I tre livelli comunicano solo tramite interfacce definite — il frontend non tocca mai direttamente il database."
const orderRoutes = require('./routes/order');
const { initializeRealtime } = require('./services/realtimeService');

function normalizeOrigin(origin) {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.trim().replace(/\/$/, '');
  }
}

const developmentOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const configuredOrigins = (process.env.FRONTEND_URL || '') //Leggo FRONTEND_URL dal .env — 
// in produzione conterrà qualcosa come https://book-order.vercel.app. 
// Può contenere più URL separati da virgola. La catena di metodi://.split(',') divide la stringa in array
//.map(trim) toglie spazi bianchi da ciascun elemento
//.filter(Boolean) elimina stringhe vuote che si creano se c'è una virgola finale
//.map(normalizeOrigin) normalizza ogni URL con la funzione del passo 1
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const allowedOrigins = [ //Combino le origini configurate con quelle di sviluppo. 
// new Set(...) elimina i duplicati automaticamente — se FRONTEND_URL contenesse anche un localhost non apparirebbe due volte. 
// La condizione NODE_ENV === 'production' ? [] : developmentOrigins significa: in produzione i localhost non vengono mai aggiunti.
  ...new Set([
    ...configuredOrigins,
    ...(process.env.NODE_ENV === 'production' ? [] : developmentOrigins),
  ]),
];

//Invece di un valore statico, passo a cors una funzione che viene chiamata per ogni richiesta. 
// !origin permette richieste senza header Origin — come quelle di Postman o curl.
//  credentials: true è obbligatorio per inviare e ricevere cookie — come il refresh token HTTPOnly.
//  Come spiega il PP6, con credentials non puoi usare origin: '*', devi specificare origini esatte.
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error('Origine non consentita da CORS'));
  },
  credentials: true,
};
//Aggancio Socket.IO al server HTTP passandogli le stesse corsOptions. 
// Deve avvenire prima di app.use(cors(...)) perché Socket.IO ha bisogno dell'istanza del server, non dell'app Express.

initializeRealtime(server, corsOptions);

// 3. IMPOSTIAMO LE REGOLE BASE
//app.use registra middleware che si eseguono su ogni richiesta, nell'ordine in cui sono scritti.
app.use(cors(corsOptions)); // "Il browser implementa la same-origin policy descritta nel PP6: 
// blocca di default le richieste HTTP che partono da un'origine diversa da quella del server. 
//Permette al frontend React di parlare con noi e ricevere cookie HTTPOnly.
//cors(corsOptions) aggiunge gli header CORS alle risposte: Access-Control-Allow-Origin,
//  Access-Control-Allow-Credentials. Il browser li legge prima di permettere al frontend di accedere alla risposta.
app.use(express.json()); // express.json() parsa il body JSON delle richieste e lo mette su req.body. 
// Senza di questo, req.body nelle funzioni dei controller sarebbe undefined.
// CREIAMO LA PRIMA ROTTA
//La prima rotta è solo un messaggio di benvenuto.
// /api/health è un endpoint di monitoring che permette a strumenti esterni di verificare che il server sia vivo — risponde sempre 200 con un JSON.
app.get('/', (req, res) => {
  res.send('Ciao! Il motore di Book&Order è acceso e funzionante!');
});
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'book-order-backend',
  });
});
//app.use('/api/auth', authRoutes) monta il router delle rotte di autenticazione sul prefisso /api/auth.
//  Tutte le route definite dentro authRoutes — come /login, /register — diventano automaticamente /api/auth/login, /api/auth/register.
//"app.use registra middleware — funzioni con la firma (req, res, next) che Express esegue in ordine su ogni richiesta.
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);
// IL COMANDO DI CONNESSIONE
//mongoose.connect restituisce una Promise.
//  Uso .then e .catch invece di async/await perché siamo al top level del file, fuori da qualsiasi funzione async. 
// L'URI di MongoDB Atlas viene dalle variabili d'ambiente — mai hardcoded nel codice sorgente, 
// altrimenti chiunque veda il repo GitHub avrebbe accesso al database.
mongoose.connect(process.env.MONGO_URI)//"MongoDB è un database NoSQL document-oriented del PP8-9:
//  i dati sono documenti BSON invece di righe in tabelle. Mongoose è l'ODM che ci permette di definire schemi e validazioni sopra MongoDB,
//  che nativamente è schema-less.
//  La connessione restituisce una Promise — Node gestisce questo in modo non bloccante: mentre aspetta la connessione, 
// l'event loop continua a processare altre operazioni."
  .then(() => {
    // Se la chiamata va a buon fine, entra qui
    console.log("Connesso al database MongoDB con successo!");
  })
  .catch((errore) => {
    // Se la chiamata fallisce (es. password errata), entra qui
    console.log("Errore di connessione al database:", errore);
  });
// 5. ACCENDIAMO IL SERVER
//process.env.PORT || 5000 — in produzione su piattaforme come Railway o Render la porta viene assegnata dalla piattaforma tramite variabile d'ambiente
//  In locale usiamo 5000 come default. Nota: chiamo server.listen e non app.listen —
//  perché server è l'istanza http.Server che contiene sia Express sia Socket.IO. Se chiamassi app.listen creerei un secondo server separato e Socket.IO non funzionerebbe.
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {//"Il server rimane passivo sulla porta 5000 aspettando richieste —
//  questo è esattamente il paradigma client-server descritto nel PP1: 
// il client inizia sempre la comunicazione, il server non fa nulla finché non arriva una richiesta."
  console.log(`Server partito con successo! Ascolto sulla porta ${PORT}`);
});
 //"server.js fa tre cose: configura l'ambiente leggendo le variabili dal .env,
 //  costruisce la whitelist delle origini CORS separando sviluppo e produzione, 
 // e avvia un unico server HTTP condiviso tra Express e Socket.IO — in quest'ordine preciso perché ogni blocco dipende da quello prima."