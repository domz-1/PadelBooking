const express = require('express');
const {
    createBooking,
    getBookings,
    getMyBookings,
    getBooking,
    updateBooking,
    deleteBooking
} = require('./booking.controller');
const { joinWaitlist, leaveWaitlist, getMyWaitlist } = require('./waitlist.controller');
const { convertToOpenMatch, joinOpenMatch, leaveOpenMatch, getOpenMatches } = require('./booking.controller');
const { protect } = require('../../../middleware/auth');

const router = express.Router();

require('./docs/client.swagger.js');

router.use(protect);

router.route('/waitlist')
    .post(joinWaitlist)
    .get(getMyWaitlist);

router.delete('/waitlist/:id', leaveWaitlist);
router.get('/open-matches', getOpenMatches);
router.post('/:id/convert-to-open-match', convertToOpenMatch);
router.post('/:id/join', joinOpenMatch);
router.post('/:id/leave', leaveOpenMatch);
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/my-bookings', getMyBookings);

router.route('/:id')
    .get(getBooking)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;

