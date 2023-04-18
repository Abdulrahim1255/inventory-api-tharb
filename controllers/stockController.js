const mongoose = require('mongoose')
const Product = require("../models/Product")
const Stock = require("../models/Stock")
const StockIn = require("../models/StockIn")
const StockOut = require("../models/StockOut")
const bcrypt = require('bcrypt');
const date = require('date-and-time');
const jwt = require("jsonwebtoken")

class ProductController{
    async getProduct (req,res){
        res.send("home routre user")
    }

    async getAllStocks(req,res){
        Stock.find({},{stockIn:0,stockOut:0}).populate("product")
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }

    async stockIn(req,res){
        let {productType,productName,productId,supplierId,supplierDocNo,quantity,price,expiry,docNo,unit} = req.body;
        if(!productType||!productName||!productId||!supplierId||!supplierDocNo||!quantity||!price||!expiry||!docNo||!unit){
            res.status(400).send("Bad Request")
        }else{
            quantity = parseInt(quantity)
            price = parseInt(price)
            Stock.findOne({name:req.body.productName})
            .then(async response=>{
                const newStockIn = new StockIn({
                    name:productName,
                    productType,
                    docNo,
                    supplierDocNo,
                    supplier:supplierId,
                    quantity,
                    price,
                    expiry,
                    unit
                })
                const stockInResponse = await newStockIn.save()
                if(response){
                    //product already exist increase quantity and stock in
                    Stock.findOneAndUpdate({_id:response._id},{$inc:{quantity:quantity},$push:{stockIn:stockInResponse._id}})
                    .then(async stockUpdateResponse=>{
                        console.log(stockUpdateResponse)
                        await StockIn.updateOne({_id:stockInResponse._id},{$set:{prevQuantity:stockUpdateResponse.quantity}})
                        res.status(200).send({msg:'success',result:stockInResponse})
                    })
                }else{
                    //product doesn't exist stock in and create
                        const newStock = new Stock({
                            name:productName,
                            product:mongoose.Types.ObjectId(productId),
                            quantity,
                            stockIn:[stockInResponse._id]
                        })
                        newStock.save()
                        .then(newStockResponse=>{
                            res.status(200).send({msg:'success',result:stockInResponse})
                        })
                }
            })
        }
        
    }

    async deleteStockIn(req,res){
        //stock in ki ID bhejo aur jo stockin ki quantity thi, wo bhi bhejo
        StockIn.deleteOne({_id:mongoose.Types.ObjectId(req.body.stockInId)})
        .then(response=>{
            console.log(response)
            Stock.findOneAndUpdate({'stockIn':mongoose.Types.ObjectId(req.body.stockInId)},{$inc:{quantity:-req.body.quantity},$pull:{stockIn:mongoose.Types.ObjectId(req.body.stockInId)}})
            .then(async stockresponse=>{
                console.log(stockresponse)
                if(stockresponse.quantity<=0 || stockresponse.quantity===req.body.quantity){
                    await Stock.deleteOne({_id:stockresponse._id})
                }
                res.status(200).send({msg:"success",result:"Successfully Removed StockIn"})
            })
        })
    }

