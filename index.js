const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jmfga.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("productManufacturer").collection("product");
        const orderCollection = client.db("productManufacturer").collection("order");
        const reviewCollection = client.db("productManufacturer").collection("review");
        const userCollection = client.db("productManufacturer").collection("user");


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        });

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
        app.get('/myorders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                // const email = req.query.email;
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const myProducts = await cursor.toArray();
                res.send(myProducts)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }
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
            res.send(review.reverse());
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