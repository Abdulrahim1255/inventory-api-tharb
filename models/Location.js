const mongoose = require("mongoose")

const locationScheme = new mongoose.Schema({
    name:{type:String,default:"",required:true},
    trainerName:[],
    doctorName:[],
},{timestamps:true})

const Location = new mongoose.model("Location",locationScheme)
module.exports = Location;