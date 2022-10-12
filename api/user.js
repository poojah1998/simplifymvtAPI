
const User =require('../models/user-model')



const addUser =async(req,res,next)=>{
    let result =await User.create(req.body);
    res.send({msg:"user added successfully",userData:result})
}
//findbyid
const getUserById= async (req, res) => {
    let result=await User.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteUserById= async (req, res) => {
    let result=await User.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updateUserById= async (req, res) => {
    let result=await User.findByIdAndUpdate(req.params.id);
    res.send(result);
};
//getall users
const getAllUserData= async (req, res) => {
    let result=await User.find();
    res.send(result);
};





module.exports={
    addUser,
    getUserById,
    deleteUserById,
    updateUserById,
    getAllUserData

}