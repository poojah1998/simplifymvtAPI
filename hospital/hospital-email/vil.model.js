const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalEmailVil = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: 'Hospital id is required',

    },
    role: {
        type: Object,
        required: true

    },
    name: {
        type: String,
        required: 'name is required',

    },
    emailId: {
        type: String,
        required: 'Emailid is required',

    },
    contact: {
        type: String,

    },

}, {
    timestamps: true
});
// Custom validation for email
hospitalEmailVil.path('emailId').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('hospitalEmailVil', hospitalEmailVil, 'hospitalEmailVil');