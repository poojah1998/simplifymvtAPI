const mongoose = require('mongoose');
const Schema = mongoose.Schema

var branchcompanydetail = new mongoose.Schema({

    branchname: {
        type: String,
        required: 'Branch Name is required',

    },

    branchcompanyemail: {
        type: String,
        required: 'Branch Company Email Id is required',
    },


    branchaddress: {
        type: Array,
        required: 'Branch Address is required',

    },
    branchcontact: {
        type: String,
        required: 'Branch Contact is required',
    },
    branchid: {
        type: Schema.Types.ObjectId,
        ref: "userrole"
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
branchcompanydetail.path('branchcompanyemail').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('branchcompanydetail', branchcompanydetail, 'branchcompanydetail');