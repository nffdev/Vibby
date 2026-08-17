const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    email: String,
    password: String,
    googleId: String,
    role: { type: String, default: 'user' },
    banned: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }
});

module.exports = model('user', userSchema);