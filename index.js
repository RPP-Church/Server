require('dotenv').config();
require('express-async-errors');
const connectDb = require('./Db/connect');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/authentication');
const Whitelist = require('./middleware/whitelist');
const authRoute = require('./route/auth');
const departmentRoute = require('./route/department');
const userRoute = require('./route/user');
const refreshRoute = require('./route/refreshToken');

const app = express();

//Error handler
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/error-handler');

const corsOptions = {
  origin: (origin, callback) => {
    if (Whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});


const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use(express.json());

//Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/refresh', refreshRoute);
app.use('/api/v1/department', auth, departmentRoute);
app.use('/api/v1/user', auth, userRoute);

//Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
