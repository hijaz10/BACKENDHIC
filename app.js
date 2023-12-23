// app.js
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const payproductroute = require('./routes/payproductroute');
const report = require('./routes/reportRoute');




const app = express();
const port = 2000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello, Welcome');
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO).then((done) => {
    console.log('DB connection was successful');

    // Set up routes
    app.use('/auth', authRoutes)
    app.use('/menu', menuRoutes)
    app.use("/payment",paymentRoutes)
    app.use("/pay",payproductroute)
    app.use("report",report)

    // Start the server
    app.listen(port, () => {
        console.log('Server is ready on port', port);
    });
}).catch((err) => {
    console.log(`An error occurred, hence the server was unable to start. ${err}`);
});
