const mongoose=require('mongoose')

var userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    Email:{
        type:String
    },
    password:{
        type:String,
        require:true
    },
    Cpassword:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        require:true
    }
})
const Userdb=mongoose.model('users',userSchema);
module.exports=Userdb;