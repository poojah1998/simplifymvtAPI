
const hospital = require('../models/hospital-model')

//getall Doctors
const getAllhospitals = async (req, res) => {
    console.log("2222222222");
    let result = await hospital.find();
    console.log(result);
    res.send(result);
};
const addhospital =async(req,res,next)=>{
    let result =await hospital.create(req.body);
    res.send({msg:"hospital added successfully",hospitalData:result})
}

module.exports={
    getAllhospitals,addhospital
}