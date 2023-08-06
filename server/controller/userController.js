const userdb = require('../model/userModel')
const bcrypt= require('bcrypt')

//-------------insert a user---------//
// exports.create = (req, res) => {
//     let userData = new userdb({
//         name: req.body.userName,
//         Email: req.body.email,
//         password: req.body.password,
//         Cpassword: req.body.Cpassword

//     });
//     userData
//         .save()
//         .then(result => {
//             // console.log(result);
//             res.render('user/home', { signup: true })
//         })
//         .catch(err => {
//             console.log(err);
//         })
//     // res.redirect('/admin')
// }
module.exports = {
    createUser: (data) => {
        return new Promise(async (resolve, reject) => {
            pass= await bcrypt.hash(data.password,10)
            Cpass=await bcrypt.hash(data.Cpassword,10)
            let doc = await userdb.collection.insertOne({
                name: data.userName,
                Email: data.email,
                password: pass,
                Cpassword: Cpass    
            })
            .then(result=>{
                resolve(result)
            })
        })
    }
}

