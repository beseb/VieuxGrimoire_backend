// in controllers/book.js
require('mongoose');
const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');
const book = require('../models/book');

// Enregistrer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  console.log(bookObject);

  // Utilisation de sharp pour compresser l'image
  const filename = req.file.filename;
  const newFilename = `compressed_${filename}`;
  sharp(req.file.path)
    .resize(200) // Redimensionner l'image
    .jpeg({ quality: 80 }) // Compresser l'image en jpeg avec une qualité de 80
    .toFile(`images/${newFilename}`)
    .then(() => {
      fs.unlinkSync(req.file.path); // Supprimer l'ancien fichier
      const book = new Book({
        // Construire le "book" normalement !
        ...bookObject,
        userID: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${newFilename}`,
      });
      book
        .save()
        .then(() => {
          return res.status(201).json({
            message: 'Le livre a été enregistré !',
          });
        })
        .catch(error => {
          return res.status(400).json({
            error: error,
          });
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
};

// Noter un livre
exports.rateOneBook = (req, res, next) => {
  const { userId } = req.auth;
  const { id } = req.params;
  const { rating } = req.body;
  console.log(req.body);
  // On recherche le livre par son id
  Book.findById(id)
    .then(book => {
      const existingRating = book.ratings.find(
        rating => rating.userId === userId,
      );
      console.log({ book });
      // Si l'utilisateur a déjà noté le livre, on l'informe et on l'empêche de noter le livre // Est-ce vraiment utile de l'avertir ?
      if (existingRating) {
        return res.status(403).json({
          message:
            'Vous avez déjà noté ce livre ! Impossible de modifier la note.',
        });
      }
      // Ajouter la nouvelle note au livre
      book.ratings.push({ id, userId, grade: rating });
      // Mettre à jour la note moyenne
      const averageRating = Math.round(
        book.ratings.reduce((sum, rating) => {
          return sum + rating.grade;
        }, 0) /
        book.ratings.length,
      );
      // Utiliser findByIdAndUpdate pour mettre à jour le livre
      return Book.findByIdAndUpdate(
        id,
        { ratings: book.ratings, averageRating },
        { new: true }, // Ici, on recrée le book avec toutes ses infos pour l'envoyer en réponse ( et afficher l'image, l'auteur etc...)
      );
    })
    .catch(error => res.status(400).json({ error, message: 'Le livre n\'a pas été trouvé !' }));
};

// Trouver un livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => {
      res.status(404).json({
        error: error,
      });
    });
};

// Retourne les 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri en ordre décroissant par averageRating
    .limit(3) // Limiter à 3 livres
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  // On vérifie qu'il y a une image envoyé dans le body de la requête
  const bookObject = req.file
    ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
    }
    : { ...req.body };
  // Supprimer userId pour éviter la falsification par un user malveillant
  delete bookObject._userId;
  // On cherche l'objet pour savoir si c'est bien l'user à qui il appartient
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: '403: unauthorized request !' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
        )
          .then(() => {
            return res
              .status(200)
              .json({ message: 'Le livre a été modifié !' });
          })
          .catch(error => res.status(401).json({ error: error }));
      }
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: '403: unauthorized request !' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'objet supprimé !' }))
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        error,
      });
    });
};

// Récupère tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
      res.status(400).json({
        error: error,
      });
    });
};
