require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wmyy1wk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allProductsCollection = client.db("foodsDb").collection("food");
    const orderCollection = client.db("foodsDb").collection("order");
    const userCollection = client.db("foodsDb").collection("user");

    // Services related Api
    app.post("/api/v1/foods", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await allProductsCollection.insertOne(data);
      res.send(result);
    });
    //get All Products
    app.get("/api/v1/foods", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await allProductsCollection
        .find({})
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });






    // get Single Products by ID
    app.get("/api/v1/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProductsCollection.findOne(query);
      res.send(result);
    });
    app.put("/api/v1/foods/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedData = req.body;
      const updateDoc = {
        $set: updatedData, // Remove the quotes around updatedData
      };
    
      const result = await allProductsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    





    app.post("/api/v1/orders", async (req, res) => {
      const body = req.body;
      const result = await orderCollection.insertOne(body);
      res.send(result);
    });

    // My Orders
    app.get("/api/v1/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const result = await orderCollection.find(query).toArray()
      res.send(result);
    });
    app.delete("/api/v1/orders/:id", async(req, res)=>{
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)}
      const result = orderCollection.deleteOne(query)
      res.send(result)
    })




    // My ALl added products 
    app.get("/api/v1/products/:email", async(req, res)=>{
      const email = req.params.email;
      const query = { authEmail: email };
      const result = await allProductsCollection.find(query).toArray()
      res.send(result)
    })



    // Pagination API
    app.get("/api/v1/foodcount", async (req, res) => {
      const count = await allProductsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // User Related API
    app.post("/api/v1/users", async (req, res) => {
      const body = req.body;
      const result = await userCollection.insertOne(body);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
