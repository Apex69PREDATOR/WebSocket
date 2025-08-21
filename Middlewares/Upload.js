const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      if(file.fieldname==='others'){
      const dest=path.join(__dirname,'Uploads/others')
      cb(null,dest)
      }
      else if(file.fieldname==='profilePic'){
        const dest=path.join(__dirname,'../Uploads/profile')
        cb(null,dest)
        console.log('file uploaded');
        
      }

    },
    filename:(req,file,cb)=>{
        const filename = file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s+/g, '') 
        cb(null,filename)
    }
})

const storageEngine = multer({storage})

module.exports =storageEngine