const express = require('express');
const {
    getBookings,
    getBookingLogs,
    getDailySummary,
    getBooking,
    updateBooking,
    deleteBooking,
    createBooking,
    getFreeSlots,
    syncSkedda
} = require('./booking.controller');
const { importExcel } = require('./import.controller');
const {
    getWaitlistForSlot,
    adminJoinWaitlist,
    adminDeleteWaitlist,
    getDailyWaitlist
} = require('./waitlist.controller');
const { protect, authorize } = require('../../../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

require('./docs/admin.swagger.js');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getBookings);
router.post('/', createBooking);
router.post('/import', upload.single('file'), importExcel);
router.get('/logs', getBookingLogs);
router.get('/waitlist/slot', getWaitlistForSlot);
router.get('/waitlist/daily', getDailyWaitlist);
router.post('/waitlist', adminJoinWaitlist);
router.delete('/waitlist/:id', adminDeleteWaitlist);
router.get('/daily-summary', getDailySummary);
router.get('/free-slots', getFreeSlots);
router.post('/sync-skedda', syncSkedda);

router.route('/:id')
    .get(getBooking)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;

