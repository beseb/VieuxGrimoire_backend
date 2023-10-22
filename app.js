const express = require('express');

// On utilise dotenv pour masquer dans des variables d'environnement les infos sensibles !
require('dotenv').config();

const path = require('path');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
// Pour parser les requetes en json !!!!
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const host = process.env.MONGODB_HOST;
const database = process.env.MONGODB_DATABASE;

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// parse les application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
// Anti-CORS errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;
