const express = require('express');
const { getSponsors, getSponsor } = require('./sponsor.controller');

const router = express.Router();


router.get('/', getSponsors);

router.get('/:id', getSponsor);

module.exports = router;
