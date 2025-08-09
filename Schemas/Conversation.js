const mongoose=require("mongoose")

const conversation=mongoose.Schema({
    members:{type:[{type:mongoose.Schema.Types.ObjectId,ref:'allUser'}],required:true},
    lastMessage:{type:mongoose.Schema.Types.ObjectId,ref:'Message',default:null},
    updatedAt : {type:Date,required:true,default:Date.now}
})

conversation.pre("save",function(next){
  this.updatedAt = Date.now()
  next()
})
conversation.pre("findOneAndUpdate",function(next){
  this.updatedAt = Date.now()
  next()
})
conversation.pre("updateOne",function(next){
  this.updatedAt = Date.now()
  next()
})
conversation.pre("updateMany",function(next){
  this.updatedAt = Date.now()
  next()
})

const conversationModule = mongoose.model('Conversation',conversation)

module.exports=conversationModule