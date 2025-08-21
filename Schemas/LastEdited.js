const mongoose = require("mongoose")

const EditDate = mongoose.Schema({
    uId:{type:mongoose.Schema.Types.ObjectId,ref:'allUser'},
    editedDate:{type:Date,default:Date.now()}
})

const EditModel = mongoose.model('EditDate',EditDate)

module.exports = EditModel