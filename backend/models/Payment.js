const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card', 'upi', 'cash'], default: 'card' },
  status: { type: String, enum: ['success', 'failed', 'refunded'], default: 'success' },
  transactionId: String
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);
