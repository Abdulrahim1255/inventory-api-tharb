const express = require('express')
const router = express.Router();
const supplierController = require('../controllers/supplierController')
const isAdminAuth = require("../middlewares/isAdminAuth")
const isUserAuth = require("../middlewares/isUserAuth")

router.get('/getAllSuppliers',supplierController.getAllSuppliers)
router.post('/createSupplier',isAdminAuth,supplierController.createSupplier)
router.post('/deleteSuppliers',isAdminAuth,supplierController.deleteSuppliers)

module.exports=router;