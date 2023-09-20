const coupenDb = require('../model/coupenModel')
const mongoose = require('mongoose')

module.exports = {
    createCoupen: (data) => {                                                      //*--------==create coupen. checking the unique coupen then insert it---===//
        let dis=parseInt(data.discount);
        let min=parseInt(data.minimum);
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
                        discount: dis,
                        expiry: data.expiry,
                        minimum: min
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
    getCoupen: (perPage,page) => {
        try {
            return new Promise(async (resolve, reject) => {
                let coupen = await coupenDb.find().skip(page*perPage -perPage).limit(perPage).lean()
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
    },
    getCouponForCart:(price)=>{
        let amount=parseInt(price)
        try{
            return new Promise(async(resolve,reject)=>{
                let coupon=await coupenDb.find({minimum:{$lte:amount}}).lean()
                if(coupon){
                    resolve(coupon)
                }
                else
                    resolve({noCoupon:true})
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    findCouponForCart:(data)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await coupenDb.findOne({$and:[{"coupenName" : data.coupon},{user:{$elemMatch:{"userId" : data.userId}}}]})
                if(doc){
                    console.log('this is doc',doc.user[0].userId);
                    resolve({used:true})
                }
                else{
                    await coupenDb.findOne({coupenName:data.coupon}).lean().then(data=>{
                        resolve(data)
                    })
                }  
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    pushUserToCoupon:(data)=>{
        let obj={
            userId:data.userId
        }
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await coupenDb.findOne({$and:[{"coupenName" : data.coupon},{user:{$elemMatch:{"userId" : data.userId}}}]})
                if(doc){
                    resolve()
                }
                else{
                    await coupenDb.updateOne({coupenName:data.coupon},{$push:{user:obj}}).then(()=>{
                        resolve()
                    })  
                }  
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}