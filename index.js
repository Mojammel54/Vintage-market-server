const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000;

require('dotenv').config();
//middlewares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ebaxxgs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {


    try {

        const userCollection = client.db("VINTAGE-RESALE-MARKET").collection("user");

        app.post('/users', async (req, res) => {


            const users = req.body
            const result = await userCollection.insertOne(users)
            res.send(result)




        })


    }

    finally {



    }



}
run().catch(err => {

    console.log(err)


})










app.get('/', (req, res) => {

    res.send('server is running')


})

app.listen(port, () => {

    console.log(`port is running on${port}`)


})