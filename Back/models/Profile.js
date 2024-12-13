const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
    id: String,
    username: String,
    bio: String,
    avatar: String,
    interests: Array
});

module.exports = model('profile', profileSchema);