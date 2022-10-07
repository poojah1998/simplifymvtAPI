const mongoose = require('mongoose');
const Schema = mongoose.Schema

var mydefualt = new mongoose.Schema({

    hospitalid: {
        type: String,
        required: 'Hospital id is required',

    },

    executivesto: [{
        type: Schema.Types.ObjectId,
        ref: "myemployee"

    }],
    executivescc: [{
        type: Schema.Types.ObjectId,
        ref: "myemployee"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('mydefualt', mydefualt, 'mydefualt');