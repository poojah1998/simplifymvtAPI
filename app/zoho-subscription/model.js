const mongoose = require('mongoose');
const Schema = mongoose.Schema

var zoho = new mongoose.Schema({

    data: {
        type: Object,
        required: 'data is required',
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('zoho', zoho, 'zoho');