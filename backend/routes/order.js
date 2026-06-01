const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const orderAuth = requireAuth({
    missingMessage: 'Devi effettuare il login per vedere gli ordini',
    invalidMessage: 'Devi effettuare il login per vedere gli ordini',
});

router.get('', orderAuth, orderController.getMyOrders);
router.post('', requireAuth(), orderController.createOrder);
router.get('/staff', requireAuth(), requireRole('staff'), orderController.getAllOrders);
router.patch('/staff/:id/stato', requireAuth(), requireRole('staff'), orderController.updateAnyOrderStatus);
router.patch('/:id/stato', requireAuth({
    invalidMessage: 'Devi effettuare il login',
}), orderController.updateOrderStatus);

module.exports = router;
