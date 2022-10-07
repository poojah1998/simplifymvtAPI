const mongoose = require('mongoose');
const Schema = mongoose.Schema

var pdfdataopinion = new mongoose.Schema({
    model: {
        type: String,
        required: 'model is required',

    },
    date: {
        type: String,
        required: 'date is required',

    },
    queryno: {
        type: String,
        required: 'queryno is required',

    },
    doctorcategory: {
        type: String,
        required: 'doctorcategory is required',

    },
    diagnosispara1: {
        type: String,
        required: 'diagnosispara1 is required',

    },
    diagnosispara2: {
        type: String,
        required: 'diagnosispara2 is required',

    },

    evaluations: {
        type: String,
        required: 'treatmentplan is required',

    },
    treatmentplan: {
        type: String,
        required: 'treatmentplan is required',

    },
    hospitaldata: {
        type: Array,
        required: 'hospitaldata is required',

    },
    inclusion: {
        type: Array,
        required: 'inclusions is required',

    },
    exclusion: {
        type: Array,
        required: 'exclusions is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('pdfdataopinion', pdfdataopinion, 'pdfdataopinion');