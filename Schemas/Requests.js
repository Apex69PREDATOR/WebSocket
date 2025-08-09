const mongoose=require("mongoose")

const requestModule=mongoose.Schema({
    id:{type:String,required:true},
    requests:{type:[{id:{type:String,required:true},requestAt:{type:Date,default:new Date()}}],required:true,default:[]}
})

const requestSchema = mongoose.model('requests',requestModule)

module.exports=requestSchema