const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 4000;


app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jmfga.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("productManufacturer").collection("product");
        const orderCollection = client.db("productManufacturer").collection("order");
        const reviewCollection = client.db("productManufacturer").collection("review");


        // Every Products 
        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray();
            console.log(products)
            res.send(products);
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product)
        })

        // Delete Product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // Post a Product 
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        // Every Orders 
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product)
            res.send(result)
        })

        app.get('/orders', async (req, res) => {
            const query = {}
            const cursor = orderCollection.find(query)
            const products = await cursor.toArray();
            res.send(products);
        })



        // Indivitual Email All Orders 
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query)
            const myProducts = await cursor.toArray();
            res.send(myProducts)
        })

        // Indivitual Email Single Order

        app.get('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await orderCollection.findOne(query);
            res.send(product)
        })


        // Delete an Order
        app.delete('/myorders/:id', async (req, res) => {
            // const email = req.query.email;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // const query = { email: email };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


        // Review 

        app.get('/review', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review);
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })



    } finally {
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Server is Running')
})

app.listen(port, () => {
    console.log("Server in running")
})