const router=require('express').Router()
const services=require('../services/render')
const redirect=require('../services/redirect')
const upload=require('../services/middleware/multer')
const sessionCheck=require('../services/middleware/sessionCheck')
const productController=require('../controller/productController')
const adminController=require('../controller/adminController')


//----homeroutes-----
router.get('/',services.homerout);
router.get('/dashboard',sessionCheck.auth,redirect.dashboar);
//----Products routes
router.get('/addProductPage',sessionCheck.auth,services.addproducts);
router.get('/listProduct',sessionCheck.auth,productController.get);
router.get('/editProduct/:id',sessionCheck.auth,productController.findone);
router.get('/deleteProduct/:id',sessionCheck.auth,productController.delete);
//---category routes-
router.get('/categoryList',sessionCheck.auth,services.categoryList);
router.get('/addCategory',sessionCheck.auth,services.addCategory);
router.get('/disableCat/:id/:status',sessionCheck.auth,redirect.catED);
router.get('/enableCat/:id/:status',sessionCheck.auth,redirect.catED);
//---user routes-----
router.get('/userList',sessionCheck.auth,services.userList);
router.get('/desableUser/:id/:status',sessionCheck.auth,redirect.userED);
router.get('/enableUser/:id/:status',sessionCheck.auth,redirect.userED);
//----logout---------
router.get('/adminLogout',redirect.logout);


//--post
router.post('/addProduct',upload.array('image', 2),sessionCheck.auth,productController.create);
router.post('/updateProduct/:id',upload.array('image',2),sessionCheck.auth,productController.update)
router.post('/adminLogin',adminController.findone)
router.post('/addToCategory',sessionCheck.auth,redirect.addToCategory)


module.exports=router;