const express = require('express');
const router = express.Router();
const {
    sendContact,
    getContactByAdmin,
} = require('../controllers/Contact.controller');

router.post('/sendContact', sendContact);
router.get('/getContactByAdmin', getContactByAdmin);


module.exports = router;