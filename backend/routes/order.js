const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const orderAuth = requireAuth({
  missingMessage: 'Devi effettuare il login per vedere gli ordini',
  invalidMessage: 'Devi effettuare il login per vedere gli ordini',
});

// GET /api/order
// Cliente loggato: vede solo i propri ordini.
router.get('', orderAuth, orderController.getMyOrders);

// POST /api/order
// Cliente loggato: crea un ordine dal carrello.
router.post('', requireAuth(), orderController.createOrder);

// GET /api/order/staff
// Staff: vede tutti gli ordini.
router.get('/staff', requireAuth(), requireRole('staff'), orderController.getAllOrders);

// PATCH /api/order/staff/:id/stato
// Staff: cambia lo stato di qualsiasi ordine.
router.patch('/staff/:id/stato', requireAuth(), requireRole('staff'), orderController.updateAnyOrderStatus);

module.exports = router;
