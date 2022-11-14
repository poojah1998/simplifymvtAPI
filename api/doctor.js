
const doctor = require('../models/doctor-model')

//getall Doctors
const getAllDoctors = async (req, res) => {
    // console.log("111111111111111111");
    let result = await doctor.find();
    console.log(result);
    res.send(result);
};
const addDoctor =async(req,res,next)=>{
    let result =await doctor.create(req.body);
    res.send({msg:"doctor added successfully",doctorData:result})
}

module.exports={
    getAllDoctors,addDoctor
}