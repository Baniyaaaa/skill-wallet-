const router = require('express').Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, allow } = require('../middleware/auth');

const populate = [{ path: 'room' }, { path: 'user', select: 'name email phone' }];
const DAY = 86400000;

router.post('/', protect, async (req, res, next) => {
  try {
    const { room: roomId, checkIn, checkOut, guests = 1, specialRequests } = req.body;
    const ci = new Date(checkIn), co = new Date(checkOut);
    if (isNaN(ci) || isNaN(co)) return res.status(400).json({ message: 'Valid dates are required' });
    if (co <= ci) return res.status(400).json({ message: 'Check-out must be after check-in' });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (ci < today) return res.status(400).json({ message: 'Check-in cannot be in the past' });

    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') return res.status(400).json({ message: 'Room not available' });
    if (guests > room.capacity) return res.status(400).json({ message: `Room sleeps ${room.capacity} guests max` });

    const clash = await Booking.exists({
      room: roomId, status: { $in: ['confirmed', 'checked-in'] },
      checkIn: { $lt: co }, checkOut: { $gt: ci }
    });
    if (clash) return res.status(409).json({ message: 'Room already booked for these dates' });

    const nights = Math.round((co - ci) / DAY);
    const booking = await Booking.create({
      user: req.user._id, room: roomId, checkIn: ci, checkOut: co, guests, nights,
      totalAmount: nights * room.price, specialRequests
    });
    res.status(201).json(await booking.populate(populate));
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Booking.find({ user: req.user._id }).populate(populate).sort('-createdAt')); }
  catch (e) { next(e); }
});

router.get('/', protect, allow('admin', 'staff'), async (req, res, next) => {
  try {
    const q = req.query.status ? { status: req.query.status } : {};
    res.json(await Booking.find(q).populate(populate).sort('-createdAt'));
  } catch (e) { next(e); }
});

router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = String(b.user) === String(req.user._id);
    if (!isOwner && req.user.role === 'guest') return res.status(403).json({ message: 'Access denied' });
    if (b.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    b.status = 'cancelled';
    if (b.paymentStatus === 'paid') b.paymentStatus = 'refunded';
    await b.save();
    res.json(await b.populate(populate));
  } catch (e) { next(e); }
});

router.put('/:id/checkin', protect, allow('admin', 'staff'), async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (b.status !== 'confirmed') return res.status(400).json({ message: 'Booking is not in confirmed state' });
    b.status = 'checked-in'; await b.save();
    res.json(await b.populate(populate));
  } catch (e) { next(e); }
});

router.put('/:id/checkout', protect, allow('admin', 'staff'), async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (b.status !== 'checked-in') return res.status(400).json({ message: 'Guest has not checked in' });
    if (b.paymentStatus !== 'paid') return res.status(400).json({ message: 'Payment pending: collect payment before check-out' });
    b.status = 'checked-out'; await b.save();
    res.json(await b.populate(populate));
  } catch (e) { next(e); }
});

module.exports = router;
