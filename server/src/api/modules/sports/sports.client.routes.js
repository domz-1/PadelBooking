const express = require('express');
const { getSports, getSport } = require('./sport.controller');

const router = express.Router();


router.get('/', getSports);

router.get('/:id', getSport);

module.exports = router;
