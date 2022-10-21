const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const hashtagSchema = new Schema({
    name: String,
    scope: String
});
module.exports = mongoose.model('hashtag', hashtagSchema);