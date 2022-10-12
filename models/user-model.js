const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    email: String,
    phone_no:Number,
   user_type:String,

    // school_id:{  
    //     type:Schema.Types.ObjectId,ref:'school'
    // },
    // place_id:{
    //     type:Schema.Types.ObjectId,ref:'place'
    // },
});
module.exports = mongoose.model('user', userSchema);