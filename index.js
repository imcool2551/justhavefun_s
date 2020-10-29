const express = require('express');
const app = express();
const cors = require('cors');
const flash = require('connect-flash');
const argv = require('minimist')(process.argv.slice(2));

// Express Setup
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

// Session with Redis Store
const redis = require('redis');
const session = require('express-session');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'SEC!@#$%!vrwvr4352&*()RET',
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: 'strict',
    },
  })
);

// Mongoose Setup
require('./config/mongoose')();

// Passport Setup
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Upgrade Express to GraphQL server
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// Routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Error Handler
app.use(function (err, req, res, next) {
  console.log(err);
});

const PORT = argv.port || 5000;
const NAME = argv.name || 'Server';

app.get('/api', (req, res) => {
  res.end(`${NAME} open on port ${PORT}`);
})

app.listen(PORT, () => {
  console.log(`${NAME} open on port ${PORT}`);
});