    async stockOut(req,res){
        let {unit,productName,productId,docNo,locationId,quantity,stockId,date,trainerName,doctorName,locationName}=req.body;
        // console.log("bodydata",{unit,productName,productId,docNo,locationId,quantity,stockId,date,trainerName,doctorName})
        if(!unit || !productName||!productId||!docNo||!locationId||!quantity||!date||!trainerName||!doctorName){
            res.status(400).send("Bad Request")
        }else{
            quantity = parseInt(quantity)

            if(!stockId){
                const newStockOut = new StockOut({
                    name:productName,
                    docNo,
                    location:locationId,
                    quantity,
                    date,
                    trainerName,
                    doctorName,
                    unit,
                    locationName
                })
                newStockOut.save()
                .then(stockoutresponse=>{
                    const newStock = new Stock({
                        name:productName,
                        product:mongoose.Types.ObjectId(productId),
                        quantity:-quantity,
                        stockOut:[stockoutresponse._id]
                    })
                    newStock.save()
                    .then(newStockResponse=>{
                        res.status(200).send({msg:'success',result:stockoutresponse})
                    })
                })

            }else{
                let currentStock = await Stock.findOne({_id:mongoose.Types.ObjectId(stockId)})
                // console.log(quantity,currentStock.quantity,currentStock)
                // if(quantity>parseInt(currentStock.quantity)){
                //     res.status(400).send("Stock out quantity cannot be greater than current stock quantity")
                // }else{
                    const newStockOut = new StockOut({
                        name:productName,
                        docNo,
                        location:locationId,
                        quantity,
                        date,
                        trainerName,
                        doctorName,
                        unit,
                        locationName
                    })
                    newStockOut.save()
                    .then(stockoutresponse=>{
                        Stock.updateOne({_id:mongoose.Types.ObjectId(stockId)},{$inc:{quantity:-quantity},$push:{stockOut:stockoutresponse._id}})
                        .then(async currentStock=>{
                            console.log(currentStock)
                            await StockOut.updateOne({_id:stockoutresponse._id},{$set:{prevQuantity:currentStock.quantity}})
                            res.status(200).send({msg:'success',result:stockoutresponse})
                        })
                    })
            }


            }

//        }
    }
    async deleteStockOut(req,res){
        console.log(req.body)
        StockOut.deleteOne({_id:mongoose.Types.ObjectId(req.body.stockOutId)})
        .then(response=>{
            console.log(response)
            Stock.findOneAndUpdate({'stockOut':mongoose.Types.ObjectId(req.body.stockOutId)},{$inc:{quantity:req.body.quantity},$pull:{stockOut:mongoose.Types.ObjectId(req.body.stockOutId)}})
            .then(async stockresponse=>{
                console.log(stockresponse)
                if(stockresponse.quantity<=0 || stockresponse.quantity===req.body.quantity){
                    await Stock.deleteOne({_id:stockresponse._id})
                }
                res.status(200).send({msg:"success",result:"Successfully Removed stockOut"})
            })
        })
    }
    async getPrevStockInInfo(req,res){
        if(!req.body.from || !req.body.to || !req.body.productType){
            res.status(400).send("Bad Request")
        }else{
            let d1 = date.parse(req.body.to, 'YYYY/MM/DD');
            let d2 = date.parse(req.body.from, 'YYYY/MM/DD'); //format - '2023/01/10'
            console.log(d1)
            StockIn.find({productType:req.body.productType,$and:[{createdAt:{$gt:d1}},{createdAt:{$lt:d2}}]})
            .then(response=>{
                res.status(200).send({msg:"success",result:response})
            })
        }
        
    }

    async getStockInDocNo(req,res){
        StockIn.find({},{docNo:1}).sort({createdAt:-1}).limit(1)
        .then(response=>{
            res.status(200).send({msg:'success',result:response})
        })
    }
    async getStockOutDocNo(req,res){
        StockOut.find({},{docNo:1}).sort({createdAt:-1}).limit(1)
        .then(response=>{
            res.status(200).send({msg:'success',result:response})
        })
    }

    async getMonthlyReport(req,res){
        let d1 = date.parse(req.body.from, 'YYYY/MM/DD');
        let d2 = date.parse(req.body.to, 'YYYY/MM/DD'); //format - '2023/01/10'
        console.log(d2,d3)
        StockOut.aggregate([
            {
              $match: {
                $and: [
                  { createdAt: { $gt: d1 } },
                  { createdAt: { $lt: d2 } }
                ]
              }
            },
            {
              $lookup: {
                from: "locations",
                localField: "location",
                foreignField: "_id",
                as: "location"
              }
            }
          ])
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }
//,$and:[{createdAt:{$gt:"2022-11-29T18:30:00.000Z"}},{createdAt:{$lt:"2022-12-31T18:30:00.000Z"}} ]
    async getStockReport(req,res){
        let d1 = date.parse(req.body.from, 'YYYY/MM/DD');
        let d2 = date.parse(req.body.to, 'YYYY/MM/DD'); //format - '2023/01/10'
        console.log(d1,d2)
        StockOut.find({location:mongoose.Types.ObjectId(req.body.locationId),trainerName:req.body.trainerName,$and:[{createdAt:{$gt:d1}},{createdAt:{$lt:d2}}]})
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }

    async getStockAllStockOut(req,res){
        if(req.body.search){
            StockOut.find({docNo:req.body.search})
            .then(response=>{
                res.status(200).send({msg:"success",result:response})
            })
        }else{
            StockOut.find({})
            .then(response=>{
                res.status(200).send({msg:"success",result:response})
            })
        }
    }

    async getDocumentStockOut(req,res){
        console.log(req.body.docNo)
        StockOut.aggregate([
            {
                $match:req.body.docNo?{docNo:parseInt(req.body.docNo)}:{}
            },
            {
                $sort:{createdAt:-1}
            },
            {
                $group:{
                _id:{
                docNo:"$docNo",
                },
                createdAt:{$push:"$createdAt"}
                
            }}  
        ])
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }

