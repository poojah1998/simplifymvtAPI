
const hashtag =require('../models/hashtag-model')



const addhashtag =async(req,res,next)=>{
    let result =await hashtag.create(req.body);
    res.send({msg:"hashtag added successfully",hashtagData:result})
}
//findbyid
const gethashtagById= async (req, res) => {
    let result=await hashtag.findById(req.params.id);
    res.send(result);
};

////findbyiddelete
const deletehashtagById= async (req, res) => {
    let result=await hashtag.findByIdAndDelete(req.params.id);
    res.send(result);
};



////findbyIdAndUpdate
const updatehashtagById= async (req, res) => {
    let result=await hashtag.findByIdAndUpdate(req.params.id);
    res.send(result);
};


module.exports={
    addhashtag,
    gethashtagById,
    deletehashtagById,
    updatehashtagById

}