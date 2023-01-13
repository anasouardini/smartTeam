const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const PORT = process.env.PORT || 2000;

app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENT_ADDRESS],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.use('/', require('./router'));

app.use('*', (_, res) => {
  res.status(404).json({ data: 'nothing to see here' });
});

app.use((err, req, res, next) => {
  console.log('================================ error handler route')
  console.log(err)
  // console.error(err.stack);

  // rare case
  if (res.headerSent) {
    return next(err);
  }

  res.status(500).json({ err: 'something went bad in the server' });
});

app.listen(PORT, () => {
  console.log(`server is listening on port: ${PORT}`);
});
