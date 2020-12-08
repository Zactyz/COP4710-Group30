const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/createEvent', authController.createEvent);

router.post('/orderByDate', authController.orderByDate);

router.post('/joinEvent', authController.joinEvent);

router.post('/showAllEvents', authController.getEventsByAdmin);

router.post('/showActiveEvents', authController.showActiveEvents);

module.exports = router;