const HospitalZone = require('./zone.model')
const HospitalEmployee = require('./employee.model')
const HospitalVil = require('./vil.model')
const HospitalConf = require('./confirmation.model')

const HospitalDoctor = require('./doctor.model')
const HospitalDefualt = require('./default.model')
const HospitalDefualtVil = require('./default-vil.model')
const HospitalDefaultConf = require('./default-conf.model')
const Group = require('../hospital-groups/group.model')
const HospitalCms = require('../../app/patient/cms.hospital.model')
const emp = require('../../app/prehospitalzone/preemployees.model')
const PreZone = require('../../app/prehospitalzone/prehospitalzone.model')
const doc = require('../../app/prehospitalzone/predoctor.model')
const def = require('../../app/prehospitalzone/defualt.model')

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

exports.postHospitalZones = async(req, res, next) => {
    try {
        const hospitalzone = new HospitalZone();
        hospitalzone.hospitalId = req.body.hospitalId;
        hospitalzone.partner = req.body.partner;

        hospitalzone.role = req.body.role;
        hospitalzone.zone = req.body.zone;
        hospitalzone.treatments = req.body.treatments;
        hospitalzone.countries = req.body.countries;
        hospitalzone.executivesTo = req.body.executivesTo;
        hospitalzone.executivesCc = req.body.executivesCc;
        hospitalzone.vilTo = req.body.vilTo;
        hospitalzone.vilCc = req.body.vilCc;
        hospitalzone.confirmationTo = req.body.confirmationTo;
        hospitalzone.confirmationCc = req.body.confirmationCc;
        hospitalzone.doctorsTo = req.body.doctorsTo;
        hospitalzone.doctorsCc = req.body.doctorsCc;
        await hospitalzone.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.delHospitalZone = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        data = await HospitalZone.findByIdAndRemove(req.params.id);
        res.send(data);

    } catch (err) {
        next(err);
    }

}

exports.putHospitalZone = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var dataUpdate = {
        zone: req.body.zone,
        treatments: req.body.treatments,
        countries: req.body.countries,
        executivesTo: req.body.executivesTo,
        executivesCc: req.body.executivesCc,
        vilTo: req.body.vilTo,
        vilCc: req.body.vilCc,
        confirmationTo: req.body.confirmationTo,
        confirmationCc: req.body.confirmationCc,
        doctorsTo: req.body.doctorsTo,
        doctorsCc: req.body.doctorsCc,

    };
    HospitalZone.findByIdAndUpdate(req.params.id, { $set: dataUpdate }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getHospitalEmailByHospitalId = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id };
    HospitalZone.find(zoneQuery).populate('executivesTo executivesCc vilTo vilCc confirmationTo confirmationCc doctorsTo doctorsCc')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}

exports.getHospitalEmailBySearch = (req, res) => {
    var id = req.params.hospitalid;
    var country = req.params.country;
    var treatment = req.params.treatment;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id, "countries": country, "treatments": treatment };
    HospitalZone.find(zoneQuery).populate('executivesTo executivesCc doctorsTo doctorsCc vilTo vilCc confirmationTo confirmationCc')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getHospitalEmailBySearchFac = (req, res) => {
    var id = req.params.hospitalid;
    var country = req.params.country;
    var treatment = req.params.treatment;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id, "countries": country, "treatments": treatment };
    HospitalZone.find(zoneQuery).populate('executivesTo executivesCc doctorsTo doctorsCc vilTo vilCc confirmationTo confirmationCc')
        .then(data => {

            if (data.length) {

                dataSend = [{
                    executivesTo: [],
                    executivesCc: [],
                    vilTo: [],
                    vilCc: [],
                    confirmationTo: [],
                    confirmationCc: []


                }]
                data.forEach(element => {
                    element.executivesTo.forEach(element1 => {
                        dataSend[0].executivesTo.push(element1)
                    });
                    element.executivesCc.forEach(element2 => {
                        dataSend[0].executivesCc.push(element2)
                    });
                    element.vilTo.forEach(element3 => {
                        dataSend[0].vilTo.push(element3)
                    });
                    element.vilCc.forEach(element4 => {
                        dataSend[0].vilCc.push(element4)
                    });
                    element.vilTo.forEach(element5 => {
                        dataSend[0].confirmationTo.push(element5)
                    });
                    element.vilCc.forEach(element6 => {
                        dataSend[0].confirmationTo.push(element6)
                    });
                });
                res.send(dataSend)

            } else {
                const data = []
                res.send(data)

            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getHospitalZoneIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalZone.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('executivesTo executivesCc doctorsTo doctorsCc vilTo vilCc confirmationTo confirmationCc')

}

// Hospital Employee
exports.postEmployee = async(req, res, next) => {

    try {
        const hospitalemployee = new HospitalEmployee();
        hospitalemployee.hospitalId = req.body.hospitalId;
        hospitalemployee.partner = req.body.partner;

        hospitalemployee.role = req.body.role;
        hospitalemployee.name = req.body.name;
        hospitalemployee.emailId = req.body.emailId;
        hospitalemployee.contact = req.body.contact;

        await hospitalemployee.save()


        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}


exports.getEmployeeIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalEmployee.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}

exports.delEmployee = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        data = await HospitalEmployee.findByIdAndRemove(req.params.id);
        res.send(data);

    } catch (err) {
        next(err);
    }

}

