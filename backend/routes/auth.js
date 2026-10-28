const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const out = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone }); // role always "guest"
    res.status(201).json({ token: sign(user), user: out(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.matches(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: out(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json(out(req.user)));

router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone, address, idProof } = req.body;
    Object.assign(req.user, { name: name ?? req.user.name, phone, address, idProof });
    await req.user.save();
    res.json(out(req.user));
  } catch (e) { next(e); }
});

module.exports = router;
