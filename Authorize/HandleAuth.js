const router=require("express").Router()
const bcrypt = require("bcrypt")
const userSchema=require("../Schemas/User")
const generateToken = require("../Middlewares/GenerateToken")
const verifyToken = require("../Middlewares/VerifyToken")
router.post('/login',async(req,res)=>{
    try{
    const {email,password}=req.body
    const availableUser =  email.includes('@')?await userSchema.findOne({email}):await userSchema.findOne({phone:email})
    if(availableUser){
       const match = await bcrypt.compare(password,availableUser?.password)
       if(match){
        let payload=availableUser.toObject()
        delete payload.password
        
        const token = generateToken(payload)
       return res.status(200).json({success:true,userDih:payload,token,message:'login done successfully'})
       }
       else{
       return res.status(403).json({message:'wrong password'})
       }
    }
    
      return  res.status(403).json({message:'not authorized'})
}
catch(err){
    console.log(err);
    
    res.status(500).json({message:'server faced some error try again latter'})
}
})

router.post('/signup',async(req,res)=>{
     try {
        const { fname, lname, email, phone, password, cpassword } = req.body;

        // Basic validation
        if (!fname || !lname || !email || !phone || !password || !cpassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== cpassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await userSchema.findOne({ 
            $or: [ { email }, { phone } ] 
        });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userSchema({
            fname,
            lname,
            email,
            phone,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
         const payload=savedUser.toObject()
        delete payload.password

        const token = generateToken(payload);

        res.status(201).json({ success: true, token ,message:'done signing in'});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error, try again later' });
    }

})
router.get('/validate',verifyToken,(req,res)=>{
    
    res.status(200).json({userDih:req.user,success:true})
})

module.exports=router