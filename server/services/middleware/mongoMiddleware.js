const userController=require('../../controller/userController')

module.exports={
    userData:(req,res,next)=>{
        let userId=req.session.userId
        userController.getCurrentUser(userId).then(userData=>{
            req.session.userDatas=userData;
            next();
        }).catch(err=>{
            res.render('user/errorPage')
        })
    }
}