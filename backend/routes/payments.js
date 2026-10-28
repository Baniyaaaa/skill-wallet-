const router = require('express').Router();
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');

// Simulated payment. Replace with a real gateway (Stripe / Razorpay) in production.
router.post('/', protect, async (req, res, next) => {
  try {
    const { bookingId, method = 'card' } = req.body;
    const b = await Booking.findById(bookingId);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = String(b.user) === String(req.user._id);
    if (!isOwner && req.user.role === 'guest') return res.status(403).json({ message: 'Access denied' });
    if (b.status === 'cancelled') return res.status(400).json({ message: 'Booking is cancelled' });
    if (b.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' });

    const payment = await Payment.create({
      booking: b._id, user: b.user, amount: b.totalAmount, method,
      transactionId: 'TXN' + crypto.randomBytes(5).toString('hex').toUpperCase()
    });
    b.paymentStatus = 'paid'; await b.save();
    res.status(201).json(payment);
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Payment.find({ user: req.user._id }).populate({ path: 'booking', populate: 'room' }).sort('-createdAt')); }
  catch (e) { next(e); }
});

router.get('/', protect, allow('admin', 'staff'), async (req, res, next) => {
  try {
    res.json(await Payment.find().populate('user', 'name email').populate({ path: 'booking', populate: 'room' }).sort('-createdAt'));
  } catch (e) { next(e); }
});

module.exports = router;
