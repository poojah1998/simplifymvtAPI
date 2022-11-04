
const ConversationUser =require('../models/conversation-user-model')



const addConversationUser =async(req,res,next)=>{
    let result =await ConversationUser.create(req.body);
    res.send({msg:"ConversationUser added successfully",ConversationUserData:result})
}
//findbyid
const getConversationUserById= async (req, res) => {
    let result=await ConversationUser.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteConversationUserById= async (req, res) => {
    let result=await ConversationUser.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updateConversationUserById= async (req, res) => {
    let result=await ConversationUser.findByIdAndUpdate(req.params.id);
    res.send(result);
};
//getall ConversationUser
const getAllConversationUser= async (req, res) => {
    try {
        let result=await ConversationUser.find({conversation_id: req.params.id}).populate("user_id");
        res.send(result);
    } catch (error) {
        console.log(error);
    }
   
};

module.exports={
    addConversationUser,
    getConversationUserById,
    deleteConversationUserById,
    updateConversationUserById,
    getAllConversationUser
}