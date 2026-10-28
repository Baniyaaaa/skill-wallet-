const router = require('express').Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, allow('admin', 'staff'), async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);
    const [totalRooms, occupied, guests, bookings, revenueAgg, todayCheckins, todayCheckouts, byStatus] = await Promise.all([
      Room.countDocuments({ status: 'available' }),
      Booking.countDocuments({ status: 'checked-in' }),
      User.countDocuments({ role: 'guest' }),
      Booking.countDocuments(),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Booking.countDocuments({ status: 'confirmed', checkIn: { $gte: start, $lt: end } }),
      Booking.countDocuments({ status: 'checked-in', checkOut: { $lt: end } }),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({
      totalRooms, occupied,
      occupancyRate: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
      guests, bookings,
      revenue: revenueAgg[0]?.total || 0,
      todayCheckins, todayCheckouts,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count]))
    });
  } catch (e) { next(e); }
});

module.exports = router;
