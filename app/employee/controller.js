const Employee = require('./model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');


exports.postEmployee = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const employee = new Employee();
        employee.name = req.body.name;
        employee.emailId = req.body.emailId;
        employee.contact = req.body.contact;

        const user = await Facilitator.findById(userid)

        employee.user = user._id
        await employee.save()

        user.employees.push(employee)
        await user.save()

        res.send({ message: "Success" })
    } catch (err) {
        next(err);
    }
}

exports.getEmployee = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('employees')

        res.send(user.employees)
    } catch (err) {
        next(err);
    }


}

exports.delEmployee = async(req, res, next) => {
    try {
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        employee = await Employee.findByIdAndRemove(req.params.id);
        res.send(employee);

        await Facilitator.update({ _id: userid }, { $pull: { employees: req.params.id } });
    } catch (err) {
        next(err);
    }

}



exports.putEmployee = async(req, res, next) => {
    try {

        const { userid } = req.params
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        var employee = {
            name: req.body.name,
            emailId: req.body.emailId,
            contact: req.body.contact

        };
        const user = await Facilitator.findById(userid)
        Employee.findByIdAndUpdate(req.params.id, { $set: employee }, { new: true }, (err, doc) => {
            if (!err) {

                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });
    } catch (err) {
        next(err)
    }
}