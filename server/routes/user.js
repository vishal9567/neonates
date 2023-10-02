const router = require('express').Router();
const render = require('../services/render')
const redirect = require('../services/redirect')
const sessionCheck = require('../services/middleware/sessionCheck')
const cartCount=require('../services/middleware/cartCount')
const mongoMiddleware=require('../services/middleware/mongoMiddleware')







//!----------------------------------------------------------------get----------------------------------------------------------//
router.get('/',mongoMiddleware.getPrevPage,cartCount.cartCount,render.home)
router.get('/signUp', render.signUp);
router.get('/userLogin',sessionCheck.loginAuth, render.userLogin)
router.get('/landing',mongoMiddleware.getPrevPage, render.landing)
router.get('/home',mongoMiddleware.getPrevPage, render.home)
router.get('/eachCategory/:id',mongoMiddleware.getPrevPage, render.categoryProduct)
router.get('/forgotPassword',mongoMiddleware.getPrevPage, render.forgotPassword)
router.get('/logout',mongoMiddleware.getPrevPage, redirect.logOut)

//--------======cart=======--------//
router.get('/productView/:id',mongoMiddleware.getPrevPage, render.showProductDetail)
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
router.get('/wallet',sessionCheck.userAuthPlaceOrder,mongoMiddleware.userData,redirect.wallet)
router.get('/walletHistory',sessionCheck.userAuth,render.getWalletHistory)
router.get('/findOrder',sessionCheck.userAuth,render.filterOrder)
//--------======whishlist=====-----//
router.get('/addToWhishlist', sessionCheck.userAuth, redirect.addToWhishlist)
router.get('/wishlist',sessionCheck.userAuth,mongoMiddleware.userData,render.showWishlist)
router.get('/backToCart',sessionCheck.userAuth,mongoMiddleware.userData,redirect.backToCart)

//-------========coupon============--------//
router.get('/getCoupon',sessionCheck.userAuth,redirect.getCoupon)
router.get('/findCouponForCart',sessionCheck.userAuth,redirect.findCouponForCart)
//-------========pagination using ajax===-----//
router.get('/getCatProducts',redirect.getCatProducts)
router.get('/getPriceProducts',redirect.getPriceProducts)
router.get('/getColorProducts',redirect.getColorProducts)
//-------=======invoice======-----------//
router.get('/invoice',redirect.invoice)
router.get('/likeProduct',redirect.likeProduct)


//!------------------------------------------------------------------post---------------------------------------------------------//
router.post('/sendOtp', render.userSignup);
router.post('/verifyOtp', sessionCheck.otpAuth, redirect.createUser)
router.post('/loginCheck', redirect.findUser)
router.post('/sendMobOtp', render.sendTwillio)
router.post('/verifyMobOtp', sessionCheck.mobOtpAuth, redirect.UserRedirect)
router.post('/incItems/decItems',sessionCheck.userAuth, redirect.incrementItems)

//==========user address section=========//
router.post('/addAddress',sessionCheck.userAuth, render.addAddress)
router.post('/addUserFormSubmit',sessionCheck.userAuthPlaceOrder, redirect.addUserFormSubmit)

//=======delete the item using delete button in cart page======//
router.post('/deleteCartItem',sessionCheck.userAuth,redirect.deleteCartItem)

//=======order management==============//
router.post('/placeOrder',sessionCheck.userAuthPlaceOrder,mongoMiddleware.userData,redirect.getOrderDetails)
router.post('/cancelOrder',sessionCheck.userAuth,redirect.cancelOrder)
router.post('/verifyPayment',sessionCheck.userAuth,redirect.varifyPayment)

//=======address management===========//
router.post('/editAddress',sessionCheck.userAuth,render.editAddress)
router.post('/editAddressSubmit',sessionCheck.userAuth,redirect.submitEditAddress)
router.post('/deleteAddress',sessionCheck.userAuth,redirect.deleteAddress)

//=======product search==============//
router.post('/searchProducts',render.productSearch)
//!--------------------------------------------------------------------------------------------------------------------------------//




module.exports = router;

