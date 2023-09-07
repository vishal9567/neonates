const coupenDb = require('../model/coupenModel')
const mongoose = require('mongoose')

module.exports = {
    createCoupen: (data) => {                                                      //*--------==create coupen. checking the unique coupen then insert it---===//
        // console.log(data);
        // let date=new Date(data.expiry).toISOString()
        // console.log(date,"this is date");
        try {
            let coupenName = (data.coupenName).toUpperCase();
            return new Promise(async (resolve, reject) => {
                let checkCoupen = await coupenDb.findOne({ coupenName: coupenName }).lean()
                if (checkCoupen) {
                    resolve({ coupen: true })
                }
                else {
                    let doc = await coupenDb.collection.insertOne({
                        coupenName: coupenName,
                        discount: data.discount,
                        expiry: data.expiry
                    }).then(result => {
                        resolve(result)
                    }).catch(err => {
                        reject(err)
                    })

                }
            })
        }
        catch (err) {
            throw new Error(err);
        }
    },
    getCoupen: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let coupen = await coupenDb.find().lean()
                if (coupen) {
                    resolve(coupen)
                }
                else if (!coupen) {
                    resolve({ notCoupen: true })
                }
                else reject()
            })
        }
        catch (err) {
            throw new Error(err);
        }
    },
    updateCoupen: (data,id) => {
        try {
            return new Promise(async (resolve, reject) => {
                let doc=await coupenDb.updateOne({ _id:new mongoose.Types.ObjectId(id) },
                    {
                        $set: {
                            coupenName: data.coupenName,
                            discount: data.discount,
                            expiry: data.expiry
                        }
                    }
                ).then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                })
            })
        }
        catch (err) {
            throw new Error(err);
        }
    },
    deleteCoupen: (id) => {
        try {
            return new Promise(async (resolve, reject) => {
                await coupenDb.deleteOne({ _id:id }).then(() => {
                    resolve()
                }).catch(() => {
                    reject()
                })
            })
        }
        catch (err) {
            throw new Error(err);
        }
    },
    getOneCoupon: (id) => {
        try {
            return new Promise(async (resolve, reject) => {
                let coupen = await coupenDb.findOne({_id:id}).lean()
                if (coupen) {
                    resolve(coupen)
                }
                else if (!coupen) {
                    resolve({ notCoupen: true })
                }
                else reject()
            })
        }
        catch (err) {
            throw new Error(err);
        }
    }
}