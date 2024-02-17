require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

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
  origin: process.env.CLIENT_URL_DEV,
  methods: 'POST',
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
