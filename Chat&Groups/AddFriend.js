const requestModule = require("../Schemas/Requests")
const friendModule = require("../Schemas/Friends")
const router  = require("express").Router()
const userModel = require("../Schemas/User")
const verifyToken = require("../Middlewares/VerifyToken")
const clients = require("../SocketStore")


async function sendImmediateRequests(senderId,targetSocket,type){
    const requestedUser = await userModel.findById(senderId)
        const requestedUserObj = requestedUser.toObject()

        delete requestedUserObj.password
        
        if(targetSocket && targetSocket.readyState == WebSocket.OPEN){
          targetSocket?.send(JSON.stringify({type,requestedUserObj}))
          console.log('sended');
          
        }
}

router.post('/add',verifyToken,async (req,res)=>{
  try{
    const {receiverId,senderId} = req.body
    const Friends = await friendModule.findOne({id:receiverId})
    
    if(Friends?.friends?.find(friend=>(friend?.id==senderId))){
      return res.status(404).json({message:'user is already your friend'})
    }
    
     const targetSocket = clients.get(receiverId)
    const newRequest = {id:senderId,requestAt:new Date()}
    const requestDoc = await requestModule.findOne({id:receiverId})
    if(!requestDoc){
        const requestDoc = await new requestModule({
            id:receiverId,
            requests:[newRequest]
        })
        await requestDoc.save()
        res.status(200).json({success:true,message:'requested'})
        sendImmediateRequests(senderId,targetSocket,'incommingRequests')
    }
    else{
      const requestArr = requestDoc.requests
      if(requestArr.length===0){
        const requestDoc = await requestModule.findOneAndUpdate({id:receiverId},{
            $push:{requests:newRequest},
        },{new:true})


        sendImmediateRequests(senderId,targetSocket,'incommingRequests')
       

        res.status(200).json({success:true,message:'requested'})
        return
      }
      
      const ifExists = requestArr.find(r=> r.id === senderId)
      if(!ifExists){
        const requestDoc = await requestModule.findOneAndUpdate({id:receiverId},{
            $push:{requests:newRequest}
        })
        
        res.status(200).json({success:true,message:'requested'})
        
        sendImmediateRequests(senderId,targetSocket,'incommingRequests')
        
      }
      else{
        res.status(401).json({message:'already has pending request from you'})
        
      }
      
    }
  }
  catch(err){
    console.log(err);
    
    res.status(500).json({message:'try again later'})
  }
    

})

router.get('/pending/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    

    const pendingRequests = await requestModule?.findOne({ id: userId });
    
    const requestsIds =  pendingRequests?.requests?.map(val=>{return val.id})
    const allUserDetails =  await userModel?.find({_id:{$in:requestsIds}})
    const sendUserDetails = allUserDetails?.map(val=>{
       const updatedUser = val.toObject()
       delete updatedUser?.password
       return updatedUser
    })
     const friends = await friendModule?.findOne({ id: userId });
    
    const friendsIds =  friends?.friends?.map(val=>{return val.id})
    const allFriendDetails =  await userModel.find({_id:{$in:friendsIds}})
    const sendFriendDetails = allFriendDetails?.map(val=>{
       const updatedUser = val.toObject()
       delete updatedUser?.password
       return updatedUser
    })
      
    res.status(200).json({ success: true, requests: sendUserDetails , friends: sendFriendDetails});

  } catch (error) {
    console.error(error);
  }
})
router.get('/viewProfile/:profileId/:userId',verifyToken,async (req,res)=>{
  const profileId= req.params.profileId
  const userId = req.params.userId
  console.log(req.params);
  
  const profileFriends = await friendModule.findOne({id:profileId}).select('friends')
  console.log(profileFriends);
  
  const onlyFriends = profileFriends.friends.map(val=>(val.id)) 
  
  const profileFriendsDetails = await userModel.find({_id:{$in:onlyFriends}}).select('email profilePic fname lname about')

  const isFriend=onlyFriends.includes(userId)
  
  const profileDetails = await userModel.findById(profileId).select(`-password${isFriend?'':' -phone'}`)

  console.log(profileDetails,profileFriendsDetails);
  
  res.status(200).json({success:true,profileDetails,profileFriendsDetails,isFriend})
  

})
router.post('/accept',verifyToken,async(req,res)=>{
  try{
    
  const {selfId,acceptId} = req.body
  
  const targetSocket = clients.get(acceptId)
  const newFriend = {
    id:acceptId,
    friendAt : new Date()
  }
  const newFriendAtSender =  {
    id : selfId,
    friendAt : new Date() 
  }
  const checkFriend = await friendModule.findOne({id:selfId})
  const checkFriendSender = await friendModule.findOne({id:acceptId})

  if(!checkFriendSender){
    const addedFriendSender = await new friendModule({
      id:acceptId,
      friends:[newFriendAtSender]
    })
    await addedFriendSender.save()
  }
  else{
     const addedFriendSender = await friendModule.findOneAndUpdate({
      id:acceptId},
      {$push:{friends:newFriendAtSender}
    })

    if(!addedFriendSender){
      return res.status(401).json({message:"cant find the request sender's account login again"})
    }
        sendImmediateRequests(selfId,targetSocket,'newFriend')
  }

  if(!checkFriend){
    const addedFriend = await new friendModule({
      id:selfId,
      friends:[newFriend]
    })
    await addedFriend.save()
    await requestModule.findOneAndUpdate({id:selfId},{$pull:{requests:{id:acceptId}}})
    
    return res.status(200).json({success:true,message:'new friend added'})
  }
   const addedFriend = await friendModule.findOneAndUpdate({
      id:selfId},
      {$push:{friends:newFriend}
    })
    if(addedFriend){
      await requestModule.findOneAndUpdate({id:selfId},{$pull:{requests:{id:acceptId}}})
    return res.status(200).json({success:true,message:'new friend added'})
    }
    else{
      return res.status(401).json({message:'cant find your account login again'})
    }
  }
  catch(err){
    console.log(err);
    
    return res.status(500).json({message:'server error'})
  }
})

router.post('/decline',verifyToken,async (req,res)=>{

  try{

  const {selfId,deletedId} = req.body
   
  const updatedDoc = await requestModule.findOneAndUpdate({id:selfId},{$pull:{
    requests:{id:deletedId}
  }},{new:true})
 
  
  if(!updatedDoc)
    return res.status(404).json({message:'user not found'})

  return res.status(200).json({success:true,message:'Request removed successfully!'})

  }
  
  catch(err){
    console.log(err);
    return res.status(500).json({message:"some server error occured. Don't worry the developer team will fix this issue"})
  }

})

module.exports=router