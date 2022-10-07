const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalPlan = new mongoose.Schema({
    name: {
        type: String,

    },
    price: {
        type: String,
        required: 'price is required',

    },
    planType: {
        type: String,
        required: 'plantype is required',

    },
    queries: {
        type: String,
        required: 'queries is required',

    },
    users: {
        type: String,
        required: 'users is required',

    },
    refferalPartner: {
        type: String,
        required: 'refferalpartner is required',

    },




}, {
    timestamps: true
});
module.exports = mongoose.model('hospitalPlan', hospitalPlan);