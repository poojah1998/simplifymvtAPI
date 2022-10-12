const express=require('express');
const router=express.Router();
let crud=require('../crud/studentCrud');



//add studentdata 1
router.post('/add',async(req,res)=>{ 
    let result=await crud.Addstudent(req.body);
    res.send({msg:"student added successfully",data:result});
})
// http://localhost:8000/api/student/add
// {
//     "name":"sasmita",
//     "class":12,
//     "roll_no":4
// }


//It will find the student table data
router.get('/findData',async(req,res)=>{ 
    let result=await crud.findAll(req.body);
    res.send(result);
})
//http://localhost:8000/api/student/findData

// [
//     {
//         "_id": "61767668ea51febebfde699e",
//         "name": "pooja",
//         "class": 12,
//         "roll_no": 4,
//         "__v": 0
//     },
//     {
//         "_id": "6176863fdd1db874a98ee2cf",
//         "name": "sasmita",
//         "class": 12,
//         "roll_no": 4,
//         "__v": 0
//     }
// ]

//findall data and populatejm
router.get('/data',async(req,res)=>{
    let result=await crud.findAllAndPopulate ('school_id');
    res.send(result);
})
//http://localhost:8000/api/student/data
router.get('/find',async(req,res)=>{ 
    let result=await crud.findAll(req.body);
    res.send(result);
})


//
router.get('/deletdata',async(req,res)=>{
    let result=await crud.deleteone();
    res.send({msg:"student data delete successfully",data:result});
})
//
router.get('/updatedata',async(req,res)=>{
    let result=await crud.upone(req.query,req.body);
    res.send({msg:"student data update successfully",data:result});
})

//http://localhost:8000/api/student/updatedata?_id=6176a2397d148e203b3962f5
// {
//     "name": "pihu",
//     "class": 13,
//     "roll_no": 4,
//     "school_id": "617773499472221122470528"
// }



//
router.get('/onedata',async(req,res)=>{
    let result=await crud.findone();
    res.send(result);
})
//
router.get('/replacedata',async(req,res)=>{
    let result=await crud.replaceone(req.query,req.body);
    res.send({msg:"student data replace successfully",data:result});
})
// http://localhost:8000/api/student/replacedata?_id=6176a2397d148e203b3962f5
// {
//     "name": "pihuu",
//     "class": 14,
//     "roll_no": 8,
//     "school_id": "617773499472221122470528"
// }

router.get('/insertdata',async(req,res)=>{ 
    let result=await crud.insertmany(req.body.arr);
    res.send({msg:"student data insert successfully",data:result});
})
// http://localhost:8000/api/student/insertdata
// {
//     "arr": [
//         {
//             "name": "sasmita",
//             "class": 10,
//             "roll_no": 7
//         },
//         {
//             "name": "saloni",
//             "class": 11,
//             "roll_no": 8
//         },
//         {
//             "name": "ayushi",
//             "class": 7,
//             "roll_no": 10
//         }
//     ]
// }



router.put('/updatemany',async(req,res)=>{ 
    let result=await crud.updatemany(req.query,req.body);
    res.send({msg:"student data insert successfully",data:result});
})

// http://localhost:8000/api/student/updatemany?name=saloni
// {
//     "name": "mano",
//     "class": 6,
//     "roll_no": 1
// }

router.put('/updatemany',async(req,res)=>{ 
    let result=await crud.updatemany(req.query,req.body);
    res.send({msg:"student data delete successfully",data:result});
})

router.put('/updateone',async(req,res)=>{ 
    let result=await crud.upone(req.query,req.body);
    res.send({msg:"student data delete successfully",data:result});
})









module.exports = router;