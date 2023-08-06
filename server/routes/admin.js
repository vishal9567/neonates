const router=require('express').Router()
const services=require('../services/render')
const redirect=require('../services/redirect')
const upload=require('../services/middleware/multer')
const sessionCheck=require('../services/middleware/sessionCheck')
const productController=require('../controller/productController')
const adminController=require('../controller/adminController')



router.get('/',services.homerout);
router.get('/addProductPage',sessionCheck.auth,services.addproducts);
router.get('/categoryList',sessionCheck.auth,services.categoryList)
router.get('/userList',services.userList)
router.get('/listProduct',sessionCheck.auth,productController.get);
router.get('/editProduct/:id',sessionCheck.auth,productController.findone)
router.get('/deleteProduct/:id',sessionCheck.auth,productController.delete)
router.get('/adminLogout',redirect.logout)
router.get('/addCategory',sessionCheck.auth,services.addCategory)


router.post('/addProduct',upload.single('image'),sessionCheck.auth,productController.create);
router.post('/updateProduct/:id',upload.single('image'),sessionCheck.auth,productController.update)
router.post('/adminLogin',adminController.findone)
router.post('/addToCategory',sessionCheck.auth,redirect.addToCategory)


module.exports=router;