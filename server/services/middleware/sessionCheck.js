
module.exports = {
    auth: (req, res, next) => {
        if(req.session.AdminLogIn)
            next();
        else
            res.redirect('/admin')
    },
    otpAuth:(req,res,next)=>{
        if(req.body){
            console.log(req.body);
            if(req.body.otp === req.session.otp)
                next();
            else
                res.send("Oops!...")//render a page to show the error inportant
        }
        else{
            res.send("Oops!...")
        }
    }
}