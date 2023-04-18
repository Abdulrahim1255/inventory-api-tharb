const mongoose = require("mongoose")

const supplierScheme = new mongoose.Schema({
    name:{type:String,default:"",required:true},
    location:{type:String,default:"",required:true},
    contact:{type:String,default:"",required:true},
},{timestamps:true})

const Supplier = new mongoose.model("Supplier",supplierScheme)
module.exports = Supplier;