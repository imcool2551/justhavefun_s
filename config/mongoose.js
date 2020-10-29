const mongoose = require('mongoose');
const _ = require('./credentials');

module.exports = () => {
  mongoose.connect(
    `mongodb+srv://${_.mongoId}:${_.mongoPassword}@${_.mongoUrl}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  );
  mongoose.connection.once('open', () => console.log('Connected to MongoDB'));
};
