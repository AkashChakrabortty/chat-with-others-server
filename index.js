const express = require("express");
const cors = require("cors");
require("dotenv").config();
const useragent = require("express-useragent");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
app.use(useragent.express());

// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const deviceInfoCollection = client
      .db("chat-with-others")
      .collection("deviceInfo");
    try{

         

    }

    catch{

    }
}
run().catch(err => console.log(err))

app.get("/", (req, res) => {
  res.send("api found");
});
app.listen(port, () => {
  console.log("server running");
});