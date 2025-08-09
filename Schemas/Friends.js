const mongoose=require("mongoose")

const friendModule=mongoose.Schema({
    id:{type:String,required:true},
    friends:{type:[{id:{type:String,required:true},friendAt:{type:Date,default:new Date()}}],required:true,default:[]}
})

const friendSchema = mongoose.model('friends',friendModule)

module.exports=friendSchema