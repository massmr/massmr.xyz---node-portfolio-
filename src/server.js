require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const corsOption= {
  origin: 'http://localhost:5173',
  methods: 'POST',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(helmet());
app.use(limiter)

if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
  }); 
}
app.post('/contact', (req, res) => {
  console.log(req.body);
  res.send('received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
