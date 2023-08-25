const mongoose = require('mongoose')

const orederSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId
    },
    userName:{
        type:String
    },
    deliveryDetails: {
       type:Object
    },
    paymentMethod:{
        type:String
    },
    totalAmount:{
        type:Number
    },
    products:{
        type:Array
    },
    status:{
        type:Boolean
    },
    cancelStatus:{
        type:Boolean
    },
    quantity:{
        type:Number
    },
    date:{
        type:String,
    },
    DateNow:{
        type:Date,
        default:Date.now
    }
})

const Order=mongoose.model('orders',orederSchema)
module.exports=Order;