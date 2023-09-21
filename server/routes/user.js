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
router.get('/landing', render.landing)
router.get('/home', render.home)
router.get('/eachCategory/:id', render.categoryProduct)
router.get('/forgotPassword', render.forgotPassword)
router.get('/logout', redirect.logOut)

//--------======cart=======--------//
router.get('/productView/:id', render.showProductDetail)
router.get('/addToCart/:id', sessionCheck.userAuth, redirect.addToCart)
router.get('/cart', sessionCheck.userAuth, render.getCart)
router.get('/proceedToCkeckOut',sessionCheck.userAuth,render.proceedToCheckOut)


//--------=======address section=====---------//
router.get('/addAddress2',sessionCheck.userAuth,render.addAdddress2)//check if needed or not

//--------=======user dashboard=======-----//
router.get('/showProducts/:id',sessionCheck.userAuth,cartCount.cartCount,render.showProductsForuser)
router.get('/userDashBoard',sessionCheck.userAuth,mongoMiddleware.userData,cartCount.cartCount,render.userDashboard)
router.get('/userOrderList',sessionCheck.userAuth,cartCount.cartCount,render.userOrderList)
router.get('/addressBook',sessionCheck.userAuth,mongoMiddleware.userData,cartCount.cartCount,render.addressBook)
router.get('/wallet',sessionCheck.userAuth,mongoMiddleware.userData,redirect.wallet)
router.get('/findOrder',sessionCheck.userAuth,render.filterOrder)
//--------======whishlist=====-----//
router.get('/addToWhishlist', sessionCheck.userAuth, redirect.addToWhishlist)
router.get('/wishlist',sessionCheck.userAuth,mongoMiddleware.userData,render.showWishlist)
router.get('/backToCart',sessionCheck.userAuth,mongoMiddleware.userData,redirect.backToCart)

//-------========coupon============--------//
router.get('/getCoupon',sessionCheck.userAuth,redirect.getCoupon)
router.get('/findCouponForCart',sessionCheck.userAuth,redirect.findCouponForCart)


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
router.post('/placeOrder',sessionCheck.userAuth,mongoMiddleware.userData,redirect.getOrderDetails)
router.post('/cancelOrder',sessionCheck.userAuth,redirect.cancelOrder)

//=======address management===========//
router.post('/editAddress',sessionCheck.userAuth,render.editAddress)
router.post('/editAddressSubmit',sessionCheck.userAuth,redirect.submitEditAddress)
router.post('/deleteAddress',sessionCheck.userAuth,redirect.deleteAddress)

//!--------------------------------------------------------------------------------------------------------------------------------//



router.post('/verifyPayment',sessionCheck.userAuth,(req,res)=>{
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

router.get('/getCatProducts',redirect.getCatProducts)
router.get('/getPriceProducts',redirect.getPriceProducts)
router.get('/getColorProducts',redirect.getColorProducts)
router.get('/walletHistory',sessionCheck.userAuth,render.getWalletHistory)
router.get('/invoice',redirect.invoice)
router.get('/likeProduct',redirect.likeProduct)

module.exports = router;








// router.get('/otp',(req,res)=>{
//     res.render('user/otpcard')
// })

//eqiogfaetdzvethu--password nodemailer