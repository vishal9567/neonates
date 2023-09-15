const mongoose = require('mongoose')
const orderDb = require('../model/ordersModel')
require('dotenv').config()
const Razorpay = require('razorpay');


var instance = new Razorpay({                                            //*------==Razorpay instance==---//
    key_id: 'rzp_test_pgqzwpmJIeUjDN',
    key_secret: 'YCo8y8L4gglx8G0BEPw4hN7z',
  });



module.exports = {
    createOrder: (getAddress, cartItem, deliveryDetail, totalQty, user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let stat;
                if (deliveryDetail.payType === 'COD') {
                    stat = 1;
                }
                else if(deliveryDetail.payType === 'wallet')
                    stat = 1;
                else if (deliveryDetail.payType === 'Razorpay') {
                    stat = 2;
                }
                const date = new Date();
                const day = date.getDate();                     //? Returns the day of the month (1-31)
                const month = date.getMonth() + 1;              //? Returns the month (0-11), so adding 1 to get 1-12
                const year = date.getFullYear();                //? Returns the year (e.g., 2023)

                let createdOn = ` ${day}/${month}/${year}`
                let doc = await orderDb.collection.insertOne({
                    userid: cartItem.user,
                    userName: user,
                    deliveryDetails: getAddress.address,
                    paymentMethod: deliveryDetail.payType,
                    totalAmount: deliveryDetail.total,
                    products: [...cartItem.products],
                    status: stat,
                    quantity: totalQty[1],
                    date: createdOn,
                }).then(result => {
                    resolve(result.insertedId)
                })
            }
            catch (err) {

            }
        })
    },
    getOrders: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let doc = await orderDb.find({ "userid": new mongoose.Types.ObjectId(user) }).lean()
                    .then(orders => {
                        resolve(orders)
                    })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    filterOrder:(id,status)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await orderDb.find({$and:[{userid:new mongoose.Types.ObjectId(id)},{status:status}]}).lean()
                if(doc[0]){
                    resolve(doc)
                }else{
                    resolve({orderNotfound:true})
                }
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    filterOrderForAdmin:(status)=>{
        console.log(status);
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await orderDb.find({status:status}).lean()
                if(doc[0]){
                    resolve(doc)
                }else{
                    resolve({orderNotfound:true})
                }
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    getOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await orderDb.aggregate([
                    { $match: { _id: mongoose.Types.ObjectId.createFromHexString(orderId) } },
                    { $unwind: '$products' },
                    {
                        $project: {
                            user: "$userid",
                            name: "$userName",
                            item: '$products.item',
                            quantity: '$products.quantity',
                            status: '$status',
                            Tquantity: '$quantity',
                            date: '$date',
                            payType: '$paymentMethod',
                            totalPrice: '$totalAmount',
                            address: '$deliveryDetails'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'orders'
                        }
                    },
                    {
                        $project: { user: 1, name: 1, item: 1, quantity: 1, status: 1, Tquantity: 1, date: 1, payType: 1, totalPrice: 1, address: 1, order: { $arrayElemAt: ['$orders', 0] } }
                    }
                ]).exec();
                resolve(orderDetails);
            }
            catch (err) {
                reject(err);
            }
        });
    },
    getOrderDetailsForAdmin: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await orderDb.aggregate([
                    { $unwind: '$products' },
                    {
                        $project: {
                            user: "$userid",
                            name: "$userName",
                            item: '$products.item',
                            quantity: '$products.quantity',
                            status: '$status',
                            Tquantity: '$quantity',
                            date: '$date',
                            payType: '$paymentMethod',
                            totalPrice: '$totalAmount',
                            address: '$deliveryDetails'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'orders'
                        }
                    },
                    {
                        $project: { user: 1, name: 1, item: 1, quantity: 1, status: 1, Tquantity: 1, date: 1, payType: 1, totalPrice: 1, address: 1, order: { $arrayElemAt: ['$orders', 0] } }
                    }
                ]).exec();
                resolve(orderDetails);
            }
            catch (err) {
                reject(err);
            }
        });
    },
    getOrderForTable: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let doc = await orderDb.find({}).lean()
                    .then(orders => {
                        resolve(orders)
                    })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    changeOrderStatus: (data, status) => {                                //*===========Block or Unblock order==================
        if (status == 1) {
            try {
                return new Promise(async (resolve, reject) => {
                    let doc = await orderDb.updateOne({ _id: data }, {
                        $set: {
                            status: 2
                        }
                    }).then(result => {
                        resolve(result)
                    }).catch(err => {
                        reject(err)
                    })
                })
            }
            catch (err) {
                reject(err)
            }
        }
        else if (status == "false") {
            try {
                return new Promise(async (resolve, reject) => {
                    let doc = await orderDb.updateOne({ _id: data }, {
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
            catch (err) {
                reject(err)
            }
        }

    },
    cacelStatus: (data, status) => {                                //*===========cancel order==================
        console.log('this is status',status);
        if (status == 1 || status == 2 ) {
            try {
                return new Promise(async (resolve, reject) => {
                    let doc = await orderDb.updateOne({ _id: data }, {
                        $set: {
                            status: 4
                        }
                    }).then(result => {
                        resolve(result)
                    }).catch(err => {
                        reject(err)
                    })
                })
            }
            catch (err) {
                reject(err)
            }
        }
        else if(status == 5){
            try{
                return new Promise(async(resolve,reject)=>{
                    let doc = await orderDb.updateOne({ _id: data }, {
                        $set: {
                            status: 3
                        }
                    }).then(result => {
                        resolve(result)
                    }).catch(err => {
                        reject(err)
                    })
                })
            }
            catch(err){
                throw new Erro(err)
            }
        }
        // else if (status == "false") {
        //     try {
        //         return new Promise(async (resolve, reject) => {
        //             let doc = await orderDb.updateOne({ _id: data }, {
        //                 $set: {
        //                     cancelStatus: true
        //                 }
        //             }).then(result => {
        //                 resolve(result)
        //             }).catch(err => {
        //                 reject(err)
        //             })
        //         })
        //     }
        //     catch (err) {
        //         reject(err)
        //     }
        // }

    },
    updateStatus:(id,status)=>{
        let stat=parseInt(status)
        try{
            return new Promise(async(resolve,reject)=>{
                await orderDb.updateOne({_id:id},{$set:{status:stat}}).then(()=>{
                    resolve()
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    generateRazorPay:(id,total)=>{
        try{
            return new Promise((resolve,reject)=>{
                var options = {
                    amount: total*100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: id
                  };
                  instance.orders.create(options, function(err, order) {
                    console.log("new order",order);
                    resolve(order)
                  });
            }).catch(err=>{
                reject(err)
            })
        }
        catch(err){
            res.render('user/errorPage')
        }
    },
    verifyPayment:(data)=>{
        try{
            return new Promise((resolve,reject)=>{
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', 'YCo8y8L4gglx8G0BEPw4hN7z');
                hmac.update(data.payment.razorpay_order_id + "|" + data.payment.razorpay_payment_id)
                hmac=hmac.digest('hex')
                if(hmac == data.payment.razorpay_signature){
                    resolve()
                }
                else{
                    reject()
                }
            })
        }
        catch(err){
            res.render('user/errorPage')
        }
    },
    changeStatusOfOrder:(id)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let doc= await orderDb.updateOne({_id:id},{
                    $set:{'status': 1}
                }).then(result=>{
                    resolve()
                }).catch(err=>{
                    reject()
                })
            })
        }
        catch(err){
            res.render('user/errorPage')
        }
    },
    getSigleOrder:(id)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                await orderDb.findOne({_id:id}).lean().then(order=>{
                    resolve(order)
                }).catch(err=>{
                    reject()
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}