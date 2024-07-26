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
const membersRoute = require('./route/members');
const refreshRoute = require('./route/refreshToken');
const openRoute = require('./route/openRoute');
const activitiesRoute = require('./route/activities');
const attendanceRoute = require('./route/attendance');
const swaggerUI = require('swagger-ui-express');

const app = express();

//Error handler
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/error-handler');
const swaggerSpec = require('./docs/swagger');

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
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));


//Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/refresh', refreshRoute);
app.use('/api/v1/department', auth, departmentRoute);
app.use('/api/v1/member', auth, membersRoute);
app.use('/api/v1/activities', auth, activitiesRoute);
app.use('/api/v1/attendance', auth, attendanceRoute);
app.use('/api/v1/open', openRoute);
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
    // swaggerDocs(app, port);
  } catch (error) {
    console.log(error);
  }
};

start();
