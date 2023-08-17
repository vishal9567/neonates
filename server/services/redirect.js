const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const categoryController = require('../controller/categoryController')
const cartController = require('../controller/cartController');
const productHelpers=require('../controller/productHelper')


//*----------------user--------------------------------------------------user----------------------------------------------------------*//
exports.createUser = (req, res) => {
    userController.createUser(req.session.userData).then(result => {
        res.redirect('/userLogin')
    })
        .catch(err => {
            res.send(400, "Not found")
        })
}
exports.findUser = (req, res) => {
    userController.validateUser(req.body).then(result => {
        if (result) {
            req.session.user = true
            req.session.userId = result
            res.redirect('/')
        }

    })
        .catch((err) => {
            res.send('User name or password incorrect or you are inactive')
        })
}
exports.UserRedirect = (req, res) => {
    console.log(req.body.otp);
    if (req.session.otpMob === req.body.otp) {
        userController.updateUserPassword(req.session.Email, req.session.newPassword)
            .then(result => {
                res.redirect('/')
            })
            .catch(reject => {
                res.send("!Oops...")
            })
    }

}
exports.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/')
}
exports.addToCart = (req, res) => {
    let val = req.session.userId
    let c= -1
    cartController.addToCart(req.params.id, val._id).then(result => {
        productHelpers.inventryThenAddToCart(req.params.id,c).then(result=>{
            console.log("here comes call hurray!");
            res.json(true)
        })
       
    })
        .catch(err => {
            console.log(err,"message from addtocart catch");
        })
}
exports.incrementItems = (req, res) => {
    console.log(req.body);
    productHelpers.inventry(req.body)
    cartController.incrementItems(req.body).then((response) => {
        res.json(response)
    }).catch(err => {
        res.send(err)//show in error page
    })
}








//----------------admin--------------------------------------------------admin----------------------------------------------------------*//

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin')
}
exports.addToCategory = (req, res) => {
    addcategory.create(req.body).then(result => {
        res.redirect('/admin/addCategory')
    })
}
exports.dashboar = (req, res) => {
    res.redirect('/admin')
}
exports.catED = (req, res) => {
    let id = req.params.id
    let status = req.params.status
    categoryController.enableOrDesableCat(id, status).then(result => {
        res.redirect('/admin/categoryList')
    })
}
exports.userED = (req, res) => {
    let id = req.params.id
    let status = req.params.status
    userController.enableOrDesableUser(id, status).then(result => {
        res.redirect('/admin/userList')
    })
}






// exports.dashboard = (req, res) => {
//     res.redirect('/admin')
// }


//-------------------adminlogin-----------//
// exports.findAdmin=(req,res)=>{
//     let data=req.body
//     adminController.findAdmin(req.body).then(result=>{
//         req.session.AdminLogIn=true;
//         res.redirect('/admin')
//     })
//     .catch(err=>{
//         res.send(500)
//     })
// }