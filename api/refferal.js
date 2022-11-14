
const refferal = require('../models/refferal-model')

//getall Doctors
const getAllRefferal = async (req, res) => {
    // console.log("111111111111111111");
    let result = await refferal.find();
    console.log(result);
    res.send(result);
};
// const addDoctor =async(req,res,next)=>{
//     let result =await doctor.create(req.body);
//     res.send({msg:"doctor added successfully",doctorData:result})
// }

module.exports={
    getAllRefferal
}