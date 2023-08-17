
module.exports = {
    auth: (req, res, next) => {
        if(req.session.AdminLogIn)
            next();
        else
            res.redirect('/admin')
    },
    otpAuth:(req,res,next)=>{
        if(req.body){
            if(req.body.otp === req.session.otp)
                next();
            else
                res.send("Oops!...otp not valid")//render a page to show the error inportant
        }
        else{
            res.send("Oops!...")
        }
    },
    mobOtpAuth:(req,res,next)=>{
        if(req.body){
            if(req.body.otp === req.session.otpMob)
                next();
        }
        else
            res.send("otp not valid")
    },
    userAuth:(req,res,next)=>{
        if(req.session.user){
            console.log(req.session.user);
            next();
        }
        else
            res.redirect('/')
    }
}
