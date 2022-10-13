
const Conversation =require('../models/conversation-model')



const addConversation =async(req,res,next)=>{
    let result =await Conversation.create(req.body);
    res.send({msg:"Conversation added successfully",ConversationData:result})
}
//findbyid
const getConversationById= async (req, res) => {
    let result=await Conversation.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteConversationById= async (req, res) => {
    let result=await Conversation.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updateConversationById= async (req, res) => {
    let result=await Conversation.findByIdAndUpdate(req.params.id);
    res.send(result);
};
//getall Conversation
const getAllConversation= async (req, res) => {
    let result=await Conversation.find();
    res.send(result);
};


module.exports={
    addConversation,
    getConversationById,
    deleteConversationById,
    updateConversationById,
    getAllConversation
}