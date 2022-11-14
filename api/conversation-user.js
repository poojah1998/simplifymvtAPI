
const ConversationUser = require('../models/conversation-user-model')

const async = require('async');
// const hospital = require('../models/hospital-model');
const doctor = require('../models/doctor-model');
const refferal = require('../models/refferal-model');
const hospital = require ('../models/hospital-model.js');
const patient = require ('../models/patient-model');
const addConversationUser = async (req, res, next) => {
    let result = await ConversationUser.create(req.body);
    res.send({ msg: "ConversationUser added successfully", ConversationUserData: result })
}
//findbyid
const getConversationUserById = async (req, res) => {
    let result = await ConversationUser.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deleteConversationUserById = async (req, res) => {
    let result = await ConversationUser.findByIdAndDelete(req.params.id);

    res.send(result);
};



////findbyIdAndUpdate
const updateConversationUserById = async (req, res) => {
    let result = await ConversationUser.findByIdAndUpdate(req.params.id);
    res.send(result);
};
//getall ConversationUser
// const getAllConversationUser= async (req, res) => {
//     try {
//         let result=await ConversationUser.find({conversation_id: req.params.id}).populate("user_id");
//         res.send(result);
//     } catch (error) {
//         console.log(error);
//     }

// };
const getAllConversationUser = async (req, res) => {
    try {
        // console.log("coming...........")
        let convUser = await ConversationUser.find({ conversation_id: req.params.id })
        let data = [];
        async.each(convUser, (user, after_user) => {
            // console.log("1111111111");
            // console.log(user.user_type);
            user = JSON.parse(JSON.stringify(user));
            if (user.user_type == 'Doctor') {
                doctor.findById(user.user_id).then((docUser) => {
                    user.user_id = JSON.parse(JSON.stringify(docUser));
                    data.push(user);
                    after_user();
                })

            } else if (user.user_type == 'Referral') {
                refferal.findById(user.user_id).then((reffUser) => {
                    user.user_id = JSON.parse(JSON.stringify(reffUser));
                    data.push(user);
                    after_user();
                })

            }else if (user.user_type == 'Hospital') {
                hospital.findById(user.user_id).then((hosUser) => {
                    user.user_id = JSON.parse(JSON.stringify(hosUser));
                    data.push(user);
                    after_user();
                })

            }else if (user.user_type == 'Patient') {
                patient.findById(user.user_id).then((patientUser) => {
                    user.user_id = JSON.parse(JSON.stringify(patientUser));
                    data.push(user);
                    after_user();
                })

            }
        },(err) =>{
            if(err) {
                res.send(err);
            } else {
                res.send(data);
            }
        })

    } catch (error) {
        res.send(error);
        console.log(error);
    }

};


//insert many  users
const addManyUser = async (req, res, next) => {
    let result = await ConversationUser.insertMany(req.body.data);
    res.send({ msg: "users added successfully", ConversationUserData: result })
}
module.exports = {
    addConversationUser,
    getConversationUserById,
    deleteConversationUserById,
    updateConversationUserById,
    getAllConversationUser,
    addManyUser
}