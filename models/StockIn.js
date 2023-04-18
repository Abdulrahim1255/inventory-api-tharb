const mongoose = require("mongoose")

const stockInScheme = new mongoose.Schema({
    name:{type:String,default:""},
    productType:{type:String,default:""},
    docNo:{type:Number,default:1},
    supplierDocNo:{type:String,default:""},
    supplier:{type:mongoose.Types.ObjectId,ref:"Supplier"},
    quantity:{type:Number,default:0, required:true},
    price:{type:Number,default:0},
    prevQuantity:{type:Number,default:0},
    expiry:{type:Date},
    unit:{type:String,default:""}
},{timestamps:true})

const StockIn = new mongoose.model("StockIn",stockInScheme)
module.exports = StockIn;