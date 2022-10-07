const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalBankDetail = new mongoose.Schema({

    beneficiaryName: {
        type: String,
        required: true
    },
    accountNo: {
        type: String,
        required: true

    },
    accountType: {
        type: String,
        required: true

    },
    bankName: {
        type: String,
        required: true

    },
    branch: {
        type: String,
        required: true

    },
    address: {
        type: Array,
        required: true

    },
    city: {
        type: String,
        required: true

    },
    state: {
        type: String,
        required: true

    },
    ifscCode: {
        type: String,
        required: true

    },
    branchCode: {
        type: String,
        required: true

    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },

}, {
    timestamps: true
});



module.exports = mongoose.model('hospitalBankDetail', hospitalBankDetail, 'hospitalBankDetail');