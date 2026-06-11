import { io } from 'socket.io-client';
import { API_BASE_URL, refreshAccessToken } from './client';

// Apre una connessione Socket.IO con il backend e chiama onOrderChange ogni volta
// che il server emette un evento orderCreated o orderUpdated.
// Restituisce una funzione di cleanup da chiamare quando il componente si smonta.
export function collegaRealtimeOrdini(token, onOrderChange) {
    // active serve a evitare che socket.connect() venga chiamato dopo che il componente
    // si è già smontato (es. l'utente ha cambiato pagina mentre il refresh era in corso).
    let active = true;

    const socket = io(API_BASE_URL, {
        auth: { token },
    });

    // Passiamo il tipo di evento e i dati al callback così il componente
    // può decidere se fare un aggiornamento locale mirato o un fetch completo.
    socket.on('orderCreated', (data) => onOrderChange('created', data));
    socket.on('orderUpdated', (data) => onOrderChange('updated', data));

    // connect_error scatta quando la connessione fallisce — di solito perché il token JWT
    // passato in auth è scaduto. In quel caso rinnoviamo il token e riproviamo la connessione.
    socket.on('connect_error', async () => {
        const nuovoToken = await refreshAccessToken();

        if (!active || !nuovoToken) {
            return;
        }

        socket.auth = { token: nuovoToken };
        socket.connect();
    });

    // Questa funzione viene restituita e chiamata da React nel cleanup dell'useEffect,
    // cioè quando il componente si smonta. Imposta active = false (blocca eventuali
    // reconnect in corso) e chiude la connessione Socket.IO.
    return () => {
        active = false;
        socket.disconnect();
    };
}
