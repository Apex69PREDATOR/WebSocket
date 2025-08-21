const route = require("express").Router()
const userModel = require("../Schemas/User")
const EditModel = require("../Schemas/LastEdited")
const storageEngine = require("../Middlewares/Upload")
const verifyToken = require("../Middlewares/VerifyToken")
route.post('/editProfile',verifyToken,storageEngine.single("profilePic"),async(req,res)=>{
  console.log(req.body);
  console.log(req.file);
  
  const editedObj = {}

  
})

module.exports=route