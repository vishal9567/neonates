const userController=require('../../controller/userController')
const productDb = require('../../model/productModel')
const bannerController=require('../../controller/bannerController')

module.exports={
    userData:(req,res,next)=>{
        let userId=req.session.userId
        userController.getCurrentUser(userId).then(userData=>{
            req.session.userDatas=userData;
            next();
        }).catch(err=>{
            res.render('user/errorPage')
        })
    },
    getPrevPage:(req,res,next)=>{
        req.session.currentUrl=req.originalUrl;
        console.log("this is current url",req.session.currentUrl);
        next();
    }
}