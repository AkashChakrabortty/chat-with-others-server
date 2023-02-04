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
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const deviceInfoCollection = client
    .db("chat-with-others")
    .collection("deviceInfo");
  try {
    //store all customer device info
    app.post("/storeDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email,
      };
      const numberOfDevice = (await deviceInfoCollection.find(query).toArray())
        .length;
      if (numberOfDevice <= 2) {
        const ua = req.useragent;
        const datetime = new Date();
        const deviceInfo = {
          email: email,
          browser: ua.browser,
          os: ua.os,
          date: datetime.toISOString().slice(0, 10),
        };
        const result = deviceInfoCollection.insertOne(deviceInfo);
        res.send(result);
      } else {
        res.send(false);
      }
    });

    //get single customer device info
    app.get("/getDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await deviceInfoCollection.find(query).toArray();
      res.send(result);
    });

    //Delete single customer device info
    app.delete("/deleteDeviceInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await deviceInfoCollection.deleteOne(query);
      res.send(result);
    });
  } catch {}
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("api found");
});
app.listen(port, () => {
  console.log("server running");
});
