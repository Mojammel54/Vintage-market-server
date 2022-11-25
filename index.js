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
        const productCollection = client.db("VINTAGE-RESALE-MARKET").collection("product");
        const categoryCollection = client.db("VINTAGE-RESALE-MARKET").collection("categorycollection");

        app.post('/users', async (req, res) => {


            const users = req.body
            const result = await userCollection.insertOne(users)
            res.send(result)




        })

        //addproducts

        app.post('/products', async (req, res) => {


            const users = req.body
            const result = await productCollection.insertOne(users)
            res.send(result)




        })

        app.get('/allusers', async (req, res) => {

            const query = {}
            const cursor = userCollection.find(query)
            const users = await cursor.toArray();
            res.send(users)




        })


        app.get('/usersByemail', async (req, res) => {



            let query = {}

            if (req.query.email) {

                query = {


                    email: req.query.email


                }



            }
            const cursor = userCollection.find(query)
            const users = await cursor.toArray();
            res.send(users)



        })


        //category wise


        app.get('/category', async (req, res) => {


            let query = {}

            if (req.query.category) {

                query = {


                    category: req.query.category



                }
            }


            const cursor = productCollection.find(query)
            const review = await cursor.sort({ date: -1 }).toArray();
            res.send(review)




        })



        //product by email


        app.get('/myproduct', async (req, res) => {


            let query = {}

            if (req.query.emal) {

                query = {


                    selleremail: req.query.email



                }
            }


            const cursor = productCollection.find(query)
            const review = await cursor.sort({ date: -1 }).toArray();
            res.send(review)




        })


        //specific item naoa

        app.get('/categoryname', async (req, res) => {

            const query = {}
            const result = await categoryCollection.find(query).toArray();
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