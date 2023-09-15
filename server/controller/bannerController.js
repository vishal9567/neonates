const bannerDb=require('../model/bannerModel')
const cropImg = require('../../config/imageCrop')
const fs = require('fs')

module.exports={
    createBanner:(req)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                await cropImg.cropForBanner(req);
                await bannerDb.collection.insertOne({
                    name:req.body.bannername,
                    expiry:req.body.expiry,
                    image:[req.files[0].filename,req.files[1].filename,req.files[2].filename]
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}