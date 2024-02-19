require('dotenv').config();
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const http = require('http');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const app = express();

//nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.TRANSPORTER_EMAIL_ACCOUNT,
    pass: process.env.TRANSPORTER_EMAIL_PASSWORD,
  }
});

//limiter options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

//only authorize POST from react
const corsOption= {
  //url of client, not gateway
  origin: process.env.CLIENT_URL_PROD,
  methods: 'POST, GET',
  optionsSuccessStatus: 204,
};

//usage of middlewares
app.use(cors(corsOption));
app.use(express.json());
app.use(helmet());
app.use(limiter)

//hide errors on prod
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
  }); 
}

//handle Contact me Form
app.post('/contact', (req, res) => {
  const formData= req.body;

  const mailOptions = {
    from: process.env.TRANSPORTER_EMAIL_ACCOUNT,
    to: process.env.EMAIL_ACCOUNT,
    subject: "New Form submission - massmr.xyz",
    html: `
      <p><strong>First Name:</strong> ${formData.firstName}</p>
      <p><strong>Last Name:</strong> ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Message:</strong> ${formData.message}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Form submitted successfully');
    }
  });
});

// Middleware for logging incoming requests
app.use((req, res, next) => {
  console.log(`Received a ${req.method} request to ${req.path}`);
  next(); // Pass control to the next middleware or route handler
});

// Route for handling GET requests
app.get('/contact', (req, res) => {
  res.send('Hello, this is a test endpoint!');
});

const PORT = process.env.PORT || 3000;
http
  .createServer(app)
  .listen(PORT, () => console.log(`listening on port ${PORT}`));
