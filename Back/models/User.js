const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    email: String,
    password: String,
    googleId: String,
    role: { type: String, default: 'user' },
    tokenVersion: { type: Number, default: 0 }
});

module.exports = model('user', userSchema);