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
router.get('/deleteProduct/:id/:img',sessionCheck.auth,productController.delete);
//---category routes-
router.get('/categoryList',sessionCheck.auth,services.categoryList);
router.get('/addCategory',sessionCheck.auth,services.addCategory);
router.get('/disableCat/:id/:status',sessionCheck.auth,redirect.catED);
router.get('/enableCat/:id/:status',sessionCheck.auth,redirect.catED);
router.get('/addCatOffer',sessionCheck.auth,redirect.addCatOffer);
//---user routes-----
router.get('/userList',sessionCheck.auth,services.userList);
router.get('/disableUser/:id/:status',sessionCheck.auth,redirect.userED);
router.get('/enableUser/:id/:status',sessionCheck.auth,redirect.userED);
//----logout---------
router.get('/adminLogout',redirect.logout);
//----order list----
router.get('/orderListTable',sessionCheck.auth,services.orderListTable)
router.get('/showOrderDetail/:id',sessionCheck.auth,services.showOrderDetail)
router.get('/findTheOrder',sessionCheck.auth,services.filterOrderForAdmin)
router.get('/updateStatus',sessionCheck.auth,redirect.updateStatus)
//----coupen list---
router.get('/coupenList',sessionCheck.auth,services.coupenList)
router.get('/createCouponPage',sessionCheck.auth,services.createCouponPage)
router.get('/editCoupon/:id',sessionCheck.auth,services.editCouponPage)
router.get('/deleteCoupon/:id',sessionCheck.auth,redirect.deleteCoupon)
//----banner--------
router.get('/addBanner',sessionCheck.auth,services.addBanner)
//----sales report--
router.get('/salesReport',sessionCheck.auth,redirect.salesReport)



//--post
router.post('/addProduct',upload.array('image', 2),sessionCheck.auth,productController.create);
router.post('/updateProduct/:id',upload.array('image',2),sessionCheck.auth,productController.update)
router.post('/createBanner',upload.array('image',3),sessionCheck.auth,redirect.createBanner)
router.post('/adminLogin',adminController.findone)
router.post('/addToCategory',sessionCheck.auth,redirect.addToCategory)
router.post('/changeStatus',sessionCheck.auth,redirect.changeStatus)
//--coupon management----
router.post('/submitCoupon',sessionCheck.auth,redirect.createCoupon)
router.post('/submitUpdate/:id',sessionCheck.auth,redirect.editCoupon)



module.exports=router;