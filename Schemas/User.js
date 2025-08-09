const mongoose=require("mongoose")

const userModule=mongoose.Schema({
    fname:{required:true,type:String},
    lname:{required:true,type:String},
    email:{required:true,type:String,unique:true},
    phone:{required:true,type:String,unique:true},
    password:{required:true,type:String},
    profilepic:{type:String}
})

const userSchema = mongoose.model('allUser',userModule)

module.exports=userSchema