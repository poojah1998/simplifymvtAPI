
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
const getAllChatbyConversationId= async (req, res) => {
    let result=await Chat.find({conversation_id: req.params.id});
    res.send(result);
};


var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var aws = require('aws-sdk')
var multerS3 = require('multer-s3')
var mumulterlterS3 = require('multer-s3')
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf') {
        cb(null, 'files')
    } else {
        cb({ error: 'Mime type not supported' })
    }
}

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.BUCKETNAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,

        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: function(req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
        }
    }),
    fileFilter: fileFilter

})

module.exports.upload = (upload.fields([{
        name: 'gstnoimg',
        maxCount: 1
    },
    {
        name: 'registrationimg',
        maxCount: 1
    },
    {
        name: 'logosize1',
        maxCount: 1
    },
    {
        name: 'logosize2',
        maxCount: 1
    },
    {
        name: 'logosize3',
        maxCount: 1
    }
])), (request, response, next) => {
    next();
}





module.exports={
    addChat,
    getChatById,
    deleteChatById,
    updateChatById,
    getAllChatbyConversationId

}