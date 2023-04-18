const mongoose = require("mongoose")

const stockOutScheme = new mongoose.Schema({
    name:{type:String,default:"",required:true},
    docNo:{type:Number,default:1},
    location:{type:mongoose.Types.ObjectId,ref:"Location"},
    locationName:{type:String,default:""},
    trainerName:{type:String,default:""},
    doctorName:{type:String,default:""},
    quantity:{type:Number,default:0, required:true},
    unit:{type:String,default:""},
    date:{type:Date},
    prevQuantity:{type:Number,default:0},
},{timestamps:true})

const StockOut = new mongoose.model("StockOut",stockOutScheme)
module.exports = StockOut;