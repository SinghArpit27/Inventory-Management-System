const router = require('express').Router();


const authenticateToken = require('../../middleware/jwtAuthorization');
const userController = require('./userController');


// Admin Login Route
router.post('/login', userController.login);

router.put('/change-password', authenticateToken, userController.changePassword);

router.post('/items-inwards', authenticateToken, userController.inwardProducts);

router.post('/items-delivery', authenticateToken, userController.deliveryProducts);

router.post('/return-items', authenticateToken, userController.returnProducts);

module.exports = router;