import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { aggiornaStatoOrdineStaff, caricaOrdiniStaff } from '../api/orders';
import { collegaRealtimeOrdini } from '../api/realtime';

// --- ARROW FUNCTION: cos'è e perché si usa ---
// Una arrow function è una sintassi compatta per scrivere funzioni anonime (senza nome).
// Forma base:        (parametri) => { corpo }
// Con un solo return: (parametri) => espressione    ← le parentesi graffe e "return" si omettono
//
// Esempio equivalente:
//   function normale(x) { return x * 2; }
//   const arrow       = (x) => x * 2;            ← stessa cosa, meno parole
//
// Dove le usiamo in React:
//   1. Come callback di .map() / .filter() / .reduce() — operazioni su array
//   2. Come handler di eventi: onClick={() => faiQualcosa()} — "rimanda" la chiamata al click
//   3. Come aggiornamento funzionale di stato: setOrdini((prev) => ...)
//
// La differenza cruciale con le funzioni normali:
//   onClick={faiQualcosa}       → passa il RIFERIMENTO, la funzione viene chiamata al click ✓
//   onClick={faiQualcosa()}     → chiama faiQualcosa SUBITO durante il render, NON al click ✗
//   onClick={() => faiQualcosa(id)} → serve la arrow per poter passare anche un argomento ✓

const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];
const TEMPO_USCITA_ORDINE = 260;

// Arrow function con un parametro e un return implicito (no graffe, no "return"):
// price => `...` è equivalente a function(price) { return `...`; }
const formatPrice = (price) => `${price.toFixed(2).replace('.', ',')} EUR`;

// Funzione di utilità definita FUORI dal componente: non dipende da nessuno stato
// e non ha bisogno di essere ricreata ad ogni render. Riceve l'ordine come parametro (prop).
function totaleOrdine(ordine) {
    // .reduce(callback, valoreIniziale): accumula un unico valore scorrendo l'array.
    // (sum, item) => sum + item.prezzo * item.quantita è la arrow callback:
    //   - sum: il totale accumulato finora (parte da 0)
    //   - item: l'elemento corrente dell'array cartItems
    // Ad ogni iterazione somma (prezzo × quantità) al totale precedente.
    return ordine.cartItems.reduce((sum, item) => sum + item.prezzo * item.quantita, 0);
}

// Altra funzione pura fuori dal componente: dato uno stato restituisce i colori CSS.
// "Pura" significa che per lo stesso input restituisce sempre lo stesso output, senza effetti collaterali.
function statoSx(stato) {
    if (stato === 'In preparazione') return { backgroundColor: '#ff8400', color: '#111' };
    if (stato === 'Pronto') return { backgroundColor: '#1976d2', color: '#fff' };
    return { backgroundColor: '#2e7d32', color: '#fff' };
}

