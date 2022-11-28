const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



//middlewares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ebaxxgs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {


    const authHeader = req.headers.authorization;
    if (!authHeader) {

        return res.status(401).send({ message: 'unauthorized access' })


    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, docoded) {


        if (err) {

            return res.status(403).send({ message: 'Forbidden' })


        }

        req.decoded = docoded;
        next()



    })





}

async function run() {


    try {

        const userCollection = client.db("VINTAGE-RESALE-MARKET").collection("user");
        const productCollection = client.db("VINTAGE-RESALE-MARKET").collection("product");
        const categoryCollection = client.db("VINTAGE-RESALE-MARKET").collection("categorycollection");
        const bookinigCollection = client.db("VINTAGE-RESALE-MARKET").collection("booking");
        const paymentcollection = client.db("VINTAGE-RESALE-MARKET").collection("payment");
        const advertisecollection = client.db("VINTAGE-RESALE-MARKET").collection("advertise");



        app.post('/jwt', (req, res) => {

            const user = req.body;

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '6h' })
            res.send({ token })



        })



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

        app.post('/products', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await userCollection.findOne(query)

            if (user.role !== 'seller') {


                return res.status(403).send({ message: 'forbidden access' })

            }


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


        //advertise


        app.post('/advertise', async (req, res) => {

            const users = req.body
            const result = await advertisecollection.insertOne(users)
            res.send(result)




        })



        app.get('/allusers', async (req, res) => {

            const query = {}
            const cursor = userCollection.find(query)
            const users = await cursor.toArray();
            res.send(users)




        })

        //allProducts

        app.get('/allproducts', async (req, res) => {


            const query = {}
            const cursor = productCollection.find(query)
            const users = await cursor.toArray();
            res.send(users)




        })


        app.get('/usersByemail', verifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {

                res.status(403).send({ mesage: 'unauthorized access' })

            }

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


        app.get('/bookings', verifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {

                res.status(403).send({ mesage: 'unauthorized access' })

            }


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
        app.get('/product/:id', async (req, res) => {


            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const booking = await productCollection.findOne(query)
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
            const product = await productCollection.updateOne(filter, updatedDoc,)
            res.send(result)



        })


        app.delete('/deluser/:id', async (req, res) => {


            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)



        })








        app.delete('/delproduct/:id', async (req, res) => {


            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)



        })



        //verified


        app.put('/verify/:id', async (req, res) => {

            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {

                $set: {

                    status: 'verified'
                }


            }


            const seller = await userCollection.updateOne(filter, updatedDoc, options)

            res.send(seller)


        })





        app.put('/advertise/:id', verifyJWT, async (req, res) => {
            const decoded = req.decoded;

            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await userCollection.findOne(query)

            if (user.role !== 'seller') {


                return res.status(403).send({ message: 'forbidden access' })

            }

            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {

                $set: {


                    isadvertise: true
                }


            }

            const result = await productCollection.updateOne(filter, updatedDoc, options)

            return res.send(result)


        })




        //reported

        app.put('/reported/:id', async (req, res) => {

            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {

                $set: {


                    reported: true
                }


            }

            const result = await productCollection.updateOne(filter, updatedDoc, options)

            res.send(result)


        })





        app.put('/paid/:id', async (req, res) => {


            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {

                $set: {

                    status: 'sold'
                }


            }


            const product = await productCollection.updateOne(filter, updatedDoc, options)

            res.send(product)



        })




        //advrtise true


        // app.put('/advertise/:id', async (req, res) => {


        //     const id = req.params.id
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {

        //         $set: {

        //             status: 'sold'
        //         }


        //     }


        //     const product = await productCollection.updateOne(filter, updatedDoc, options)

        //     res.send(product)



        // })



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