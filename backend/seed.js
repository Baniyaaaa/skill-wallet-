require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: { $in: ['admin@hotelpro.com', 'staff@hotelpro.com'] } });
  await User.create([
    { name: 'Hotel Admin', email: 'admin@hotelpro.com', password: 'admin123', role: 'admin' },
    { name: 'Front Desk', email: 'staff@hotelpro.com', password: 'staff123', role: 'staff' }
  ]);
  if (!(await Room.countDocuments())) {
    const types = [
      ['single', 1499, 1, ['WiFi', 'AC', 'TV']],
      ['double', 2499, 2, ['WiFi', 'AC', 'TV', 'Mini bar']],
      ['deluxe', 3999, 3, ['WiFi', 'AC', 'TV', 'Mini bar', 'Balcony']],
      ['suite', 6999, 4, ['WiFi', 'AC', 'TV', 'Mini bar', 'Balcony', 'Bathtub', 'Lounge']]
    ];
    const rooms = [];
    types.forEach(([type, price, capacity, amenities], i) => {
      for (let n = 1; n <= 3; n++) rooms.push({
        number: `${i + 1}0${n}`, type, price, capacity, floor: i + 1, amenities,
        description: `Comfortable ${type} room on floor ${i + 1}.`
      });
    });
    await Room.insertMany(rooms);
  }
  console.log('Seeded: admin@hotelpro.com / admin123, staff@hotelpro.com / staff123');
  process.exit(0);
})();
