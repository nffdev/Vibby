const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    email: String,
    password: String,
    googleId: String,
    token: String
});

module.exports = model('user', userSchema);