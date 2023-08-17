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
    ]
})
const Userdb=mongoose.model('users',userSchema);
module.exports=Userdb;