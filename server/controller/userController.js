const userdb = require('../model/userModel')
const bcrypt = require('bcrypt')

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
            pass = await bcrypt.hash(data.password, 10)
            Cpass = await bcrypt.hash(data.Cpassword, 10)
            let doc = await userdb.collection.insertOne({
                name: data.userName,
                Email: data.email,
                password: pass,
                Cpassword: Cpass,
                status: true
            })
                .then(result => {
                    resolve(result)
                })
        })
    },
    findUser: (data) => {
        return new Promise(async (resolve, reject) => {
            let doc = await userdb.findOne({ Email: data.email }).lean()
                .then(user => {
                    if (user) {
                        bcrypt.compare(data.password, user.password).then(result => {
                            if (user.status === true) {
                                resolve(result)
                            }
                            else
                                reject()
                        })
                    }

                })
        })
    },
    enableOrDesableUser: (data, status) => {
        if (status == "true") {
            return new Promise(async(resolve, reject) => {
                let doc=await userdb.updateOne({_id:data},{$set:{
                    status:false
                }}).then(result=>{
                    resolve(result)
                })
            })
        }
        else if(status == "false"){
            return new Promise(async(resolve,reject)=>{
                let doc=await userdb.updateOne({_id:data},{$set:{
                    status:true
                }}).then(result=>{
                    resolve(result)
                })
            })
        }

    },
    getUser:()=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await userdb.find().lean()
            .then(result=>{
                resolve(result)
            })
        })
    }
}

