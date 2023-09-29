const userdb = require('../model/userModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const referralCodes=require('voucher-code-generator')

module.exports = {
    createUser: (data) => {  
        let ref;
        let walletRef;
        console.log('form data:',data);                                              //*==============create user during signup===========
        return new Promise(async (resolve, reject) => {
            pass = await bcrypt.hash(data.password, 10)
            Cpass = await bcrypt.hash(data.Cpassword, 10)
            try {
                ref=referralCodes.generate({
                    prefix: 'neonates-',
                    count: 1,
                    length: 5,
                    charset: referralCodes.charset('alphabetic'),
                });
            } catch (e) {
                console.log('Sorry, not possible.');
            }
            if(data.refCode){
                await userdb.findOneAndUpdate({referalCode:data.refCode},{$inc:{wallet:250}})
                walletRef=100;
            }
            else
                walletRef=0
            console.log(ref[0]);
            let doc = await userdb.collection.insertOne({
                name: data.userName,
                Email: data.email,
                password: pass,
                Cpassword: Cpass,
                status: true,
                referalCode:ref[0],
                wallet:walletRef
            })
                .then(result => {
                    resolve(result)
                }).catch(err => {
                    reject(err)
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
                }).catch(err => {
                    reject(err)
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
                }).catch(err => {
                    reject(err)
                })
            })
        }

    },
    getUser: (perPage,page) => {                                                          //*=============Findout the user during login or other purpose===============
        return new Promise(async (resolve, reject) => {
            await userdb.find().skip(perPage * page -perPage).limit(perPage).lean()
                .then(result => {
                    resolve(result)
                }).catch(err => {
                    reject(err)
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
                .catch(() => {
                    reject()
                })

        })
    },
    validateUser: (data) => {                                                //*=============check whether the user is valid or invalid================
        try {
            //// console.log(data.email);
            return new Promise(async (resolve, reject) => {
                await userdb.findOne({ Email: data.email }).lean()
                    .then(user => {

                        if (user) {
                            bcrypt.compare(data.password, user.password).then(result => {
                                //// console.log(result);
                                if (user.status === true && result)
                                    resolve(user)
                                else
                                    resolve()
                            })
                        }
                        else {
                            reject()
                        }
                    })
            })
        }

        catch (err) {
            // console.log(err);
            reject(err)
        }

    },
    addAddress: (id, data) => {                                                                     //*=============during checkout procedure add the address if there is no address yet================
        console.log(id, data);
        return new Promise(async (resolve, reject) => {
            try {
                await userdb.findOne({ _id: id._id }).then(async user => {              //*============ find user using id otherwise each refresh do not get the total address entered =================
                    console.log("this is user", user);
                    try {
                       // if (user.address[0]) {
                            await userdb.updateOne({ _id: id._id }, { $push: { address: data } }).then(()=>{
                                resolve({addressAdd:true})
                            })
                            // await userdb.aggregate([{ $match: { '_id': mongoose.Types.ObjectId.createFromHexString(id._id) } }, { $unwind: "$address" }, { $group: { _id: 0, 'count': { $sum: 1 } } }]).then(async result => {
                            //     if (result[0].count >= 2) {                                          //check the count of addresses, 2 address limited
                            //         console.log("count comes in if:", result[0].count);
                            //         resolve({ address: true, validation: true })                                      //============if address present go to the next stage of check out================
                            //     }
                            //     else {
                            //         console.log("count comes:", result[0].count);
                            //         try {
                            //         }
                            //         catch (err) {
                            //         }
                            //     }
                            // })
                       // }
                        // else {
                        //     try {
                        //         await userdb.updateOne({ _id: id._id }, { $push: { address: data } }) //============if address field is found then push another address================
                        //     }
                        //     catch (err) {
                        //     }
                        // }
                    }
                    catch (err) {
                    }
                })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    getCurrentUser: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                await userdb.find({ _id: id._id }).lean()
                    .then(result => {
                        resolve(result)
                    })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    getDeliveryAddress: (userId, addressid) => {                                                  //*get delivery address for order collection 

        return new Promise(async (resolve, reject) => {
            try {
                let doc = await userdb.aggregate([
                    { $match: { '_id': mongoose.Types.ObjectId.createFromHexString(userId._id) } },
                    { $unwind: '$address' },
                    { $match: { 'address._id': mongoose.Types.ObjectId.createFromHexString(addressid.addressId) } },
                    { $project: { 'address.country': 1, 'address.state': 1, 'address.district': 1, 'address.city': 1, 'address.pinCode': 1, 'address.phone': 1 } }
                ]).exec();
                resolve(doc[0])
            }
            catch (err) {
                reject(err)
            }
        })
    },
    updateAddress: (id, data) => {
        try {
            return new Promise(async (resolve, reject) => {
                let doc = await userdb.updateOne({ 'address._id': new mongoose.Types.ObjectId(id) }, {
                    $set: {
                        'address.$.country': data.country,
                        'address.$.state': data.state,
                        'address.$.district': data.district,
                        'address.$.city': data.city,
                        'address.$.pinCode': data.pinCode,
                        'address.$.phone': data.phone
                    }
                }).then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        }
        catch (err) {
        }
    },
    deleteAddress: (data) => {
        try {
            return new Promise(async (resolve, reject) => {
                await userdb.updateOne({ _id: data.userId }, { $pull: { address: { _id: data.addressId } } })
                    .then(result => {
                        resolve()
                    }).catch(err => {
                        reject(err)
                    })
            })
        }
        catch (err) {

        }
    },
    addToWhishlist: (pro, userId) => {
        try {
            let proObj = {
                productId: pro.id,
                productname: pro.proname,
                brandname: pro.probrand,
                image: pro.proimg,
                price: pro.proprice
            }
            return new Promise(async (resolve, reject) => {
                let user = await userdb.findOne({ _id: userId }).lean()
                if (user.wishlist) {
                    const proExist = user.wishlist.some(item => item.productId.toString() === pro.id.toString());
                    if (proExist) {
                        resolve({ exist: true })
                    }
                    else {
                        await userdb.updateOne({ _id: userId }, { $push: { wishlist: proObj } }).then(() => {
                            resolve()
                        })
                    }
                }
                else {
                    await userdb.updateOne({ _id: userId }, { $push: { wishlist: proObj } }).then(() => {
                        resolve()
                    })
                }
            })
        }
        catch (err) {
            throw new Error(err)
        }
    },
    removeFromWishlist: (pro, userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await userdb.updateOne({ _id: userId }, { $pull: { wishlist: { productId: pro } } }).then(() => {
                    resolve()
                })
            })
        }
        catch (err) {
            throw new Error(err)
        }
    },
    addToWallet: (id, order) => {
        console.log('this is order for wallet',order);
        let history={
            amount:order.totalAmount,
            payType:order.paymentMethod,
            status:order.status
        }
        try {
            return new Promise(async (resolve, reject) => {
                if (order.paymentMethod === 'Razorpay' || order.paymentMethod === 'wallet') {
                    await userdb.updateOne({_id:id},{$push:{wallethistory:history}})
                    let user = await userdb.findOne({ _id: id }).lean()
                    if (user.wallet) {
                        await userdb.updateOne({ _id: id }, { $inc: { wallet: order.totalAmount } }).then(() => {
                            resolve()
                        })
                    }
                    else {
                        await userdb.updateOne(
                            { _id: id },
                            { $set: { wallet: order.totalAmount } },
                            { upsert: true }
                        ).then(() => {
                            resolve()
                        })
                    }
                }
                else {
                    resolve()
                }
            })
        }
        catch (err) {
            throw new Error(err)
        }
    },
    updateWallet: (id, amount) => {
        try {
            return new Promise(async (resolve, reject) => {
                let user = await userdb.findOne({ _id: id }).lean()
                if (user.wallet) {
                    await userdb.updateOne(
                        { _id: id },
                        { $inc: { wallet: amount } }
                    ).then(() => {
                        resolve()
                    })
                }
            })
        }
        catch (err) {
            throw new Error(err)
        }
    },
    getWalletHistory:(id,perPage,page)=>{
        let skip = perPage*page - perPage;
        try{
            return new Promise(async(resolve,reject)=>{
                let count=await userdb.aggregate([
                    {$match:{"_id" : mongoose.Types.ObjectId.createFromHexString(id)}},
                    {$unwind:'$wallethistory'},
                    {$project:{'wallethistory.amount':1,'wallethistory.payType':1,'wallethistory.status':1,'wallethistory.date':1,'wallet':1}},
                    {$sort:{'wallethistory.date':-1}}
                    ])
                    console.log('from contorl',count.length);
                await userdb.aggregate([
                    {$match:{"_id" : mongoose.Types.ObjectId.createFromHexString(id)}},
                    {$unwind:'$wallethistory'},
                    {$project:{'wallethistory.amount':1,'wallethistory.payType':1,'wallethistory.status':1,'wallethistory.date':1,'wallet':1}},
                    {$sort:{'wallethistory.date':-1}},
                    {$skip:skip},
                    {$limit:perPage}
                    ]).then((history)=>{
                        resolve({history,count})
                    })
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}
