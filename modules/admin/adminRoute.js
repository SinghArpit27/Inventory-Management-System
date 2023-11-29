const router = require('express').Router();


const authenticateToken = require('../../middleware/jwtAuthorization');
const adminController = require('./adminController');


// Add Static Data Route
// In this Route Admin can Add Anything In Role table And Status table
router.post('/add-static-data', adminController.addStaticData);


// Admin Login Route
router.post('/login', adminController.login);


// Create User Route
router.post('/create-user', authenticateToken, adminController.createUser);

// Get All Users
router.get('/users-list', authenticateToken, adminController.getUsersList);

// Update User
router.put('/update-user', authenticateToken, adminController.updateUserDetails);

// Add New Godown
router.post('/add-godown', authenticateToken, adminController.addGodown);


// Update Godown Manager
// INPUT:- this route get 2 query 1 is uuid which is for user 2nd one is guuid this is a godown uuid
// OUTPUT:- Get godown uuid to find godown and then add manager into godown by using uuid from user table
router.put('/update-godown-manager', authenticateToken, adminController.addGodownManager);


// // Get All Godown List
router.get('/get-godown-list', authenticateToken, adminController.getGodownList);

// router.get('/get-godown-list', adminController.getGodownList);


module.exports = router;