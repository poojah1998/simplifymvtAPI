const mongoose = require('mongoose');
const Schema = mongoose.Schema
var aggregator = new mongoose.Schema({
    aggregator: {
        type: Schema.Types.ObjectId,
    },
    approved: {
        type: Boolean,
        default: false
    },


}, {
    timestamps: true
});

// Events

module.exports = mongoose.model('aggregator', aggregator, 'aggregator');