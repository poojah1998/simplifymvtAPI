
const Conversation =require('../models/conversation-model')
const async = require('async');
const ConversationUser =require('../models/conversation-user-model')

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
    let result=await Conversation.find().sort({createdAt: -1});
    res.send(result);
};



//INDIVISUAL CONVERSATION
const userConversation= async (req, res) => {
    try {
    let convUsers=await ConversationUser.find({user_id:req.params.id});
    let data = [];
    async.each(convUsers,(user,after_user) =>{
        Conversation.findById(user.conversation_id).then(conversation =>{
            data.push(conversation);
            after_user();
        }).catch(error =>{
            after_user();
            res.send(error);
        })
    },(err) =>{
        if(err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    })
    
} catch (error) {
    console.log(error);
}
};



module.exports={
    addConversation,
    getConversationById,
    deleteConversationById,
    updateConversationById,
    getAllConversation,
    userConversation
}