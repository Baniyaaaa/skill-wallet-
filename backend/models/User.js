const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'] },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  idProof: { type: String, trim: true },
  role: { type: String, enum: ['guest', 'staff', 'admin'], default: 'guest' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matches = function (pw) { return bcrypt.compare(pw, this.password); };

module.exports = mongoose.model('User', userSchema);
