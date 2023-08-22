const userdb = require('../model/userModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

module.exports = {
    createUser: (data) => {                                                //*==============create user during signup===========
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
    enableOrDesableUser: (data, status) => {                                //*===========Block or Unblock user==================
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
    getUser: () => {                                                          //*=============Findout the user during login or other purpose===============
        return new Promise(async (resolve, reject) => {
            let doc = await userdb.find().lean()
                .then(result => {
                    resolve(result)
                })
        })
    },
    updateUserPassword: (email, password) => {                              //*=============Edit the user password================
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
    validateUser: (data) => {                                                //*=============check whether the user is valid or invalid================
        try {
           //// console.log(data.email);
            return new Promise(async (resolve, reject) => {
                let doc = await userdb.findOne({ Email: data.email }).lean()
                    .then(user => {

                        if (user) {
                            bcrypt.compare(data.password, user.password).then(result => {
                               //// console.log(result);
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
    addAddress: (id, data) => {                                                                     //*=============during checkout procedure add the address if there is no address yet================
        console.log(id, data);                                                  
        return new Promise(async (resolve, reject) => {
            try {
                let user = await userdb.findOne({ _id: id._id }).then(async user => {              //*============ find user using id otherwise each refresh do not get the total address entered =================
                    console.log("this is user",user);
                    try {
                        if (user.address[0]) {
                            let doc = await userdb.aggregate([{ $unwind: "$address" }, { $group: { _id: 0, 'count': { $sum: 1 } } }]).then(async result => {
                                if (result[0].count > 1) {                                          //check the count of addresses 2 address limited
                                    console.log("count comes in if:", result[0].count);
                                    resolve({ address: true, validation:true })                                      //============if address present go to the next stage of check out================
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
                                let doc = await userdb.updateOne({ _id: id._id }, { $push: { address: data } }) //============if address field is found then push another address================
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
    },
    getCurrentUser:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let doc = await userdb.find({_id:id._id}).lean()
                .then(result => {
                    resolve(result)
                })
            }
            catch(err){

            }
        })
    },
    getDeliveryAddress:(userId,addressid)=>{                                                  //*get delivery address for order collection 
       
        return new Promise(async(resolve,reject)=>{
            try{
                let doc=await userdb.aggregate([
                    {$match:{'_id' : mongoose.Types.ObjectId.createFromHexString(userId._id)}},
                    {$unwind:'$address'},
                    {$match:{'address._id' : mongoose.Types.ObjectId.createFromHexString(addressid.addressId)}},
                    {$project:{'address.country':1,'address.state':1,'address.district':1,'address.city':1,'address.pinCode':1,'address.phone':1}}
                    ]).exec();
                    resolve(doc[0])
            }
            catch(err){

            }
        })
    }
}
