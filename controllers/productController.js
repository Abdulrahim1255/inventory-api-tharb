const mongoose = require('mongoose')
const Product = require("../models/Product")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const _ = require("lodash")
class ProductController{
    async getProduct (req,res){
        res.send("home routre user")
    }

    async createProduct(req,res){
        const {name,companyName,type,unit}=req.body;
        if(!name || !companyName || !type || !unit){
            res.status(400).send("Data Missing")
        }else{
            //console.log(_.difference(['223','23','3'],['223','23','s']))
            Product.find({companyName},{name})
            .then(response=>{
                if(response){
                    Product.updateOne({name},{companyName},{$push:{type,unit,companyName}})
                    .then(updateResponse=>{
                        if(updateResponse.modifiedCount>0){
                            res.status(200).send({msg:"success",result:'Updated'})
                        }else{
                            res.status(400).send("Bad Request")
                        }
                        
                    })
                }
                else{
                    const newProduct = new Product({
                        name,
                        companyName,
                        type,
                        unit
                    })
                    newProduct.save()
                    .then(newProdResponse=>{
                        res.status(200).send({msg:"success",result:newProdResponse})
                    })
                }
            })
            
            
        }
    }

    async getAllProducts(req,res){
        Product.find({})
        .then(response=>{
            res.status(200).send({msg:"success",result:response})
        })
    }

    async getAllProductType(req,res){
            Product.aggregate([
                {$unwind:'$type'}
            ])
            .then(response=>{
                res.status(200).send({msg:"success",result:response})
            })
    }

    async deleteProduct(req,res){
        let {array} = req.body;
        if(!req.body.array){
            res.status(400).send("Data Missing")
        }else{
            array = array.map(item=>mongoose.Types.ObjectId(item))
            Product.deleteMany({_id: { $in: array}})
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

const productController = new ProductController();
module.exports=productController;