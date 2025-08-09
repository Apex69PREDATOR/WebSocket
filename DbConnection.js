
const mongoose = require('mongoose');
const db_password = encodeURIComponent('wdDAhKq4LM55Exis')
const db_name='AIchat'
const uri = `mongodb+srv://arpana036:${db_password}@apex.2k0me.mongodb.net/${db_name}?retryWrites=true&w=majority&appName=apex`;

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
