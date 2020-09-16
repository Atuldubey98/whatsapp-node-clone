//importing all things
import express from "express";
import mongoose from "mongoose"
import Messages from "./dbmessages.js"
import Pusher from "pusher"
import cors from "cors"
// app config
const app = express();
const port = process.env.PORT || 9000
//middleware
// database


const pusher = new Pusher({
    appId: '1073368',
    key: '1aada4a68b6d0e8b923d',
    secret: '5cf497c9745736fbb07a',
    cluster: 'ap2',
    encrypted: true
  });
app.use(cors())
const db = mongoose.connection

db.once("open", ()=>{
    console.log("Db is connected")
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch()
    changeStream.on("change", (change)=>{
        console.log(`Chnage occcured`, change)
        if (change.operationType ==="insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name: messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received: messageDetails.received
            })
        }else{
            console.log("Error Occured")
        }
    })
})
const connectionurl = "mongodb+srv://atuldubey:0OscDsTqvpGjqp5g@cluster0.rmr7i.mongodb.net/whatsappdb?retryWrites=true&w=majority"
app.use(express.json());
mongoose.connect(connectionurl, {
    useCreateIndex : true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
// api routes

app.get("/", (req, res)=> res.status(200).send("Hello whatsapp"))
//mongodb

app.get("/api/v1/messages/sync" , (req, res)=>{
    Messages.find((err, data)=>{
        if (err) {
            res.status(500).send(err);
        }else{
            res.status(200).send(data)
        }
    })
})

app.post("/api/v1/messages/new", (req, res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data)=>{
        if (err) {
            res.status(500).send(err)

        }else{
            res.status(201).send(data)

        }
    })
    
})
//api routes

app.listen(port, ()=>console.log(`Listening on local host : ${port}`));

