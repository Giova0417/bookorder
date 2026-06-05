const { Ordine, statiOrdine } = require('../models/Ordine');
const realtimeService = require('../services/realtimeService');

function isValidOrderStatus(stato) {
  return statiOrdine.includes(stato);
}

function notifyOrderCreated(ordine, userId) {
  realtimeService.emitToUser(userId, 'orderCreated', {
    orderId: ordine._id,
    stato: ordine.stato,
  });

  realtimeService.emitToStaff('orderCreated', {
    orderId: ordine._id,
    stato: ordine.stato,
    numeroTavolo: ordine.numeroTavolo,
  });
}

function notifyOrderUpdated(ordine) {
  realtimeService.emitToUser(ordine.idUtente, 'orderUpdated', {
    orderId: ordine._id,
    stato: ordine.stato,
  });

  realtimeService.emitToStaff('orderUpdated', {
    orderId: ordine._id,
    stato: ordine.stato,
    numeroTavolo: ordine.numeroTavolo,
  });
}

async function getMyOrders(req, res) {
  try {
    const ordini = await Ordine.find({ idUtente: req.userId }).sort({ _id: -1 }).lean();
    return res.status(200).json({ ordini });
  } catch (errore) {
    console.log(errore);
    return res.status(500).json({ message: 'Errore nel recupero degli ordini' });
  }
}

async function createOrder(req, res) {
  try {
    const { cartItems, numeroTavolo } = req.body;

    if (!numeroTavolo) {
      return res.status(400).json({ message: 'Inserisci un tavolo' });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Il carrello e vuoto' });
    }

    const ordine = await Ordine.create({
      cartItems,
      idUtente: req.userId,
      numeroTavolo,
    });

    notifyOrderCreated(ordine, req.userId);

    return res.status(201).json({
      message: 'ORDINE EFFETTUATO CON SUCCESSO',
      ordine,
    });
  } catch (errore) {
    console.log(errore);
    return res.status(500).json({ message: 'Ordine non registrato nel database. Riprova.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { stato } = req.body;

    if (!isValidOrderStatus(stato)) {
      return res.status(400).json({ message: 'Stato ordine non valido' });
    }

    const ordine = await Ordine.findOneAndUpdate(
      { _id: req.params.id, idUtente: req.userId },
      { stato },
      { new: true, runValidators: true }
    );

    if (!ordine) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    realtimeService.emitToUser(req.userId, 'orderUpdated', {
      orderId: ordine._id,
      stato: ordine.stato,
    });

    return res.status(200).json({
      message: 'Stato ordine aggiornato',
      ordine,
    });
  } catch (errore) {
    console.log(errore);
    return res.status(500).json({ message: 'Errore durante aggiornamento stato ordine' });
  }
}

async function getAllOrders(req, res) {
  try {
    const ordini = await Ordine.find({}).sort({ _id: -1 }).lean();
    return res.status(200).json({ ordini });
  } catch (errore) {
    console.log(errore);
    return res.status(500).json({ message: 'Errore nel recupero degli ordini staff' });
  }
}

async function updateAnyOrderStatus(req, res) {
  try {
    const { stato } = req.body;

    if (!isValidOrderStatus(stato)) {
      return res.status(400).json({ message: 'Stato ordine non valido' });
    }

    const ordine = await Ordine.findByIdAndUpdate(
      req.params.id,
      { stato },
      { new: true, runValidators: true }
    );

    if (!ordine) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    notifyOrderUpdated(ordine);

    return res.status(200).json({
      message: 'Stato ordine aggiornato',
      ordine,
    });
  } catch (errore) {
    console.log(errore);
    return res.status(500).json({ message: 'Errore durante aggiornamento stato ordine staff' });
  }
}

module.exports = {
  getMyOrders,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  updateAnyOrderStatus,
};