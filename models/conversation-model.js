const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationSchema = new Schema({
    name: String,
    type:String,
    owner_id: {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    image:String,
}, { timestamps: true });
module.exports = mongoose.model('conversation', conversationSchema);