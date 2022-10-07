const mongoose = require('mongoose');
const Schema = mongoose.Schema

var myemployee = new mongoose.Schema({

    hospitalid: {
        type: String,
        required: 'Hospital id is required',

    },
    name: {
        type: String,
        required: 'name is required',

    },
    emailid: {
        type: String,
        required: 'Emailid is required',

    },
    contact: {
        type: Array,

    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
// Custom validation for email
myemployee.path('emailid').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('myemployee', myemployee, 'myemployee');