const express = require('express');
const router = express.Router();
const {
    sendContact,
    getContactByAdmin,
    updateStatusContact,
    getContactedByAdmin
} = require('../controllers/Contact.controller');

router.post('/sendContact', sendContact);
router.get('/getContactByAdmin', getContactByAdmin);
router.get('/getContactedByAdmin', getContactedByAdmin);
router.put('/updateStatusContact/:id', updateStatusContact);


module.exports = router;