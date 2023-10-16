// in controllers/user.js
// On utilise dotenv pour masquer dans des variables d'environnement les infos sensibles !
require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = process.env.BCRYPT_SALT;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, saltRounds)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }

      bcrypt
        .compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }

          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userID: user._id }, 'RANDOM_TOKEN_SECRET', {
              expiresIn: '4h',
            }),
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
