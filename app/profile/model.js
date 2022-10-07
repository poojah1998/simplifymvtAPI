const mongoose = require('mongoose');
const Schema = mongoose.Schema

var userProfile = new mongoose.Schema({

    designation: {
        type: String,
        required: true

    },
    user: {
        type: String,
        required: true

    },

}, {
    timestamps: true
});



module.exports = mongoose.model('userProfile', userProfile, 'userProfile');