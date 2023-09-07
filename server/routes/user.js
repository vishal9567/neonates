const router = require('express').Router();
const render = require('../services/render')
const redirect = require('../services/redirect')
const sessionCheck = require('../services/middleware/sessionCheck')
const cartCount=require('../services/middleware/cartCount')
const categoryController = require('../controller/cartController');
const cartController = require('../controller/cartController');
const { response } = require('express');
const orderController=require('../controller/orderController')
const fs=require('fs');
const path = require('path')
const userController = require('../controller/userController')
const mongoMiddleware=require('../services/middleware/mongoMiddleware')







//!----------------------------------------------------------------get----------------------------------------------------------//
router.get('/',cartCount.cartCount,render.home)
router.get('/signUp', render.signUp);
router.get('/userLogin', render.userLogin)
router.get('/landing/:page', render.landing)
router.get('/home/:page', render.home)
router.get('/eachCategory/:id', render.categoryProduct)
router.get('/forgotPassword', render.forgotPassword)
router.get('/logout', redirect.logOut)

//--------======cart=======--------//
router.get('/productView/:id', render.showProductDetail)
router.get('/addToCart/:id', sessionCheck.userAuth, redirect.addToCart)
router.get('/cart', sessionCheck.userAuth, render.getCart)
router.get('/proceedToCkeckOut',sessionCheck.userAuth,render.proceedToCheckOut)

//--------=======address section=====---------//
router.get('/addAddress2',sessionCheck.userAuth,render.addAdddress2)

//--------=======user dashboard=======-----//
router.get('/showProducts/:id',sessionCheck.userAuth,cartCount.cartCount,render.showProductsForuser)
router.get('/userDashBoard',sessionCheck.userAuth,cartCount.cartCount,render.userDashboard)
router.get('/userOrderList',sessionCheck.userAuth,cartCount.cartCount,render.userOrderList)
router.get('/addressBook',sessionCheck.userAuth,mongoMiddleware.userData,cartCount.cartCount,render.addressBook)



//!------------------------------------------------------------------post---------------------------------------------------------//
router.post('/sendOtp', render.userSignup);
router.post('/verifyOtp', sessionCheck.otpAuth, redirect.createUser)
router.post('/loginCheck', redirect.findUser)
router.post('/sendMobOtp', render.sendTwillio)
router.post('/verifyMobOtp', sessionCheck.mobOtpAuth, redirect.UserRedirect)
router.post('/incItems/decItems',sessionCheck.userAuth, redirect.incrementItems)


//==========user address section=========//
router.post('/addAddress',sessionCheck.userAuth, render.addAddress)
router.post('/addUserFormSubmit',sessionCheck.userAuth, redirect.addUserFormSubmit)

//=======delete the item using delete button in cart page======//
router.post('/deleteCartItem',sessionCheck.userAuth,redirect.deleteCartItem)

//=======order management==============//
router.post('/placeOrder',sessionCheck.userAuth,redirect.getOrderDetails)
router.post('/cancelOrder',sessionCheck.userAuth,redirect.cancelOrder)

//=======address management===========//
router.post('/editAddress',sessionCheck.userAuth,render.editAddress)
router.post('/editAddressSubmit',sessionCheck.userAuth,redirect.submitEditAddress)
router.post('/deleteAddress',sessionCheck.userAuth,redirect.deleteAddress)

//!--------------------------------------------------------------------------------------------------------------------------------//



router.post('/verifyPayment',(req,res)=>{
    orderController.verifyPayment(req.body).then(result=>{
        orderController.changeStatusOfOrder(req.body.order.receipt).then(()=>{
            res.json(true)
        }).catch(err=>{
            res.render('user/errorPage')
        })
    }).catch(err=>{
        res.render('user/errorPage')
    })
})

router.post('/searchProducts',render.productSearch)

// router.post('/placeOrder',(req,res)=>{
//     console.log(req.body);
//     res.json(true)
// })

// router.get('/orderList',(req,res)=>{
//     res.render('user/userOrder',{signup:true})
// })








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