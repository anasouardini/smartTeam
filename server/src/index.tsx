import express from 'express';
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const router = require('./router');

require('dotenv').config();
const PORT = process.env.PORT || 2000;

app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENTADDRESS],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.use('/', router);

app.use('*', (_, res) => {
  res.status(404).json({ data: 'nothing to see here' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ err: 'something went bad' });
});

app.listen(PORT, () => {
  console.log(`server is listening on port: ${PORT}`);
});
