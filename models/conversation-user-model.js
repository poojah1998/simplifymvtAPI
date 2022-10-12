const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationUserSchema = new Schema({
    conversation_id :String,
    user_id:String,
    isAdmin: Boolean,
    isReferal:Boolean
   
});
module.exports = mongoose.model('conversationUser', conversationUserSchema);