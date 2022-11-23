const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000;

require('dotenv').config();
//middlewares
app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {

    res.send('server is running')


})

app.listen(port, () => {

    console.log(`port is running on${port}`)


})