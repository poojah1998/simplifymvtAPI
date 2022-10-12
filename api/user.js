
const user =require('../models/user-model')



const addUser =async(req,res,next)=>{
    let result =await user.creat(req.body);
    res.send({msg:"user added successfully",userData:result})
}



module.exports={
    addUser
}