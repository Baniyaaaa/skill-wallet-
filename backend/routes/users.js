const router = require('express').Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', allow('admin', 'staff'), async (req, res, next) => {
  try {
    const q = req.query.role ? { role: req.query.role } : {};
    res.json(await User.find(q).select('-password').sort('-createdAt'));
  } catch (e) { next(e); }
});

router.get('/:id', allow('admin', 'staff'), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    const bookings = await Booking.find({ user: u._id }).populate('room').sort('-createdAt');
    res.json({ user: u, bookings });
  } catch (e) { next(e); }
});

// Admin creates staff/admin accounts
router.post('/', allow('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff', phone } = req.body;
    const u = await User.create({ name, email, password, role, phone });
    res.status(201).json({ _id: u._id, name: u.name, email: u.email, role: u.role });
  } catch (e) { next(e); }
});

router.put('/:id', allow('admin'), async (req, res, next) => {
  try {
    const { name, phone, address, idProof, role } = req.body;
    const u = await User.findByIdAndUpdate(req.params.id, { name, phone, address, idProof, role }, { new: true, runValidators: true }).select('-password');
    u ? res.json(u) : res.status(404).json({ message: 'User not found' });
  } catch (e) { next(e); }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
