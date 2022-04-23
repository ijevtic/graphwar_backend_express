const express = require('express');

const register = express.Router();
const User = require('../models/User');

register.post('/', async(req,res) => {
    res.send('register');
    
});

module.exports = register;