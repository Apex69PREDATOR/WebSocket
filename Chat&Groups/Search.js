const userModel = require("../Schemas/User")
const router = require("express").Router()


router.post('/search',async (req,res)=>{
    const {param}=req.body
    let users = []
    try{
    if(param.includes('@')){
      const user = await userModel.findOne({email:param})
    if(user)
      users.push(user)        
    }
    else if(/^\d+$/.test(param)){
      const user = await userModel.findOne({phone:param})
    if(user)
      users.push(user)        
    }
    else{
        const name = param.trim().split(' ')
         if(name.length === 1 ){
           users = await userModel.find({
            $or:[{fname:{$regex:name[0],$options:'i'}},{lname:{$regex:name[0],$options:'i'}}]
           }) 
         }
         else if(name.length>= 2){
            users = await userModel.find({
                $or:[{
                    $and:[{fname:{$regex:name[0],$options:'i'}},{lname:{$regex:name[1],$options:'i'}}]
                },
                {
                    $and:[{fname:{$regex:name[1],$options:'i'}},{lname:{$regex:name[0],$options:'i'}}]
                }
                ]
            }) 
         }
    }
    res.status(200).json({users})

    
}
catch(err){
    console.log(err);
    res.status(500).json({message:'cant find due to server failure'})
    
}
    

})
module.exports = router