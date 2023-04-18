const express = require('express')
const router = express.Router();
const stockController = require('../controllers/stockController')
const isAdminAuth = require("../middlewares/isAdminAuth")
const isUserAuth = require("../middlewares/isUserAuth")

router.get('/getAllStocks',stockController.getAllStocks)
router.post('/stockIn',isUserAuth,stockController.stockIn)
router.post('/getDocumentStockOut',isUserAuth,stockController.getDocumentStockOut)
router.post('/getStockDoucments',isUserAuth,stockController.getStockDoucments)
router.post('/getStockoutByDocNo',isUserAuth,stockController.getStockoutByDocNo)
router.post('/getStockInByDocNo',isUserAuth,stockController.getStockInByDocNo)
router.post('/deleteStockIn',isUserAuth,stockController.deleteStockIn)
router.post('/deleteStockOut',isUserAuth,stockController.deleteStockOut)
router.post('/stockOut',isUserAuth,stockController.stockOut)
router.post('/stockOuts',isUserAuth,stockController.stockOuts)
router.post('/getStockAllStockOut',isUserAuth,stockController.getStockAllStockOut)
router.post('/getPrevStockInInfo',isUserAuth,stockController.getPrevStockInInfo)

router.get('/getStockInDocNo',isUserAuth,stockController.getStockInDocNo)
router.get('/getStockOutDocNo',isUserAuth,stockController.getStockOutDocNo)
router.post('/getMonthlyReport',isUserAuth,stockController.getMonthlyReport)
router.post('/getStockReport',isUserAuth,stockController.getStockReport)
router.get('/currentStockList',isUserAuth,stockController.currentStockList)

module.exports=router;