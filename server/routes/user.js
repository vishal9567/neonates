const router=require('express').Router();
const render=require('../services/render')
const redirect=require('../services/redirect')
const sessionCheck=require('../services/middleware/sessionCheck')
//const homeController=require('../controller/homepageController')
//const productController=require('../controller/productController')
//---testing---//
router.get('/signUp',render.signUp);
router.get('/landing',render.landing)
router.get('/home',render.home)
router.get('/eachCategory/:id',render.categoryProduct)

router.post('/sendOtp',render.userSignup);
router.post('/verifyOtp',sessionCheck.otpAuth,redirect.createUser)
router.post('/loginCheck',redirect.findUser)


//-----testing---//
router.get('/userLogin',(req,res)=>{
    res.render('user/userLogin')
})
router.get('/otp',(req,res)=>{
    res.render('user/otpcard')
})

//eqiogfaetdzvethu--password nodemailer
router.get('/',render.home)

module.exports=router;