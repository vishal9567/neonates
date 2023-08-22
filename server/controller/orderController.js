const mongoose = require('mongoose')
const orderDb = require('../model/ordersModel')

module.exports = {
    createOrder: (getAddress,cartItem,deliveryDetail,totalQty,user) => {
        return new Promise(async (resolve, reject) => {
            try {
                let stat;
                if(deliveryDetail.payType==='COD'){
                    stat=true;
                }
                else if(deliveryDetail.payType === 'Razorpay'){
                    stat=false;
                }
                const date = new Date();
                const day = date.getDate();                     //? Returns the day of the month (1-31)
                const month = date.getMonth() + 1;              //? Returns the month (0-11), so adding 1 to get 1-12
                const year = date.getFullYear();                //? Returns the year (e.g., 2023)

                let createdOn = ` ${day}/${month}/${year}`
                let doc = await orderDb.collection.insertOne({
                    userid:cartItem.user,
                    userName:user,
                    deliveryDetails:getAddress.address,
                    paymentMethod: deliveryDetail.payType,
                    totalAmount: totalQty[0],
                    products:[...cartItem.products],
                    status: stat,
                    quantity: totalQty[1],
                    date: createdOn,
                }).then(result=>{
                    resolve()
                })
            }
            catch (err) {

            }
        })
    },
    getOrders:(user)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let doc=await orderDb.findOne({"userid" : new mongoose.Types.ObjectId(user)}).lean()
                .then(orders=>{
                    resolve(orders)
                })
            }
            catch(err){

            }
        })
    },
    getOrderDetails:(user)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const orderDetails=await orderDb.aggregate([
                    {$match:{userid:mongoose.Types.ObjectId.createFromHexString(user)}},
                    {$unwind:'$products'},
                    {
                        $project:{
                            user:"$userid",
                            name:"$userName",
                            item:'$products.item',
                            quantity:'$products.quantity',
                            status:'$status',
                            Tquantity:'$quantity',
                            date:'$date',
                            payType:'$paymentMethod',
                            totalPrice:'$totalAmount',
                            address:'$deliveryDetails'
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField:'item',
                            foreignField:'_id',
                            as:'orders'
                        }
                    },
                    {
                        $project:{user:1,name:1,item:1,quantity:1,status:1,Tquantity:1,date:1,payType:1,totalPrice:1,address:1,order:{$arrayElemAt:['$orders',0]}}
                    }
                ]).exec();
                resolve(orderDetails);
            }
            catch(err){
                reject(err);
            }
        });
    },
    getOrderDetailsForAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const orderDetails=await orderDb.aggregate([
                    {$unwind:'$products'},
                    {
                        $project:{
                            user:"$userid",
                            name:"$userName",
                            item:'$products.item',
                            quantity:'$products.quantity',
                            status:'$status',
                            Tquantity:'$quantity',
                            date:'$date',
                            payType:'$paymentMethod',
                            totalPrice:'$totalAmount',
                            address:'$deliveryDetails'
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField:'item',
                            foreignField:'_id',
                            as:'orders'
                        }
                    },
                    {
                        $project:{user:1,name:1,item:1,quantity:1,status:1,Tquantity:1,date:1,payType:1,totalPrice:1,address:1,order:{$arrayElemAt:['$orders',0]}}
                    }
                ]).exec();
                resolve(orderDetails);
            }
            catch(err){
                reject(err);
            }
        });
    },
    getOrderForAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let doc=await orderDb.find({}).lean()
                .then(orders=>{
                    resolve(orders)
                })
            }
            catch(err){

            }
        })
    }
}