const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const categoryController = require('../controller/categoryController')


//*----------------user--------------------------------------------------user----------------------------------------------------------*//
exports.createUser = (req, res) => {
    userController.createUser(req.session.userData).then(result => {
        res.redirect('/')
    })
        .catch(err => {
            res.send(400, "Not found")
        })
}
exports.findUser = (req, res) => {
    userController.findUser(req.body).then(result => {
        req.session.user = true
        res.redirect('/')
    })
        .catch((err) => {
            res.send('User name or password incorrect or you are inactive')
        })
}

//----------------admin--------------------------------------------------admin----------------------------------------------------------*//
// exports.dashboard = (req, res) => {
//     res.redirect('/admin')
// }
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin')
}
exports.addToCategory = (req, res) => {
    addcategory.create(req.body).then(result => {
        res.redirect('/admin/addCategory')
    })
}
exports.dashboar=(req,res)=>{
    res.redirect('/admin')
}
exports.catED=(req,res)=>{
    let id=req.params.id
    let status=req.params.status
    categoryController.enableOrDesableCat(id,status).then(result=>{
        res.redirect('/admin/categoryList')
    })
}
exports.userED=(req,res)=>{
    let id=req.params.id
    let status=req.params.status
    userController.enableOrDesableUser(id,status).then(result=>{
        res.redirect('/admin/userList')
    })
}
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