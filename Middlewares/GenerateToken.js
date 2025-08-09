const jwt = require("jsonwebtoken")
require('dotenv').config()

function generateToken(payload){
   
   const token= jwt.sign(payload,process.env.JWT_PRIVATE_KEY,{expiresIn:'10d'})
   return token   
}

module.exports = generateToken