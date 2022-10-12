
const ConversationUser =require('../models/conversation-user-model')



const addConversationUser =async(req,res,next)=>{
    let result =await ConversationUser.create(req.body);
    res.send({msg:"ConversationUser added successfully",ConversationUserData:result})
}
//findbyid
const getConversationUserById= async (req, res) => {
    let result=await ConversationUser.findById(req.query);
    res.send(result);
};

////findbyiddelete
const deleteConversationUserById= async (req, res) => {
    let result=await ConversationUser.findByIdAndDelete(req.query);
    res.send(result);
};



////findbyIdAndUpdate
const updateConversationUserById= async (req, res) => {
    let result=await ConversationUser.findByIdAndUpdate(req.query);
    res.send(result);
};


module.exports={
    addConversationUser,
    getConversationUserById,
    deleteConversationUserById,
    updateConversationUserById

}