const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      if(file.fieldname==='others'){
      const dest=path.join(__dirname,'Uploads/others')
      cb(null,dest)
      }
      else if(file.fieldname==='profile'){
        const dest=path.join(__dirname,'Uploads/profile')
        cb(null,dest)
      }

    },
    filename:(req,file,cb)=>{
        const filename = file.originalname + '_' + file.fieldname + "_" + Date.now() 
        cb(null,filename)
    }
})

const storageEngine = multer({storage})

module.exports =storageEngine