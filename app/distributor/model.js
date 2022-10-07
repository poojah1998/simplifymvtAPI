const mongoose = require('mongoose');
const Schema = mongoose.Schema

var distributor = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true

    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
    mobile: {
        type: String,
        required: 'Contact is required',

    },
    Role: {
        type: String,
        default: 'Distributor'
    },
    country: {
        type: String,
        required: 'country is required',

    },

}, {
    timestamps: true
});

// Custom validation for email
distributor.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('distributor', distributor);