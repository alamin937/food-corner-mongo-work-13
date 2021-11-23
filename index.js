const express = require('express')
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const fileUpload = require('express-fileupload');
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())


app.get('/', (req,res) =>{
    res.send('hello world')

})


var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.bzphb.mongodb.net:27017,cluster0-shard-00-01.bzphb.mongodb.net:27017,cluster0-shard-00-02.bzphb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-rs3vfq-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });





async function run() {
    try {
      await client.connect();
      const database = client.db("Food_Corner");
      const foodCollection = database.collection("Foods");
      const userCollection = database.collection("Users")
      const orderCollection = database.collection("PlaceOrder")

    //   food get api
    app.get('/foods', async(req,res) =>{
        const cursor = foodCollection.find({})
        const result = await cursor.toArray()
        res.send(result)
    })

    // foods post
    app.post('/foods', async(req,res) =>{
        const foodName = req.body.foodName;
        const price = req.body.price;
        const description = req.body.description
        const img = req.files.img;
        const picData = img.data;
        const encodePic = picData.toString('base64')
        const picBuffer = Buffer.from(encodePic, 'base64');
        const image = {
            foodName,
            price,
            description,
            img: picBuffer
        }
        const result = await foodCollection.insertOne(image)
        res.json(result)
    })

    // find one api
    app.get('/foods/:id', async(req,res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await foodCollection.findOne(query)
        res.send(result)
    })

    // users collection
    app.post('/users', async(req,res) =>{
        const user = req.body
        const result = await userCollection.insertOne(user)
        console.log(req.body)
        console.log(result)
        res.json(result);
    })

    // role add
    app.put('/users/admin', async(req,res) =>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set: {role: 'admin'}}
        const result = await userCollection.updateOne(filter,updateDoc)
        res.json(result)
    })

    // get admin
    app.get('/users/:email', async(req,res) =>{
        const email = req.params.email;
        const query = {email: email}
        const user = await userCollection.findOne(query)
        let isAdmin = (false)
        if(user?.role === 'admin')
        {
            isAdmin = true
        }
        res.json({admin: isAdmin})
    })

    // place order api
    app.post('/placeorder', async(req,res) =>{
        const placeorder = req.body;
        const result = await orderCollection.insertOne(placeorder)
        console.log(req.body)
        console.log(result)
        res.json(result)
    })
    // get all api placeorder
    app.get('/placeorder', async(req,res) =>{
        const cursor = orderCollection.find({})
        const result = await cursor.toArray()
        res.send(result)
    })

    // filter login user email
    app.get('/placeorder/:email', async(req,res) =>{
        const email = req.params.email;
        const query = {email : email}
        const cursor =  orderCollection.find(query)
        const result = await cursor.toArray({ })
        res.send(result)
    })

    // delete order
    app.delete('/placeorder/:id', async(req,res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)}
            const result = await orderCollection.deleteOne(query)
            res.json(result);
    })



      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);





















app.listen(port, () =>{
    console.log('running port', port)
})