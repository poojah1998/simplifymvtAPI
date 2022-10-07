const mongoose = require('mongoose');
const Schema = mongoose.Schema

var employee = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    emailId: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true

    },

    contact: {
        type: String,
        required: 'Contact is required',

    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});

// Custom validation for email
employee.path('emailId').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('employee', employee);