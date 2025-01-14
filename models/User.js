const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // El correo electrónico será único
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user', // El rol por defecto será 'user'
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