exports.putEmployee = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        name: req.body.name,
        emailId: req.body.emailId,
        contact: req.body.contact,
        hospitalId: req.body.hospitalId
    };
    HospitalEmployee.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getEmployeeByHospitalId = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": { $in: id } };
    HospitalEmployee.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getAllEmployeeByHospitalId = async(req, res, next) => {
        try {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            var doc
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            data = await HospitalEmployee.find({
                "hospitalId": {
                    $in: doc[0].hospitalid
                },
                partner: "NIL"
            }).populate({ path: 'hospitalId', model: HospitalCms, select: 'name' })
            res.send(data)

        } catch (err) {
            next(err)
        }

    }
    // Hospital Doctor
exports.postDoctor = async(req, res, next) => {
    try {

        const hospitaldoctor = new HospitalDoctor();
        hospitaldoctor.hospitalId = req.body.hospitalId;
        hospitaldoctor.partner = req.body.partner;

        hospitaldoctor.role = req.body.role;
        hospitaldoctor.name = req.body.name;
        hospitaldoctor.emailId = req.body.emailId;

        await hospitaldoctor.save()


        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}


exports.delDoctor = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        data = await HospitalDoctor.findByIdAndRemove(req.params.id);
        res.send(data);

    } catch (err) {
        next(err);
    }

}

exports.putDoctor = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        name: req.body.name,
        emailid: req.body.emailid,

    };
    HospitalDoctor.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getDoctorByHospitalId = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id };
    HospitalDoctor.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDoctorIdDetail = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        HospitalDoctor.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        })

    }
    // Predefualt
exports.postDefualt = async(req, res, next) => {
    try {
        console.log(req.body)
        const hospitaldefualt = new HospitalDefualt();
        hospitaldefualt.hospitalId = req.body.hospitalId;
        hospitaldefualt.partner = req.body.partner;

        hospitaldefualt.role = req.body.role;
        hospitaldefualt.executivesTo = req.body.executivesTo;
        hospitaldefualt.executivesCc = req.body.executivesCc;
        await hospitaldefualt.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}


exports.putDefault = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        executivesTo: req.body.executivesTo,
        executivesCc: req.body.executivesCc,

    };
    HospitalDefualt.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getDefualtByHospitalId = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { 'partner': 'NIL', "hospitalId": id };

    HospitalDefualt.find(zoneQuery).populate({
            path: 'executivesTo executivesCc',
        })
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtByHospitalIdFac = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { 'partner': req.params.partnerid, "hospitalId": id };

    HospitalDefualt.find(zoneQuery).populate({
            path: 'executivesTo executivesCc',
        })
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtByHospitalIdCombine = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id };

    HospitalDefualt.find(zoneQuery).populate({
            path: 'executivesTo executivesCc',
        })
        .then(data => {
            dataSend = [{
                executivesTo: [],
                executivesCc: []

            }]
            if (data) {
                data.forEach(element => {
                    element.executivesTo.forEach(element1 => {
                        dataSend[0].executivesTo.push(element1)
                    });
                    element.executivesCc.forEach(element2 => {
                        dataSend[0].executivesCc.push(element2)
                    });
                });
                res.send(dataSend)
            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalDefualt.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('executivesTo executivesCc')

}


exports.postVil = async(req, res, next) => {

    try {
        const hospitalvil = new HospitalVil();
        hospitalvil.hospitalId = req.body.hospitalId;
        hospitalvil.partner = req.body.partner;

        hospitalvil.role = req.body.role;
        hospitalvil.name = req.body.name;
        hospitalvil.emailId = req.body.emailId;
        hospitalvil.contact = req.body.contact;

        await hospitalvil.save()


        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}


exports.getVilIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalVil.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}

exports.delVil = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        data = await HospitalVil.findByIdAndRemove(req.params.id);
        res.send(data);

    } catch (err) {
        next(err);
    }

}

exports.putVil = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        name: req.body.name,
        emailId: req.body.emailId,
        contact: req.body.contact,

    };
    HospitalVil.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getVilByHospitalId = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { "hospitalId": id };
    HospitalVil.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}


