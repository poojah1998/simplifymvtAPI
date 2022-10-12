
const studentModel = require('../models/studentmodel');

//create a record
const Addstudent = async (obj) => {
    return await studentModel.create(obj);
}


//It will find the table data
let findAll = async () => {
    return await studentModel.find();
};


//It will remove the table data according to condition
let removeByCond = async (cond) => {
    return await studentModel.remove(cond);
};


//this method will find one model and perform join operation
let findAllAndPopulate = async (ref) => {
    return await studentModel.find().populate('school_id');
};


//findOne method shows individual record
let findone = async (cond) => {
    return await studentModel.findOne(cond);
};


//deleteone method delete one record according to condtion
let deleteone = async (cond) => {
    return await studentModel.deleteOne(cond);
};


//deletemany method delete one record according to condtion
let deletemany = async (cond) => {
    return await studentModel.deleteMany(cond);
};


//findById method will find one record by an iD
let findbyid = async (id) => {
    return await studentModel.findById(id);
};


//updateOne method will update one object according to condition
let upone = async (cond,obj) => {
    return await studentModel.updateOne(cond,obj);
};


//replaceOne method will replace an individual record
let replaceone = async (cond,obj) => {
    return await studentModel.replaceOne(cond,obj);
};


//insertMany method will insert records with in an array
let insertmany = async (arr) => {
    return await studentModel.insertMany(arr);
};


//insertMany method will insert records with in an array
// let bulkSave = async (arr) => {
//     return await studentModel.bulkSave(arr);
// };


//updateMany will update many records 
let updatemany = async (cond,obj) => {
    return await studentModel.updateMany(cond,obj);
};



//findOneAndUpdate will find one record and update
let  findoneAndupdate= async (cond,obj) => {
    return await studentModel.findOneAndUpdate(cond,obj);
};



//findOneAndReplace() method will find one record and replace
let  findoneAndreplace= async (cond,obj) => {
    return await studentModel.findOneAndReplace(cond,obj);
};


//findOneAndRemove() method will find one record and remove
let findoneAndremove= async (cond) => {
    return await studentModel.findOneAndRemove(cond);
};


//findOneAndDelete() method will find one record and delete
let findoneAnddelete= async (cond) => {
    return await studentModel.findOneAndDelete(cond);
};


//findByIdAndUpdate method will find one record by ID and update
let  findbyIdAndUpdate= async (id,obj) => {
    return await studentModel.findByIdAndUpdate(id,obj);
};


//findbyidAndremove() method will find one record BY iD and remove
let findbyidAndremove= async (id) => {
    return await studentModel.findByIdAndRemove(id);
};


//findbyidAndremove() method will find one record by ID  and delete
let findbyidAnddelete= async (id) => {
    return await studentModel.findByIdAndDelete(id);
};
module.exports = {
  
    Addstudent,
    findAll,
    findone,
    findbyid,
    insertmany,
    updatemany,
    upone,
    deleteone,
    replaceone,
    findoneAndupdate,
    findoneAndreplace,
    findoneAndremove,
    findoneAnddelete,
    findbyidAnddelete,
    findbyidAndremove,
    findbyIdAndUpdate,
    findAllAndPopulate,
    // bulkSave,
    deletemany,
    removeByCond
}