const express = require('express');
const router = express.Router();
const {
    sendContact,
    getContactByAdmin,
    updateStatusContact
} = require('../controllers/Contact.controller');

router.post('/sendContact', sendContact);
router.get('/getContactByAdmin', getContactByAdmin);
router.put('/updateStatusContact/:id', updateStatusContact);


module.exports = router;