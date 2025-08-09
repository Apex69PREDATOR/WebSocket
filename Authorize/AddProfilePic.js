const userSchema = require("../Schemas/User")
const router = require("express").Router()
const verifyToken = require("../Middlewares/VerifyToken")
const storageEngine = require("../Middlewares/Upload")

router.post("/changeDp",verifyToken,storageEngine.fields([{name:'Profile',maxCount:1}]),async (req,res)=>{
    try{
     const {uid} = req.body
     const ProfilePath = req.files['Profile'][0].path
     console.log(ProfilePath);

     const updatedProfile = await userSchema.findByIdAndUpdate(uid,{
        profilepic:ProfilePath
     })

     if(updatedProfile)
        res.status(200).json({sucess:true,message:'changed profile photo'})
     else
        throw Error
    }
    catch(err){
        res.status(500).json({message:'cant process your request now'})
        console.log(err);
    }
     
})

module.exports = router