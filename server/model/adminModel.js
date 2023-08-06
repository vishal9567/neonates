const mongoose = require('mongoose')

const Schema = mongoose.Schema;  
let Admin = mongoose.model('Admin',
    new Schema({
        name: String,
        gender: String,
        email: String,
        password: String
    }),
    'admin');
module.exports=Admin