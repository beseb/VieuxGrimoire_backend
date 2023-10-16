// in controllers/book.js
const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');

// Enregistrer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // verifier book
  delete bookObject._id;
  delete bookObject._userId;
  console.log(bookObject);
  const book = new Book({
    ...bookObject,
    userID: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
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
};

// Note un livre
exports.rateOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(
        rating => rating.userId === req.auth.userId
      );

      if (existingRating) {
        return res.status(403).json({
          message:
            'Vous avez déjà noté ce livre ! Impossible de modifier la note.',
        });
      }
      console.log(req.body.rating);
      // Ajouter la nouvelle note au livre
      book.ratings.push({
        userId: req.auth.userId,
        grade: req.body.rating,
      });

      // Mettre à jour la note moyenne
      book.averageRating =
        book.ratings.reduce((sum, rating) => sum + rating.grade, 0) /
        book.ratings.length;

      // Sauvegarder les modifications
      return book.save();
    })
    .then(book => res.status(201).json({ book }))
    .catch(error => res.status(400).json({ error }));
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

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri en ordre décroissant par averageRating
    .limit(3) // Limiter à 3 livres
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  // Il y a un file (image ici) ou non ?
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
        // Erreur 403
        return res.status(403).json({ message: '403: unauthorized request !' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
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
    /// Vérifiez comment supprimer l'imageUrl du livre également !!
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
