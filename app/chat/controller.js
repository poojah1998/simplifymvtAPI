const Conversation = require('./conversation.model');
const mongoose = require('mongoose');
const Userrole = require('../facilitator-register/userrole.model');
const Facilitator = require('../facilitator-register/facilitator.model')
const Hospital = require('../../hospital/hospital-auth/auth.model')
const Message = require("./message.model");


exports.postConversation = async(req, res, next) => {
    console.log(req.body)
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedConversation = await newConversation.save();
        res.status(200).send(savedConversation);
    } catch (err) {
        next(err);
    }
}

exports.getConversationById = async(req, res, next) => {
    pipeline = [{
        $match: {
            members: { $in: [req.params.userId] },

        }

    }]

    try {
        const conversation = await Conversation.aggregate(pipeline)

        res.status(200).json(conversation);
    } catch (err) {
        next(err);
    }
}
exports.getAllConversation = async(req, res, next) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation)
    } catch (err) {
        next(err);
    }
}

exports.getMembers = async(req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await Facilitator.findById(userId).populate('userroles', 'name Role')
        const userPartner = await Facilitator.findById(userId).populate('refferals', 'name Role')
        const facilitator = await Facilitator.findById(userId, { name: 1, Role: 1 })

        const hospital = await Hospital.find({}, { "name.name": 1, Role: 1 })
        hospital.map((obj) => {
            obj['name'] = obj['name'].name
            return obj
        })
        res.send(user.userroles.concat(facilitator, userPartner.refferals, hospital))
    } catch (err) {
        next(err);
    }
}

exports.getConversationMembers = async(req, res, next) => {
    try {
        members = req.body
        const { userId } = req.params;
        console.log(members)
        const user = await Facilitator.findById(userId).populate('userroles', 'name Role')
        const userPartner = await Facilitator.findById(userId).populate('refferals', 'name Role')
        const facilitator = await Facilitator.findById(userId, { name: 1, Role: 1 })

        const hospital = await Hospital.find({}, { "name.name": 1, Role: 1 })
        hospital.map((obj) => {
            obj['name'] = obj['name'].name
            return obj
        })
        filterMembers = []
        data = user.userroles.concat(facilitator, userPartner.refferals, hospital)
        data.forEach(element => {
            members.forEach(element1 => {
                if (element1._id == element._id) {
                    filterMembers.push({ member: element, conversationId: element1.conversationId })
                }
            });
        });
        console.log(filterMembers)
        res.send(filterMembers)
    } catch (err) {
        next(err);
    }
}
exports.postMessage = async(req, res, next) => {
    console.log(req.body)
    const newMessage = new Message(req.body);

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        next(err)
    }
}
exports.getMessageById = async(req, res, next) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationid,
        });
        res.status(200).send(messages);
    } catch (err) {
        next(err)

    }
}