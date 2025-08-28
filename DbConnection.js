require('dotenv').config()
const mongoose = require('mongoose');
const db_password = encodeURIComponent(process.env.CLUSTER_PASSWORD)
const db_name='AIchat'
const uri = `mongodb+srv://${process.env.CLUSTER_OWNER}:${db_password}@${process.env.CLUSTER_ADDRESS}/${db_name}?retryWrites=true&w=majority&appName=${process.env.CLUSTER_NAME}`;


const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectCluster() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err) {
    console.log(err);
    
    await mongoose.disconnect();
  }
}

module.exports=connectCluster