    async getStockDoucments(req,res){
        console.log(req.body.name)
        if(!req.body.name){
            res.status(400).send("Bad Request")
        }else{
            let stockout = await StockOut.aggregate([
                {
                    $match:{name:req.body.name}
                },
                {
                    $sort:{createdAt:-1}
                },
                {
                    $group:{
                    _id:{
                    docNo:"$docNo",
                    },
                    // doc:{
                    //     $push:{
                    //     name:"$name",
                    //     // productType:"$vitamin",
                    //     // supplierDocNo:"$supplierDocNo",
                    //     quantity:"$quantity",
                    //     unit:"$unit",
                    //     doctorName:"$doctorName",
                    //     trainerName:"$trainerName",
                    //     prevQuantity:"$prevQuantity",
                    //     date:"$date",
                    //     "createdAt":"$createdAt",
                    //     }
                    // }
                    createdAt:{$push:"$createdAt"},
                    name:{$push:"$name"},
                    // productType:{$push:"$vitamin"},
                    // supplierDocNo:{$push:"$supplierDocNo"},
                    quantity:{$push:"$quantity"},
                    unit:{$push:"$unit"},
                    doctorName:{$push:"$doctorName"},
                    trainerName:{$push:"$trainerName"},
                    prevQuantity:{$push:"$prevQuantity"},
                    date:{$push:"$date"},
                    
                }}  
            ])
            let stockin = await StockIn.aggregate([
                {
                    $match:{name:req.body.name}
                },
                {
                    $sort:{createdAt:-1}
                },
                {
                    $group:{
                        _id:{
                            docNo:"$docNo",
                            },
                            // doc:{
                            //     $push:{
                            //     name:"$name",
                            //     // productType:"$vitamin",
                            //     // supplierDocNo:"$supplierDocNo",
                            //     quantity:"$quantity",
                            //     unit:"$unit",
                            //     doctorName:"$doctorName",
                            //     trainerName:"$trainerName",
                            //     prevQuantity:"$prevQuantity",
                            //     date:"$date",
                            //     "createdAt":"$createdAt",
                            //     }
                            // }
                    // _id:{
                    // docNo:"$docNo",
                    // },
                    createdAt:{$push:"$createdAt"},
                    name:{$push:"$name"},
                    productType:{$push:"$productType"},
                    supplierDocNo:{$push:"$supplierDocNo"},
                    supplier:{$push:"$supplier"},
                    quantity:{$push:"$quantity"},
                    unit:{$push:"$unit"},
                    price:{$push:"$price"},
                    prevQuantity:{$push:"$prevQuantity"},
                    expiry:{$push:"$expiry"},
                    
                }}  
            ])
            res.status(200).send({msg:"success",result:{stockout:stockout,stockin}})
        }
    }

    async getStockoutByDocNo(req,res){
        if(!req.body.docNo){
            res.status(400).send("Bad Request")
        }else{
            let stockout = await StockOut.aggregate([
                {
                    $match:{docNo:parseInt(req.body.docNo)}
                },
                {
                    $sort:{createdAt:-1}
                },
                {
                    $group:{
                        _id:{
                            docNo:"$docNo",
                            },
                            doc:{
                                $push:{
                                name:"$name",
                                // productType:"$vitamin",
                                // supplierDocNo:"$supplierDocNo",
                                quantity:"$quantity",
                                unit:"$unit",
                                doctorName:"$doctorName",
                                trainerName:"$trainerName",
                                prevQuantity:"$prevQuantity",
                                date:"$date",
                                "createdAt":"$createdAt",
                                }
                            }
                    // _id:{
                    // docNo:"$docNo",
                    // },
                    // createdAt:{$push:"$createdAt"},
                    // name:{$push:"$name"},
                    // // productType:{$push:"$vitamin"},
                    // // supplierDocNo:{$push:"$supplierDocNo"},
                    // quantity:{$push:"$quantity"},
                    // unit:{$push:"$unit"},
                    // doctorName:{$push:"$doctorName"},
                    // trainerName:{$push:"$trainerName"},
                    // prevQuantity:{$push:"$prevQuantity"},
                    // date:{$push:"$date"},
                    
                }}  
            ])
            res.status(200).send({msg:"success",result:stockout})
        }

    }
    async getStockInByDocNo(req,res){
        if(!req.body.docNo){
            res.status(400).send("Bad Request")
        }else{
            let stockin = await StockIn.aggregate([
                {
                    $match:{docNo:parseInt(req.body.docNo)}
                },
                {
                    $sort:{createdAt:-1}
                },
                {
                    $group:{
                        _id:{
                            docNo:"$docNo",
                            },
                            doc:{
                                $push:{
                                name:"$name",
                                // productType:"$vitamin",
                                // supplierDocNo:"$supplierDocNo",
                                quantity:"$quantity",
                                unit:"$unit",
                                productType:"$productType",
                                price:"$price",
                                prevQuantity:"$prevQuantity",
                                expiry:"$expiry",
                                "createdAt":"$createdAt",
                                }
                            }
                    // _id:{
                    // docNo:"$docNo",
                    // },
                    // createdAt:{$push:"$createdAt"},
                    // name:{$push:"$name"},
                    // productType:{$push:"$productType"},
                    // supplierDocNo:{$push:"$supplierDocNo"},
                    // supplier:{$push:"$supplier"},
                    // quantity:{$push:"$quantity"},
                    // unit:{$push:"$unit"},
                    // price:{$push:"$price"},
                    // prevQuantity:{$push:"$prevQuantity"},
                    // expiry:{$push:"$expiry"},
                    
                }} 
            ])
            res.status(200).send({msg:"success",result:stockin})
        }

    }

