const router=require('express').Router();
const render=require('../services/render')
const redirect=require('../services/redirect')
const sessionCheck=require('../services/middleware/sessionCheck')



//------//
router.get('/',render.home)
router.get('/signUp',render.signUp);
router.get('/userLogin',render.userLogin)
router.get('/landing',render.landing)
router.get('/home',render.home)
router.get('/eachCategory/:id',render.categoryProduct)
router.get('/forgotPassword',render.forgotPassword)
router.get('/logout',redirect.logOut)


router.post('/sendOtp',render.userSignup);
router.post('/verifyOtp',sessionCheck.otpAuth,redirect.createUser)
router.post('/loginCheck',redirect.findUser)
router.post('/sendMobOtp',render.sendTwillio)
router.post('/verifyMobOtp',sessionCheck.mobOtpAuth,redirect.UserRedirect) 


module.exports=router;








// router.get('/otp',(req,res)=>{
//     res.render('user/otpcard')
// })

//eqiogfaetdzvethu--password nodemailer