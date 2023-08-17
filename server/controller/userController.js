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
    enableOrDesableUser: (data, status) => {
        if (status == "true") {
            return new Promise(async (resolve, reject) => {
                let doc = await userdb.updateOne({ _id: data }, {
                    $set: {
                        status: false
                    }
                }).then(result => {
                    resolve(result)
                })
            })
        }
        else if (status == "false") {
            return new Promise(async (resolve, reject) => {
                let doc = await userdb.updateOne({ _id: data }, {
                    $set: {
                        status: true
                    }
                }).then(result => {
                    resolve(result)
                })
            })
        }

    },
    getUser: () => {
        return new Promise(async (resolve, reject) => {
            let doc = await userdb.find().lean()
                .then(result => {
                    resolve(result)
                })
        })
    },
    updateUserPassword: (email, password) => {
        console.log(password);
        return new Promise(async (resolve, reject) => {
            pass = await bcrypt.hash(password, 10)
            console.log(pass);
            let doc = await userdb.updateOne({ Email: email }, {
                $set:
                {
                    password: pass
                }
            }).then(result => {
                resolve(result)
            })

        })
    },
    validateUser: (data) => {
        try {
            console.log(data.email);
            return new Promise(async (resolve, reject) => {
                let doc = await userdb.findOne({ Email: data.email }).lean()
                    .then(user => {

                        if (user) {
                            bcrypt.compare(data.password, user.password).then(result => {
                                console.log(result);
                                if (user.status === true && result)
                                    resolve(user)
                                else
                                    reject()
                            })
                        }
                        else {
                            reject()
                        }
                    })
            })
        }

        catch (err) {
            console.log(err);
        }

    },
    addAddress: (id, data) => {
        console.log(id, data);// find user using id otherwise each refresh do not get the total address entered 
        return new Promise(async (resolve, reject) => {
            try {
                let user = await userdb.findOne({ _id: id._id }).then(async user => {
                    console.log("this is user",user);
                    try {
                        if (user.address[0]) {
                            let doc = await userdb.aggregate([{ $unwind: "$address" }, { $group: { _id: 0, 'count': { $sum: 1 } } }]).then(async result => {
                                if (result[0].count > 1) {
                                    console.log("count comes in if:", result[0].count);
                                    resolve({ address: true })
                                }
                                else {
                                    console.log("count comes:", result[0].count);
                                    try {
                                        let doc = await userdb.updateOne({ _id: id._id }, { $push: { address: data } })
                                    }
                                    catch (err) {
                                    }
                                }
                            })
                        }
                        else {
                            try {
                                let doc = await userdb.updateOne({ _id: id._id }, { $push: { address: data } })
                            }
                            catch (err) {
                            }
                        }
                    }
                    catch (err) {
                    }
                })
            }
            catch (err) {

            }
        })
    }
}

//findUser: (data) => {
    //     return new Promise(async (resolve, reject) => {
    //         let doc = await userdb.findOne({ Email: data.email }).lean()
    //             .then(user => {
    //                 if (user) {
    //                     bcrypt.compare(data.password, user.password).then(result => {
    //                         console.log(data.password);
    //                         if (user.status === true) {
    //                             resolve(result)
    //                         }
    //                         else
    //                             reject()
    //                     })
    //                 }
    //                 else {
    //                     reject()
    //                 }

    //             })
    //     })
    // }