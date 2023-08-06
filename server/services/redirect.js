const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController=require('../controller/userController')


//*----------------user--------------------------------------------------user----------------------------------------------------------*//
exports.createUser=(req,res)=>{
    userController.createUser(req.session.userData).then(result=>{
        res.redirect('/')
    })
    .catch(err=>{
        res.send(400,"Not found")
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