const router = require('express').Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');

// List rooms; if checkIn & checkOut given, only rooms free for those dates
router.get('/', async (req, res, next) => {
  try {
    const { checkIn, checkOut, type, maxPrice, guests } = req.query;
    const q = { status: 'available' };
    if (type) q.type = type;
    if (maxPrice) q.price = { $lte: Number(maxPrice) };
    if (guests) q.capacity = { $gte: Number(guests) };
    let rooms = await Room.find(q).sort('price');
    if (checkIn && checkOut) {
      const busy = await Booking.find({
        status: { $in: ['confirmed', 'checked-in'] },
        checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) }
      }).distinct('room');
      const busySet = new Set(busy.map(String));
      rooms = rooms.filter(r => !busySet.has(String(r._id)));
    }
    res.json(rooms);
  } catch (e) { next(e); }
});

// Staff/admin list (includes maintenance rooms)
router.get('/all', protect, allow('admin', 'staff'), async (req, res, next) => {
  try { res.json(await Room.find().sort('number')); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const r = await Room.findById(req.params.id);
    r ? res.json(r) : res.status(404).json({ message: 'Room not found' });
  } catch (e) { next(e); }
});

router.post('/', protect, allow('admin'), async (req, res, next) => {
  try { res.status(201).json(await Room.create(req.body)); } catch (e) { next(e); }
});

router.put('/:id', protect, allow('admin'), async (req, res, next) => {
  try {
    const r = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    r ? res.json(r) : res.status(404).json({ message: 'Room not found' });
  } catch (e) { next(e); }
});

router.delete('/:id', protect, allow('admin'), async (req, res, next) => {
  try {
    const active = await Booking.exists({ room: req.params.id, status: { $in: ['confirmed', 'checked-in'] } });
    if (active) return res.status(400).json({ message: 'Room has active bookings' });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
