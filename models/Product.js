const mongoose = require("mongoose")

const productScheme = new mongoose.Schema({
    name:{type:String,default:"",required:true},
    companyName:[],
    type:[],
    unit:[]
},{timestamps:true})

const Product = new mongoose.model("Product",productScheme)
module.exports = Product;