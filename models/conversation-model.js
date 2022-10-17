const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationSchema = new Schema({
    name: String,
    type:String,
    owner_id: {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    image:String,
    createdAt:{type:Date, default: Date.now},
    updatedAt:{type:Date,default: Date.now},
});
module.exports = mongoose.model('conversation', conversationSchema);