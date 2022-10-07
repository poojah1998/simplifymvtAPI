const mongoose = require('mongoose');
const Schema = mongoose.Schema

var emailcc = new mongoose.Schema({

    email: {
        type: Array,

        required: 'email can\'t be empty',
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('emailcc', emailcc, 'emailcc');