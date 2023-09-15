const mongoose=require('mongoose')

var userSchema=new mongoose.Schema({
    name:{
        type:String
        
    },
    Email:{
        type:String
    },
    password:{
        type:String
        
    },
    Cpassword:{
        type:String
        
    },
    status:{
        type:Boolean
        
    },
    address:[
        {
            country:{
                type:String
            },
            state:{
                type:String
            },
            district:{
                type:String
            },
            city:{
                type:String
            },
            pinCode:{
                type:String
            },
            phone:{
                type:Number
            }
        }
    ],
    wishlist:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId
            },
            productname:{
                type:String
            },
            brandname:{
                type:String
            },
            image:{
                type:String
            },
            price:{
                type:Number
            }
        }
    ],
    wallet:{
        type:Number
    },
    referalCode:{
        type:String
    }
})
const Userdb=mongoose.model('users',userSchema);
module.exports=Userdb;