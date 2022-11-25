const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express()
const port = process.env.PORT || 5000;



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
        const bookinigCollection = client.db("VINTAGE-RESALE-MARKET").collection("booking");
        const paymentcollection = client.db("VINTAGE-RESALE-MARKET").collection("payment");

        app.post('/users', async (req, res) => {


            const users = req.body
            const result = await userCollection.insertOne(users)
            res.send(result)




        })

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

        //add bookings


        app.post('/booking', async (req, res) => {

            const users = req.body
            const result = await bookinigCollection.insertOne(users)
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




        app.get('/myproduct', async (req, res) => {


            let query = {}

            if (req.query.email) {

                query = {


                    sellerEmail: req.query.email



                }
            }


            const cursor = productCollection.find(query)
            const review = await cursor.sort({ date: -1 }).toArray();
            res.send(review)




        })

        //bookings


        app.get('/bookings', async (req, res) => {



            // console.log('token inside jwt', req.headers.authorization)
            const email = req.query.email;
            const query = { email: email };
            const booking = await bookinigCollection.find(query).toArray()
            res.send(booking)


        })


        //specific item naoa

        app.get('/categoryname', async (req, res) => {

            const query = {}
            const result = await categoryCollection.find(query).toArray();
            res.send(result)





        })


        //sellers

        app.get('/sellers', async (req, res) => {




            const role = req.query.role;
            const query = {
                role: role
            };
            const booking = await userCollection.find(query).toArray()
            res.send(booking)


        })


        //payment id

        app.get('/bookings/:id', async (req, res) => {


            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const booking = await bookinigCollection.findOne(query)
            res.send(booking)


        })

        //payment


        app.post('/create-payment-intent', async (req, res) => {

            const payment = req.body;

            const price = payment.productprice;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({

                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ],


            })

            res.send({
                clientSecret: paymentIntent.client_secret,
            });



        })


        app.post('/payments', async (req, res) => {

            const payment = req.body
            const result = await paymentcollection.insertOne(payment)
            const id = payment.payId;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {

                $set: {

                    paid: true,
                    transectionId: payment.transectionId


                }


            }

            const updatedReslut = await bookinigCollection.updateOne(filter, updatedDoc)
            const updatestatus = await productCollection.updateOne(filter, updatedDoc)
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