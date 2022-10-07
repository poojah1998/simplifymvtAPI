const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospital = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    accreditations: {
        type: Array,

    },
    city: {
        type: String,
        required: 'City is required',

    },
    country: {
        type: String,
        required: 'country is required',

    },
    beds: {
        type: String,
        required: 'Beds is required',

    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('hospital', hospital, 'hospital');