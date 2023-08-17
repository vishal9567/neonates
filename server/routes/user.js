const router=require('express').Router();
const render=require('../services/render')
const redirect=require('../services/redirect')
const sessionCheck=require('../services/middleware/sessionCheck')
const categoryController=require('../controller/cartController');
const cartController = require('../controller/cartController');
const { response } = require('express');




//------//
router.get('/',render.home)
router.get('/signUp',render.signUp);
router.get('/userLogin',render.userLogin)
router.get('/landing',render.landing)
router.get('/home',render.home)
router.get('/eachCategory/:id',render.categoryProduct)
router.get('/forgotPassword',render.forgotPassword)
router.get('/logout',redirect.logOut)
//--------cart--
router.get('/productView/:id',render.showProductDetail)
router.get('/addToCart/:id',sessionCheck.userAuth,redirect.addToCart)
router.get('/cart',sessionCheck.userAuth,render.getCart)

// router.get('/userDash',(req,res)=>{
//     res.render('user/userAddress',{dashboard:true})
// })


router.post('/sendOtp',render.userSignup);
router.post('/verifyOtp',sessionCheck.otpAuth,redirect.createUser)
router.post('/loginCheck',redirect.findUser)
router.post('/sendMobOtp',render.sendTwillio)
router.post('/verifyMobOtp',sessionCheck.mobOtpAuth,redirect.UserRedirect)
router.post('/incItems/decItems',redirect.incrementItems)

//need rework
router.post('/deleteCartItem',(req,res)=>{
    let proId=req.body.count
    console.log("productid for delete cart item",proId);
    cartController.deleteCartItem(req.body).then(response=>{
        res.json(response)
    }).catch(error=>{
        res.send(error)
    })
})

router.post('/addAddress',render.addAddress)

router.get('/proceedToCkeckOut',(req,res)=>{
    let userId=req.session.userId
    if(userId.address){
        console.log(userId.address);
        //got the next stage of check out
        res.send("go to next")
    }
    else{
        res.render('user/userAddress',{email:userId.Email,dashboard:true,TotalPrice:req.session.grandTotal})
    }
    
})


// router.get('/cartPage',(req,res)=>{
//     let product=req.session.product
//     console.log(req.session.product);
//     res.render('user/cartPage',{product})
// })

module.exports=router;








// router.get('/otp',(req,res)=>{
//     res.render('user/otpcard')
// })

//eqiogfaetdzvethu--password nodemailer