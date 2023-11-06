require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000

// Middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wmyy1wk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}); 

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allProductsCollection = client.db('foodsDb').collection('food');
    const orderCollection = client.db('foodsDb').collection('order');

    // Services related Api 
    app.post('/api/v1/foods', async(req, res)=>{
        const data = req.body;
        console.log(data);
        const result = await allProductsCollection.insertOne(data)
        res.send(result)
    })
    //get All Products
    app.get('/api/v1/foods', async(req, res)=>{
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
        const result = await allProductsCollection.find({})
        .skip(page*size)
        .limit(size)
        .toArray();
        res.send(result)
    })
    // get Single Products by ID 
    app.get('/api/v1/foods/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await allProductsCollection.findOne(query)
      res.send(result)
    })

    app.post('/api/v1/orders', async(req, res)=>{
      const body = req.body;
      const result = await orderCollection.insertOne(body);
      res.send(result);
    })




    // Pagination API
    app.get('/api/v1/foodcount', async(req, res)=>{
      const count = await allProductsCollection.estimatedDocumentCount();
      res.send({count})
    })


 




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);













app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})