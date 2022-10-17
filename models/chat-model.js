const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chartSchema = new Schema({
    conversation_id: {
        type: Schema.Types.ObjectId, ref: 'conversation'
    },
    sender_id: {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    tag_id: {
        type: Schema.Types.ObjectId, ref: 'hashtag'
    },
    hashtag_id: {
        type: Schema.Types.ObjectId, ref: 'hashtag'
    },
    message:String,
    files:String,
    image:String,
}, { timestamps: true });
module.exports = mongoose.model('chat', chartSchema);