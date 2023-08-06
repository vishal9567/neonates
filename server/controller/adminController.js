const Admin=require('../model/adminModel')
const bcrypt= require('bcrypt')

// module.exports={
//     findAdmin:(data)=>{
//         console.log(data);
//         return new Promise(async(resolve,reject)=>{
//             let doc=await Admin.findOne({email:data.email}).lean()
//             .then(admin=>{
//                 console.log(admin);
//                 if(admin){
//                     bcrypt.compare(data.password,admin.password).then(status=>{
//                         if(status){
//                             console.log("yes got it");
//                             resolve(status)
//                         }
//                     })
//                 }
//             })
//         })
//     }
// }

exports.findone=async (req,res)=>{
    const entry=req.body
    console.log(entry.email);
    let doc=await Admin.findOne({email:entry.email}).lean()
    .then(admin=>{
        if(admin){
            bcrypt.compare(entry.password,admin.password).then(status=>{
                if(status){
                    req.session.AdminLogIn=true;
                    res.redirect('/admin')
                }
                else
                    res.redirect('/admin')
            })
            .catch(err=>{
                res.status(500).send({
                    message: err.message || "Error can not find"
                })
            })
        }
        
    })
    .catch(err=>{
        res.status(500).send({
            message: err.message || "Error can not find"
        })
    })
}


