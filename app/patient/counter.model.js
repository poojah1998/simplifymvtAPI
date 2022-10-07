const mongoose = require('mongoose');
const Schema = mongoose.Schema



var counter = new mongoose.Schema({
    seq: { type: Number, default: 10001000 },
    user: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('counter', counter, 'counter');