    async currentStockList(req,res){
        Stock.find({}).populate("stockIn").populate("stockOut")
        .populate({ 
            path: 'stockIn',
            populate: {
              path: 'supplier',
              model: 'Supplier'
            } 
         })
        .populate({ 
            path: 'stockOut',
            populate: {
              path: 'location',
              model: 'Location'
            } 
         })
        // Stock.aggregate([
        //     {$lookup:{
        //         from:"stockins",
        //         localField:"stockIn",
        //         foreignField:"_id",
        //         as:"stockIn"
        //     }},
        //     {$lookup:{
        //         from:"stockouts",
        //         localField:"stockOut",
        //         foreignField:"_id",
        //         as:"stockIn"
        //     }},
        //     {
        //         $unwind:"$stockIn"
        //     },
        //     {$lookup:{
        //         from:"locations",
        //         localField:'stockIn.location',
        //         foreignField:"_id",
        //         as:'stockIn.location'
        //     }},
        //     {
        //         $wind:"$stockIn"
        //     }
        // ])
        .then(response=>{
            res.status(200).send({msg:'success',result:response})
        })
    }
    // $lookup:{
    //     from:"books",
    //     localfield:"favbooks",
    //     foreignField:"_id",
    //     as:"favbooks"
    // }

    async stockOuts(req, res) {
        const stockOuts = req.body.stockOuts;
        let stockOutResponse = {}
        const allStockOuts = []
        for (let i = 0; i < stockOuts.length; i++) {
          const { unit, productName, productId, docNo, locationId, quantity, stockId, date, trainerName, doctorName,locationName } = stockOuts[i];
          
          if(!unit || !productName || !productId || !docNo || !locationId || !quantity || !date || !trainerName || !doctorName ) {
            res.status(400).send("Bad Request");
            return;
          }
          
          const parsedQuantity = parseInt(quantity);
      
          if(!stockId) {
            const newStockOut = new StockOut({
              name: productName,
              docNo,
              location: locationId,
              quantity: parsedQuantity,
              date,
              trainerName,
              doctorName,
              unit,
              locationName
            });
  
            stockOutResponse = await newStockOut.save();
      
            const newStock = new Stock({
              name: productName,
              product: mongoose.Types.ObjectId(productId),
              quantity: -parsedQuantity,
              stockOut: [stockOutResponse._id]
            });
      
            await newStock.save();
      
          } else {
            let currentStock = await Stock.findOne({ _id: mongoose.Types.ObjectId(stockId) });
      
            const newStockOut = new StockOut({
              name: productName,
              docNo,
              location: locationId,
              quantity: parsedQuantity,
              date,
              trainerName,
              doctorName,
              unit,
              locationName
            });
      
            stockOutResponse = await newStockOut.save();
      
            await Stock.updateOne({ _id: mongoose.Types.ObjectId(stockId) }, { $inc: { quantity: -parsedQuantity }, $push: { stockOut: stockOutResponse._id } });
      
            await StockOut.updateOne({ _id: stockOutResponse._id }, { $set: { prevQuantity: currentStock.quantity } });
      
            
          }
          allStockOuts.push(stockOutResponse)
        }
        res.status(200).send({ msg: 'success', result: allStockOuts });

      }
      

}

const productController = new ProductController();
module.exports=productController;