// StaffOrders è un componente React: una funzione JavaScript che restituisce JSX.
// React chiama questa funzione ogni volta che lo stato cambia (re-render).
function StaffOrders() {

    // useState dichiara variabili di stato. React le "ricorda" tra un render e l'altro.
    // useState([]) restituisce [valore, setValore]: ogni volta che chiami setValore(nuovoValore),
    // React re-renderizza il componente con il nuovo valore.
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);

    // inUscita contiene gli ID degli ordini in animazione di uscita.
    // È un Set (non un array): .has(id) verifica l'appartenenza in O(1) — tempo costante,
    // indipendentemente da quanti ordini ci sono. Con un array sarebbe O(n).
    const [inUscita, setInUscita] = useState(new Set());

    async function caricaOrdini(mostraLoading = false) {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login come staff');
            if (mostraLoading) setLoading(false);
            return;
        }
        if (mostraLoading) setLoading(true);
        try {
            const lista = await caricaOrdiniStaff();
            setErrore('');
            // .filter((o) => condizione): arrow function come criterio di selezione.
            // Per ogni ordine o, se o.stato !== 'Consegnato' è true → incluso nel nuovo array.
            // Gli ordini Consegnati sono gestiti localmente con l'animazione di uscita.
            setOrdini(lista.filter((o) => o.stato !== 'Consegnato'));
        } catch {
            setErrore('Errore di connessione al server');
        } finally {
            // Solo il caricamento iniziale (mostraLoading=true) gestisce lo spinner.
            // Le chiamate dal socket non toccano mai loading per evitare flash visivi.
            if (mostraLoading) setLoading(false);
        }
    }

    async function cambiaStato(ordineId, stato) {
        try {
            await aggiornaStatoOrdineStaff(ordineId, stato);
            setErrore('');

            if (stato === 'Consegnato') {
                // --- Aggiornamento locale ottimistico ---
                // Invece di ri-chiamare il server, modifichiamo direttamente lo stato in memoria.
                // React richiede IMMUTABILITÀ: non puoi fare prev[i].stato = stato perché
                // modificheresti l'oggetto esistente senza creare un nuovo array,
                // e React non si accorgerebbe del cambiamento e non ri-renderizzerebbe.
                //
                // setOrdini riceve una arrow function (prev) => ...:
                //   - React la chiama passando il valore ATTUALE di ordini come argomento "prev"
                //   - È il modo sicuro per aggiornare lo stato basandosi sul valore precedente
                //   - Senza questa forma, se due aggiornamenti arrivano in rapida successione,
                //     il secondo potrebbe sovrascrivere il primo leggendo uno stato obsoleto
                //
                // .map((o) => ...): arrow function applicata a ogni elemento dell'array:
                //   - o._id === ordineId → restituisce { ...o, stato }
                //     { ...o } crea una COPIA dell'oggetto con tutte le sue proprietà (spread).
                //     Poi "stato" (shorthand per stato: stato) sovrascrive solo il campo stato.
                //   - altrimenti → restituisce o invariato (l'ordine non cambia).
                setOrdini((prev) => prev.map((o) => o._id === ordineId ? { ...o, stato } : o));

                // --- Set: struttura dati per valori unici ---
                // new Set([...prev, ordineId]):
                //   - ...prev: l'operatore spread "espande" il Set in un array (es. ['id1', 'id2'])
                //   - aggiunge ordineId alla fine dell'array
                //   - new Set(...) ricrea un Set da quell'array — duplicati verrebbero ignorati
                // Bisogna creare un NUOVO Set (non modificare quello esistente)
                // per lo stesso motivo dell'immutabilità: React deve ricevere un valore nuovo.
                // L'ID aggiunto qui farà scattare l'animazione CSS opacity 0 su quella card.
                setInUscita((prev) => new Set([...prev, ordineId]));

                // Dopo TEMPO_USCITA_ORDINE ms (= durata dell'animazione CSS):
                // La arrow function () => { ... } è il callback di setTimeout:
                // verrà chiamata automaticamente dal browser dopo 260ms.
                //
                // Dentro, due aggiornamenti:
                //   1. Rimuove l'id da inUscita:
                //      (prev) => { const s = new Set(prev); s.delete(ordineId); return s; }
                //      Creiamo una copia del Set (new Set(prev)), poi .delete() rimuove l'id,
                //      poi return s restituisce la copia modificata — sempre immutabilità.
                //   2. Rimuove l'ordine dall'array:
                //      (prev) => prev.filter((o) => o._id !== ordineId)
                //      .filter restituisce un nuovo array escludendo l'ordine con quell'id.
                setTimeout(() => {
                    setInUscita((prev) => { const s = new Set(prev); s.delete(ordineId); return s; });
                    setOrdini((prev) => prev.filter((o) => o._id !== ordineId));
                }, TEMPO_USCITA_ORDINE);
            } else {
                // Per In preparazione ↔ Pronto: stesso pattern .map() spiegato sopra.
                // Nessuna animazione, nessun setTimeout — solo aggiornamento del campo stato.
                setOrdini((prev) => prev.map((o) => o._id === ordineId ? { ...o, stato } : o));
            }
        } catch (e) {
            setErrore(e.message || 'Errore durante aggiornamento stato');
        }
    }

    // useEffect esegue il codice al primo render (array di dipendenze [] vuoto = esegue solo una volta).
    // La funzione restituita è la "cleanup function": React la chiama quando il componente
    // si smonta (es. l'utente cambia pagina). Qui disconnette il socket Socket.IO.
    //
    // () => caricaOrdini() è una arrow function wrapper necessaria: se passassimo caricaOrdini
    // direttamente, Socket.IO passerebbe i dati dell'evento come primo argomento, che verrebbe
    // interpretato come mostraLoading=true causando il flash dello spinner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        caricaOrdini(true);
        const token = getAccessToken();
        if (!token) return;
        return collegaRealtimeOrdini(token, () => caricaOrdini());
    }, []);

    // Dati derivati: ricalcolati automaticamente ad ogni render da ordini.
    // Non sono useState perché sarebbe una copia duplicata dello stesso dato.
    // (o) => o.stato === 'In preparazione': arrow function passata a .filter() come criterio.
    const inPreparazione = ordini.filter((o) => o.stato === 'In preparazione').length;
    const pronti = ordini.filter((o) => o.stato === 'Pronto').length;

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        Staff ordini
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.68)', fontWeight: 800, mt: 1 }}>
                        {inPreparazione} in preparazione / {pronti} pronti
                    </Typography>
                </Box>

                {/* Rendering condizionale con &&: se errore è una stringa non vuota (truthy),
                    React mostra il componente Alert. Se è '' (falsy), non mostra nulla. */}
                {errore && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errore}
                    </Alert>
                )}

                {errore.includes('login') && (
                    <Button component={Link} to="/login" variant="contained" sx={{ mb: 3 }}>
                        Vai al login
                    </Button>
                )}

                {/* loading && ordini.length === 0: mostra lo spinner solo al primo caricamento.
                    Se ci sono già ordini in memoria, le card restano visibili durante gli aggiornamenti. */}
                {loading && ordini.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                        {ordini.length === 0 && !errore ? (
                            <Card sx={{ backgroundColor: '#242424', borderRadius: '18px' }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                        Nessun ordine in sala
                                    </Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            // .map((ordine) => JSX): arrow function che trasforma ogni elemento
                            // dell'array in un componente Card. key={ordine._id} è OBBLIGATORIO:
                            // React lo usa per identificare quale card aggiornare/aggiungere/rimuovere.
                            ordini.map((ordine) => (
                                <Card key={ordine._id} sx={{
                                    backgroundColor: '#242424',
                                    borderRadius: '18px',
                                    border: '1px solid rgba(255,132,0,0.24)',
                                    // Ternario: se l'id è nel Set inUscita → opacity 0 (invisibile),
                                    // altrimenti → opacity 1. CSS transition anima il passaggio.
                                    opacity: inUscita.has(ordine._id) ? 0 : 1,
                                    transform: inUscita.has(ordine._id) ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)',
                                    transition: 'opacity 220ms ease, transform 220ms ease',
                                    pointerEvents: inUscita.has(ordine._id) ? 'none' : 'auto',
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                                            <Box>
                                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                                                    Tavolo {ordine.numeroTavolo}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                                                    Ordine {ordine._id}
                                                </Typography>
                                            </Box>
                                            {/* Badge stato: {...statoSx(ordine.stato)} espande l'oggetto
                                                { backgroundColor, color } dentro sx insieme agli altri stili.
                                                fontFamily 'monospace' differenzia visivamente il badge
                                                dal resto del testo della card. */}
                                            <Typography sx={{
                                                ...statoSx(ordine.stato),
                                                fontFamily: '"Courier New", Courier, monospace',
                                                fontWeight: 700,
                                                fontSize: '12px',
                                                borderRadius: '100px',
                                                px: 2,
                                                py: 0.6,
                                                letterSpacing: 0.6,
                                                display: 'inline-block',
                                                alignSelf: 'flex-start',
                                            }}>
                                                {ordine.stato}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                                        {/* .map() annidato: per ogni ordine, .map() sugli articoli.
                                            key combina i due id per essere univoca globalmente. */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {ordine.cartItems.map((item) => (
                                                <Box key={`${ordine._id}-${item.id}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2 }}>
                                                    <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                                                        {item.quantita} x {item.nome}
                                                    </Typography>
                                                    <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                                        {formatPrice(item.prezzo * item.quantita)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography sx={{ color: '#fff', fontWeight: 900 }}>Totale</Typography>
                                            <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                                {formatPrice(totaleOrdine(ordine))}
                                            </Typography>
                                        </Box>

                                        {/* .map((stato) => <Button>): crea i 3 bottoni da statiOrdine[].
                                            onClick={() => cambiaStato(ordine._id, stato)}:
                                            la arrow function () => ... è necessaria perché dobbiamo
                                            passare argomenti (ordine._id e stato) a cambiaStato.
                                            Senza la arrow, cambiaStato verrebbe chiamata SUBITO
                                            durante il render invece che al click dell'utente. */}
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {statiOrdine.map((stato) => (
                                                <Button
                                                    key={stato}
                                                    variant={ordine.stato === stato ? 'contained' : 'outlined'}
                                                    onClick={() => cambiaStato(ordine._id, stato)}
                                                    sx={{
                                                        borderColor: '#ff8400',
                                                        color: ordine.stato === stato ? '#111' : '#ff8400',
                                                        backgroundColor: ordine.stato === stato ? '#ff8400' : 'transparent',
                                                        fontWeight: 900,
                                                        '&:hover': { backgroundColor: '#ff9d2e', color: '#111' },
                                                    }}
                                                >
                                                    {stato}
                                                </Button>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default StaffOrders;
