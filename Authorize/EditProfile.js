const route = require("express").Router()
const userModel = require("../Schemas/User")
const EditModel = require("../Schemas/LastEdited")
const storageEngine = require("../Middlewares/Upload")
const verifyToken = require("../Middlewares/VerifyToken")
const fs = require("fs")
require('dotenv').config()
route.post('/editProfile',verifyToken,storageEngine.single("profilePic"),async(req,res)=>{
  try{
    
  const editedObj = {}

  if(req.file){
    editedObj.profilePic = process.env.SELF_DOMAIN + '/uploads/profile/' + req.file.filename
  }
  Object.keys(req.body).forEach((key)=>{
    const value = req.body[key]
     switch (key) {
    case 'eAbout':
      editedObj.about = value
      break;
    case 'eMail':
      editedObj.email = value
      break;
    case 'eNumber':
      editedObj.phone = value
      break;
    case 'eLname':
      editedObj.lname = value
      break;
    case 'eFname':
      editedObj.fname = value
      break;
  
    default:
      break;
  }
  })
  
  
  let editDate = await EditModel.findOne({uId:req?.user?._id})
  if(editDate){
    let optional=''
    if(!checkGap(editDate.editedDate)){

      if(Object.keys(editedObj).includes('profilePic')){

    const updatedPhoto = await userModel.findByIdAndUpdate(req?.user?._id,{profilePic:editedObj.profilePic})
    
    const oldFileName = updatedPhoto?.profilePic?.split('/')[5]
    const oldPath = require("path").join(__dirname,`../Uploads/profile/${oldFileName}`)
    
   oldPath && fs.unlink(oldPath,(err)=>{
         if(err)
          console.log('file dosent exists');
        
    })

    if(updatedPhoto){
      optional = 'Only Profile Photo updated successfully. '

      if(Object.keys(editedObj).length==1)
        return res.status(200).json({success:true,message:`${optional}`})
    }
    
  }
     const displayDate = new Date(editDate.editedDate)
      return res.status(401).json({message:`${optional}Please wait 30 days after the last edit to update fields other than profile picture (${displayDate.getDate() + '-' + (displayDate.getMonth()+1) + '-' + displayDate.getFullYear()})`})
    }
    await EditModel.findOneAndUpdate({uId:req?.user?._id},{editedDate:Date.now()})
  }
  else{
   const newEdit =  await new EditModel({uId:req?.user?._id,editedDate:Date.now()})
   await newEdit.save()
  }
  const updatedUser = await userModel.findByIdAndUpdate(req?.user?._id,editedObj,{new:true})

  if(updatedUser)
    return res.status(200).json({success:true,message:'account edited successfully. You can edit again after 30 days'})

  return res.status(401).json({message:'there was a problem editing your account, try again later'})

}
catch(err){
  console.log(err);
      return res.status(500).json({message:'try again later!'})
}

})

function checkGap(lastEdited){
const date2=Date.now()
const dateGap=(date2-lastEdited)/(1000*60*60*24)
if(dateGap.toFixed(2)<=30)
  return false
return true
}

module.exports=route