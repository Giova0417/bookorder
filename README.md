# Book&Order

Book&Order e una Single Page Application per gestire ordini al tavolo in un ristorante. Il cliente consulta il menu, aggiunge prodotti al carrello e invia l'ordine; lo staff vede gli ordini in tempo reale e aggiorna lo stato.

## Struttura

- `backend`: API Node.js/Express, MongoDB/Mongoose, JWT, refresh token e Socket.IO.
- `frontend`: SPA React con React Router, Material UI e Socket.IO client.
- `docs`: documentazione d'esame, diagrammi UML e specifica OpenAPI.

## Avvio locale

Backend:

```powershell
cd backend
npm install
copy .env.example .env
npm start
```

Frontend:

```powershell
cd frontend
npm install
copy .env.example .env
npm start
```

URL locali:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check backend: `http://localhost:5000/api/health`

## Variabili principali

Backend:

- `MONGO_URI`: stringa di connessione MongoDB Atlas.
- `JWT_SECRET`: segreto usato per firmare gli access token.
- `PORT`: porta del backend, default `5000`.
- `STAFF_CODE`: codice richiesto per registrare un account staff.
- `FRONTEND_URL`: origin frontend autorizzati da CORS, separati da virgola.

Frontend:

- `PORT`: porta dev server React.
- `REACT_APP_API_URL`: base URL del backend.

## Documentazione

- Documentazione progetto: `docs/project-documentation.md`
- Specifica OpenAPI/Swagger: `docs/openapi.yaml`
- UML casi d'uso: `docs/uml-use-cases.puml`
- UML sequenza realtime: `docs/uml-order-realtime-sequence.puml`
- Checklist deployment: `docs/deployment-checklist.md`

## Consegna

Per la consegna zip rimuovere `node_modules` da `backend` e `frontend`, non includere `.env` con segreti reali e fornire credenziali di test nel documento finale.
