const mongoose=require("mongoose")

const message=mongoose.Schema({
   conversationId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Conversation'},
   senderId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'allUser'},
   text:{type:String},
   seenBy:{type:[mongoose.Schema.Types.ObjectId],required:true,ref:'allUser',default:[null]},
   isFile:{type:Boolean,default:false},
   sendAt:{type:Date,default:Date.now,required:true},
   path:String
})

message.pre('save',function(next){
    this.sendAt = Date.now()
    next()
})


const messageModule = mongoose.model('Message',message)

module.exports=messageModule