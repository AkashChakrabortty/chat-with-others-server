const express = require("express");
const cors = require("cors");
const app = express();
//start
const http = require("http");
const { Server } = require("socket.io");
//end
require("dotenv").config();
const useragent = require("express-useragent");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

const socketServer = http.createServer(app);

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

//for cors policy
const io = new Server(socketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PATCH"],
  },
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

    //socket
    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });

      socket.on("send message", (data) => {
        console.log(data)
        if(data.sender !='admin@gmail.com'){
          data.to = "admin@gmail.com";
        }
        io.emit('messageTransfer',data)
      });
    });

  } catch {}
}
run().catch((err) => console.log(err));



app.get("/", (req, res) => {
  res.send("api found");
});
// app.listen(port, () => {
//   console.log("server running");
// });
socketServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//socket install
//  npm install socket.io 
