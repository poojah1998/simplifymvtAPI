
const patient = require('../models/patient-model')

//getall Doctors
const getAllPatients = async (req, res) => {
    let result = await patient.find();
    console.log(result);
    res.send(result);
};
const addPatient =async(req,res,next)=>{
    let result =await doctor.patient(req.body);
    res.send({msg:"doctor added successfully",patientData:result})
}

module.exports={
    getAllPatients,addPatient
}