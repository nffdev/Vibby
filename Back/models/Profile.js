const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
    id: String,
    username: String,
    name: String,
    bio: String,
    avatar: String,
    interests: Array,
    following: { type: Number, default: 0},
    followers: { type: Number, default: 0},
    likes: { type: Number, default: 0}
});

module.exports = model('profile', profileSchema);