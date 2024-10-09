const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config') 
const app = express();

// Middleware
app.use(bodyParser.json());

connectDB();

// Routes
const paymentRoute = require('./routes/payment');
const merchantRoute = require('./routes/merchant');
const apiKeyRoute = require('./routes/apiKey');

app.use('/api/payment', paymentRoute);
app.use('/api/merchant', merchantRoute);
app.use('/api/api-key', apiKeyRoute);

app.get('/', (req, res) => {
    res.send('Payment Gateway API');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

