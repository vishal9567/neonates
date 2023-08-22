const router = require('express').Router();
const render = require('../services/render')
const redirect = require('../services/redirect')
const sessionCheck = require('../services/middleware/sessionCheck')
const categoryController = require('../controller/cartController');
const cartController = require('../controller/cartController');
const { response } = require('express');
const orderController=require('../controller/orderController')





//------//
router.get('/', render.home)
router.get('/signUp', render.signUp);
router.get('/userLogin', render.userLogin)
router.get('/landing', render.landing)
router.get('/home', render.home)
router.get('/eachCategory/:id', render.categoryProduct)
router.get('/forgotPassword', render.forgotPassword)
router.get('/logout', redirect.logOut)
//*--------======cart=======--------//
router.get('/productView/:id', render.showProductDetail)
router.get('/addToCart/:id', sessionCheck.userAuth, redirect.addToCart)
router.get('/cart', sessionCheck.userAuth, render.getCart)
router.get('/proceedToCkeckOut',sessionCheck.userAuth,render.proceedToCheckOut)
//*--------=======address section=====---------//
router.get('/addAddress2',sessionCheck.userAuth,render.addAdddress2)
//*--------=======user dashboard=======-----//
router.get('/showProducts/:id',render.showProductsForuser)
router.get('/userDashBoard',sessionCheck.userAuth,render.userDashboard)
router.get('/userOrderList',sessionCheck.userAuth,render.userOrderList)


router.post('/sendOtp', render.userSignup);
router.post('/verifyOtp', sessionCheck.otpAuth, redirect.createUser)
router.post('/loginCheck', redirect.findUser)
router.post('/sendMobOtp', render.sendTwillio)
router.post('/verifyMobOtp', sessionCheck.mobOtpAuth, redirect.UserRedirect)
router.post('/incItems/decItems', redirect.incrementItems)
//*==========user address section=========//
router.post('/addAddress', render.addAddress)
router.post('/addUserFormSubmit', redirect.addUserFormSubmit)
//*=======delete the item using delete button in cart page======//
router.post('/deleteCartItem',redirect.deleteCartItem)
//*===========Place the order=============================//
router.post('/placeOrder',redirect.getOrderDetails)










// router.get('/test',(req,res)=>{
//     let user = req.session.userId
//     console.log("this is user detail",user);
// })

// router.get('/cartPage',(req,res)=>{
//     let product=req.session.product
//     console.log(req.session.product);
//     res.render('user/cartPage',{product})
// })

module.exports = router;








// router.get('/otp',(req,res)=>{
//     res.render('user/otpcard')
// })

//eqiogfaetdzvethu--password nodemailer