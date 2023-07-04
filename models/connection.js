const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://emiliebenistandpro:h1OqVkHZWg5cxYr1@cluster0.e4is5oz.mongodb.net/transport';

// CONNECTION_STRING = 'mongodb+srv://emiliebenistandpro:h1OqVkHZWg5cxYr1@cluster0.e4is5oz.mongodb.net/transport'

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));