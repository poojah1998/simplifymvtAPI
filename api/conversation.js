
const Conversation =require('../models/conversation-model')



const addConversation =async(req,res,next)=>{
    let result =await Conversation.create(req.body);
    res.send({msg:"Conversation added successfully",ConversationData:result})
}
//findbyid
const getConversationById= async (req, res) => {
    let result=await Conversation.findById(req.query);
    res.send(result);
};

////findbyiddelete
const deleteConversationById= async (req, res) => {
    let result=await Conversation.findByIdAndDelete(req.query);
    res.send(result);
};



////findbyIdAndUpdate
const updateConversationById= async (req, res) => {
    let result=await Conversation.findByIdAndUpdate(req.query);
    res.send(result);
};


module.exports={
    addConversation,
    getConversationById,
    deleteConversationById,
    updateConversationById

}