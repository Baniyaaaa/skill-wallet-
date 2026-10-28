const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  number: { type: String, required: [true, 'Room number is required'], unique: true, trim: true },
  type: { type: String, enum: ['single', 'double', 'deluxe', 'suite'], required: true },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  capacity: { type: Number, default: 2, min: 1 },
  floor: { type: Number, default: 1 },
  amenities: [String],
  description: String,
  status: { type: String, enum: ['available', 'maintenance'], default: 'available' }
}, { timestamps: true });
module.exports = mongoose.model('Room', roomSchema);
