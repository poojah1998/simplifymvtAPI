
const Chat = require('../models/chat-model')



const addChat = async (req, res, next) => {
    let result = await Chat.create(req.body);
    res.send({ msg: "Chat added successfully", ChatData: result })
}
//findbyid
const getChatById = async (req, res) => {
    let result = await Chat.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteChatById = async (req, res) => {
    let result = await Chat.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updateChatById = async (req, res) => {
    let result = await Chat.findByIdAndUpdate(req.params.id);
    res.send(result);
};

//getall chats
const getAllChatbyConversationId = async (req, res) => {
    let result = await Chat.find({ conversation_id: req.params.id });
    res.send(result);
};
//get all chat by images
const getAllChatImage = async (req, res) => {
    let result = await Chat.find({ conversation_id: req.params.id ,"image": { $ne: '' }});
    res.send(result);
};

//get all chat by file
const getAllChatFile = async (req, res) => {
    let result = await Chat.find({ conversation_id: req.params.id ,"files": { $ne: '' }});
    res.send(result);
};

var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
require('dotenv').config();
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
    } 
    else if (file.mimetype.includes('audio/') ){
        cb(null, 'files')
    }
    else {
        cb({ error: 'Mime type not supported' })
    }
}

const uploadMulter = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.BUCKETNAME,

        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: function (req, file, cb) {
            cb(null, new Date().getTime() + file.originalname)
        }
    }),
    fileFilter: fileFilter

})

// const upload = uploadMulter.fields([{
//     name: 'gstnoimg',
//     maxCount: 1
// },
// {
//     name: 'registrationimg',
//     maxCount: 1
// },
// {
//     name: 'logosize1',
//     maxCount: 1
// },
// {
//     name: 'logosize2',
//     maxCount: 1
// },
// {
//     name: 'logosize3',
//     maxCount: 1
// }
// ]) (request, response, next) => {
//     response.send(request.file)
// }


router.post('/media', uploadMulter.single('file'), (req, res) => {
    console.log(req.file)
    if (req.file) {
        res.send(req.file)
    }
});





module.exports = {
    addChat,
    getChatById,
    deleteChatById,
    updateChatById,
    router,
    getAllChatbyConversationId,
    getAllChatImage,
    getAllChatFile
}