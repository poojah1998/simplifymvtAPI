
const Chat =require('../models/chat-model')



const addChat =async(req,res,next)=>{
    let result =await Chat.create(req.body);
    res.send({msg:"Chat added successfully",ChatData:result})
}
//findbyid
const getChatById= async (req, res) => {
    let result=await Chat.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteChatById= async (req, res) => {
    let result=await Chat.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updateChatById= async (req, res) => {
    let result=await Chat.findByIdAndUpdate(req.params.id);
    res.send(result);
};

//getall chats
const getAllChatData= async (req, res) => {
    let result=await Chat.find();
    res.send(result);
};
module.exports={
    addChat,
    getChatById,
    deleteChatById,
    updateChatById,
    getAllChatData

}