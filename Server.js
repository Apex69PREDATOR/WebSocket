const express=require("express")
const app=express()
const port = 8080
const portHttp=5000
const cors=require("cors")
const WebSocket=require("ws")
const connectCluster = require("./DbConnection")
const url = require("url")
const conversationModule  = require("./Schemas/Conversation")
const messageModule = require("./Schemas/Messages")
const clients = require("./SocketStore")
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use('/uploads',express.static(require("path").join(__dirname,'SendedFiles')))
app.use('/uploads',express.static(require("path").join(__dirname,'Uploads')))


connectCluster()

async function UpdateAndSendRecentChats(userId,ws){ 
     const latestConvos = await conversationModule.find({
        members:{$in:userId}
      }).sort({updatedAt: -1})

      const otherMembers = []
      const recentMessagesIds = []
      
      latestConvos.forEach(val=>{
        otherMembers.push({id:val.members.find(id=>(id.toString()!==userId)),updatedAt:val.updatedAt})

        recentMessagesIds.push(val.lastMessage)
    })

      const recentMessages = await messageModule.find({_id:{$in:recentMessagesIds}}).sort({sendAt:-1})
      
      ws.send(JSON.stringify({otherMembers,recentMessages,type:'recentChats'}))
}

const wss = new WebSocket.Server({port})

const statusRequests = new Map()

wss.on('connection',function connection(ws,req){
  try{
    const params = new URLSearchParams(url.parse(req.url).query)
    const userId = params.get('userId')

    if(!userId || userId === 'undefined'){
      console.log('connection closed');
      ws.close();
      return;
    }
    
    console.log(userId);
    
    clients.set(userId,ws)

    const previousRequests = statusRequests.get(userId)
    
    previousRequests?.forEach(id=>{
      const targetSocket = clients.get(id)
      if(targetSocket && targetSocket.readyState === WebSocket.OPEN){
        targetSocket.send(JSON.stringify({isOnline:true,type:'status',onlineId:userId}))
      }
    })

    console.log('client connected');
    
  ws.on('message',async function incomming(data){
    
    const content=JSON.parse(data.toString())
    if(content.type==='recentChats'){
       UpdateAndSendRecentChats(userId,ws)
      return
     }
     if(content?.type==='status'){
        
         const isOnline = clients.has(content?.id)
         
         //send messages from data base
         const conversation = await conversationModule.findOne({members:{$all:[userId,content?.id]}})

         const previousMessages = await messageModule.find({conversationId:conversation?._id})

          
         ws.send(JSON.stringify({isOnline,type:'status',previousMessages,onlineId:content.id}))
         console.log(isOnline);

         

         // check online requests
         const clientIdExists = statusRequests.has(content?.id)
         if(clientIdExists){
          const previous = statusRequests.get(content.id)
          if(!previous.includes(content?.requestFrom)){
              previous.push(content?.requestFrom)
              statusRequests.set(content.id,previous) 
          }
          
         }
         else{
           statusRequests.set(content?.id,[content?.requestFrom])
         }
         return
     }

     if(content.type === 'messageSeen'){
      console.log('message seen',content);
      
         const updatedSeenMessage = await messageModule.findByIdAndUpdate(content?.message,{
          seenBy:[userId]
         },{new:true})

        
        const targetSocket = clients.get(updatedSeenMessage.senderId.toString())
        if(targetSocket && targetSocket.readyState === WebSocket.OPEN){
          targetSocket.send(JSON.stringify({seenId:updatedSeenMessage._id,type:'seenId'}))
          console.log('sended message seen');
          
        }

        return
                 
     }

     if(content.type === 'sendMessage'){
     const targetSocket = clients.get(content?.to)
     const pathList  = []
     content?.files?.forEach(file=>{
      const data  = file.data.split(',')[1]
      const fileBuffer = Buffer.from(data,'base64')
      const fs = require("fs")
      const fileName = `${userId}-${Date.now()}-${file.name.replace(/\s+/g, '')}`
      const filePath = require('path').join(__dirname,`SendedFiles/${fileName}`)
      fs.writeFileSync(filePath,fileBuffer)
      console.log('saved file-->',filePath);
      pathList.push(fileName)
     })
      // store message permanently
      let newConv = await conversationModule.findOne({members:{$all:[userId,content?.to]}})
      if(!newConv){
      newConv = await new conversationModule({
        members:[userId,content.to],
            })
            await newConv.save()
      }
      const newMessage = await new messageModule({conversationId:newConv?._id,
        senderId:userId,
        text:content.message,
        isFile:content?.files?true:false,
        path:pathList.length>0?pathList:null
      })
      await newMessage.save()

      console.log(newMessage);
      
       
      const updatedConvo = await conversationModule.findOneAndUpdate({members:{$all:[userId,content?.to]}},{
        lastMessage:newMessage._id
      })
      await updatedConvo.save()
     
     if(targetSocket && targetSocket.readyState==WebSocket.OPEN){
      
      
      targetSocket.send(JSON.stringify({ from: userId, message: newMessage }));
       UpdateAndSendRecentChats(content?.to,targetSocket)

      }
     
      if(ws.readyState == WebSocket.OPEN){
      ws.send(JSON.stringify({ from: userId, message: newMessage }));
       UpdateAndSendRecentChats(userId,ws)
      }
      
       
     else {
      console.log(`User ${content.to} is not connected`);
    }
     
  }
  })
  ws.on('close', () => {

    const previousRequests = statusRequests.get(userId)
    
    previousRequests?.forEach(id=>{
      const targetSocket = clients.get(id)
      if(targetSocket && targetSocket.readyState === WebSocket.OPEN){
        targetSocket.send(JSON.stringify({isOnline:false,type:'status',onlineId:userId}))
      }
    })
    clients.delete(userId)
    console.log('Client disconnected');
  });
  ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
}
catch(err){
  ws.send('some error occurerd')
  console.log(err);
  
}
})

app.use('/auth',require('./Authorize/HandleAuth'))
app.use('/find',require('./Chat&Groups/Search'))
app.use('/beSocial',require('./Chat&Groups/AddFriend'))
app.use('/profile',require('./Authorize/EditProfile'))


app.listen(portHttp,()=>{
    console.log(`http://localhost:${portHttp}`);
    
})