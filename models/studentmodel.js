const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const studentSchema = new Schema({
    name: String,
    class: Number,
    roll_no: Number,
    // school_id:{  
    //     type:Schema.Types.ObjectId,ref:'school'
    // },
    // place_id:{
    //     type:Schema.Types.ObjectId,ref:'place'
    // },
});
module.exports = mongoose.model('student', studentSchema);//new schema re table ra propertiesdefinr hela..table define heba mongoose re