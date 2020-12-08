const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register',(req, res) => {
    res.render('register');
});

router.get('/login',(req, res) => {
    res.render('login');
});

router.get('/user', authController.isLoggedIn, authController.getEvents,(req, res) => {
    console.log(req.userData);
    //res.render('user');
});

router.get('/createEvent',(req, res) => {
    res.render('createEvent');
});

router.get('/events',(req, res) => {
    res.render('events');
});
module.exports = router;