exports.postConf = async(req, res, next) => {

    try {
        const hospitalconf = new HospitalConf();
        hospitalconf.hospitalId = req.body.hospitalId;
        hospitalconf.partner = req.body.partner;

        hospitalconf.role = req.body.role;
        hospitalconf.name = req.body.name;
        hospitalconf.emailId = req.body.emailId;
        hospitalconf.contact = req.body.contact;

        await hospitalconf.save()


        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}


exports.getConfIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalConf.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}

exports.delConf = async(req, res, next) => {
    try {

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        data = await HospitalConf.findByIdAndRemove(req.params.id);
        res.send(data);

    } catch (err) {
        next(err);
    }

}

exports.putConf = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        name: req.body.name,
        emailId: req.body.emailId,
        contact: req.body.contact,

    };
    HospitalConf.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getConfByHospitalId = (req, res) => {
    var id = req.params.hospitalid;
    HospitalZone.find(zoneQuery).populate('executivesTo executivesCc vilTo vilCc confirmationTo confirmationCc doctorsTo doctorsCc')

    HospitalConf.find(zoneQuery)
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}

// PreVildefualt
exports.postDefualtVil = async(req, res, next) => {
    try {
        console.log(req.body)
        const hospitaldefualtvil = new HospitalDefualtVil();
        hospitaldefualtvil.hospitalId = req.body.hospitalId;
        hospitaldefualtvil.partner = req.body.partner;

        hospitaldefualtvil.role = req.body.role;
        hospitaldefualtvil.vilTo = req.body.vilTo;
        hospitaldefualtvil.vilCc = req.body.vilCc;
        await hospitaldefualtvil.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}


exports.putDefaultVil = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        vilTo: req.body.vilTo,
        vilCc: req.body.vilCc,
    };
    HospitalDefualtVil.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getDefualtVilByHospitalId = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { 'partner': 'NIL', "hospitalId": id };

    HospitalDefualtVil.find(zoneQuery).populate({
            path: 'vilTo vilCc',
        })
        .then(data => {

            if (data) {
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtVilByHospitalIdFac = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { 'partner': req.params.partnerid, "hospitalId": id };

    HospitalDefualtVil.find(zoneQuery).populate({
            path: 'vilTo vilCc',
        })
        .then(data => {

            if (data) {
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtVilByHospitalIdCombine = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id };

    HospitalDefualtVil.find(zoneQuery).populate({
            path: 'vilTo vilCc',
        })
        .then(data => {

            if (data) {
                dataSend = [{
                    vilTo: [],
                    vilCc: []

                }]
                if (data) {
                    data.forEach(element => {
                        element.vilTo.forEach(element1 => {
                            dataSend[0].vilTo.push(element1)
                        });
                        element.vilCc.forEach(element2 => {
                            dataSend[0].vilCc.push(element2)
                        });
                    });
                    res.send(dataSend)
                }
            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtVilIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    HospitalDefualtVil.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('vilTo vilCc')

}

// PreConfdefualt
exports.postDefualtConf = async(req, res, next) => {
    try {
        console.log(req.body)
        const hospitaldefaultconf = new HospitalDefaultConf();
        hospitaldefaultconf.hospitalId = req.body.hospitalId;
        hospitaldefaultconf.partner = req.body.partner;

        hospitaldefaultconf.role = req.body.role;
        hospitaldefaultconf.confirmationTo = req.body.confirmationTo;
        hospitaldefaultconf.confirmationCc = req.body.confirmationCc;
        await hospitaldefaultconf.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}


exports.putDefaultConf = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        confirmationTo: req.body.confirmationTo,
        confirmationCc: req.body.confirmationCc,
    };
    HospitalDefaultConf.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getDefualtConfByHospitalId = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { 'partner': 'NIL', "hospitalId": id };
    HospitalDefaultConf.find(zoneQuery).populate({
            path: 'confirmationTo confirmationCc',
        })
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtConfByHospitalIdFac = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { 'partner': req.params.partnerid, "hospitalId": id };
    HospitalDefaultConf.find(zoneQuery).populate({
            path: 'confirmationTo confirmationCc',
        })
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtConfByHospitalIdCombine = (req, res) => {
    var id = req.params.hospitalid;

    zoneQuery = { $or: [{ 'partner': req.params.partnerid }, { 'partner': 'NIL' }], "hospitalId": id };
    HospitalDefaultConf.find(zoneQuery).populate({
            path: 'confirmationTo confirmationCc',
        })
        .then(data => {

            dataSend = [{
                confirmationTo: [],
                confirmationCc: []

            }]
            if (data) {
                data.forEach(element => {
                    element.confirmationTo.forEach(element1 => {
                        dataSend[0].confirmationTo.push(element1)
                    });
                    element.confirmationCc.forEach(element2 => {
                        dataSend[0].confirmationCc.push(element2)
                    });
                });
                res.send(dataSend)

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getDefualtConfIdDetail = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        HospitalDefaultConf.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        }).populate('confirmationTo confirmationCc')

    }
    // exports.postPreImport = async(req, res, next) => {
    //     try {
    //         pipiline = [{
    //                 $group: {
    //                     _id: ObjectId('607ead68ef38bd1ea6b40298'),
    //                     data: {
    //                         $push: {
    //                             hospitalId: "$hospitalid",
    //                             zone: "$zone",
    //                             treatments: "$treatments",
    //                             countries: "$countries",
    //                             executivesTo: "$executivesto",
    //                             executivesCc: "$executivescc",
    //                             vilTo: "$vilto",
    //                             vilCc: "$vilcc",
    //                             confirmationTo: "$confirmationto",
    //                             confirmationCc: "$confirmationcc",
    //                             doctorsTo: "$doctorsto",
    //                             doctorsCc: "$doctorscc",
    //                             partner: "NIL",
    //                         }
    //                     }
    //                 },

//             }, {
//                 $lookup: {
//                     from: 'adminSchema',
//                     "let": { "id": ObjectId('607ead68ef38bd1ea6b40298') },

//                     "pipeline": [
//                         { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

//                         {

//                             "$project": {
//                                 name: 1,
//                                 id: "$_id",
//                                 email: 1,
//                                 mobile: 1,
//                                 Role: 1,
//                                 _id: 0
//                             }
//                         }
//                     ],

//                     as: 'role',

//                 }
//             },

//         ]

//         data = await PreZone.aggregate(pipiline)
//         zoneData = data[0].data.filter((v, i, a) => a.findIndex(t => (t.hospitalId === v.hospitalId && t.zone === v.zone)) === i)
//         data[0].data = zoneData
//         data.forEach(async element => {
//             element.data.forEach(async element1 => {
//                 hospitalzone = new HospitalZone();
//                 hospitalzone.hospitalId = element1.hospitalId;
//                 hospitalzone.partner = element1.partner;
//                 hospitalzone.role = {
//                     name: 'Super Hospital',
//                     Role: 'Hospital Group Admin'
//                 };
//                 hospitalzone.zone = element1.zone;
//                 hospitalzone.treatments = element1.treatments;
//                 hospitalzone.countries = element1.countries;
//                 hospitalzone.executivesTo = element1.executivesTo;
//                 hospitalzone.executivesCc = element1.executivesCc;
//                 hospitalzone.doctorsTo = element1.doctorsTo;
//                 hospitalzone.doctorsCc = element1.doctorsCc;
//                 await hospitalzone.save()
//             })
//         });
//         res.send(data)
//     } catch (err) {
//         next(err)
//     }
// }


// exports.postPreImport = async(req, res, next) => {
//     try {
//         pipiline = [{
//                 $group: {
//                     _id: ObjectId('607ead68ef38bd1ea6b40298'),
//                     data: {
//                         $push: {
//                             hospitalId: "$hospitalid",
//                             name: "$name",
//                             emailId: "$emailid",
//                             contact: "$contact",
//                             partner: "NIL",
//                         }
//                     }
//                 },

//             }, {
//                 $lookup: {
//                     from: 'adminSchema',
//                     "let": { "id": ObjectId('607ead68ef38bd1ea6b40298') },

//                     "pipeline": [
//                         { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

//                         {

//                             "$project": {
//                                 name: 1,
//                                 id: "$_id",
//                                 email: 1,
//                                 mobile: 1,
//                                 Role: 1,
//                                 _id: 0
//                             }
//                         }
//                     ],

//                     as: 'role',

//                 }
//             },

//         ]

//         data = await emp.aggregate(pipiline)
//         empData = data[0].data.filter((v, i, a) => a.findIndex(t => (t.emailId === v.emailId)) === i)
//         data[0].data = empData
//         data.forEach(async element => {
//             element.data.forEach(async element1 => {
//                 const Hospitalemployee = new HospitalEmployee();
//                 Hospitalemployee.hospitalId = element1.hospitalId;
//                 Hospitalemployee.partner = element1.partner;
//                 Hospitalemployee.role = {
//                     name: 'Super Hospital',
//                     Role: 'Hospital Group Admin'
//                 };
//                 Hospitalemployee.name = element1.name;
//                 Hospitalemployee.emailId = element1.emailId;
//                 Hospitalemployee.contact = element1.contact;

//                 await Hospitalemployee.save()

//             })
//         });
//         res.send(data)
//     } catch (err) {
//         next(err)
//     }
// }