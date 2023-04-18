const mongoose = require('mongoose')
const Supplier = require("../models/Supplier")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

class SupplierController{
    async createSupplier(req,res){
        const {name,location,contact}=req.body;
        if(!name || !location || !contact){
            res.status(400).send("Data Missing")
        }else{
            const newSupplier = new Supplier({
                name,
                location,
                contact,
            })
            newSupplier.save()
            .then(response=>{
                res.status(200).send({msg:"success",result:response})
            })
            
        }
    }

    async getAllSuppliers(req,res){
        Supplier.find({})
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }
    async deleteSuppliers(req,res){
        let {array} = req.body;
        if(!req.body.array){
            res.status(400).send("Data Missing")
        }else{
            array = array.map(item=>mongoose.Types.ObjectId(item))
            Supplier.deleteMany({_id: { $in: array}})
            .then(response=>{
                if(response.deletedCount===1){
                    res.status(200).send({msg:"success",result:"Deleted"})
                }else{
                    res.status(400).send("Not deleted")
                }
            })
        }
    }

}

const supplierController = new SupplierController();
module.exports=supplierController;