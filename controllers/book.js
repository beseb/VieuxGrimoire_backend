// in controllers/book.js
const Book = require('../models/book');



// Enregistrer un livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book); // verifier book
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
        ...bookObject,
        userID: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save().then(
        () => {
          res.status(201).json({
            message: 'Le livre a été enregistré !'
          });
        }
      ).catch(
        (error) => {
          res.status(400).json({
            error: error
          });
        }
      );
    }

//   const book = new Book({
//     title: req.body.book, // Ici, vérifiez si req.body.book est ok! L'original est req.body.title !!
//     author: req.body.author,
//     imageUrl: req.body.imageUrl,
//     year: req.body.year,
//     genre: req.body.genre,
//     userId: req.body.userId,
//     ratings: [{}],
//     averageRating: 0,
//   });

// Noter un livre
exports.rateOneBook = (req, res, next )=>{
    // Trouver un livre et modify son rating ?
}

// Trouver un livre
exports.getOneBook = (req,res,next) =>{
    Book.findOne({
        _id: req.params.id
    }).then((book)=>{res.status(200).json(book);
    }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

// Récuperer un tableau des 3 livres les mieux notées
 exports.getBestRatedBooks = (req,res,next) =>{
    /// Idem à GetALLBooks avec une filtrage par le rating?
    
    
//     Définit la note pour le user ID fourni.
// La note doit être comprise entre 0 et 5.
// L'ID de l'utilisateur et la note doivent être ajoutés au
// tableau "rating" afin de ne pas laisser un utilisateur
// noter deux fois le même livre.
// Il n’est pas possible de modifier une note.
// La note moyenne "averageRating" doit être tenue à
// jour, et le livre renvoyé en réponse de la requête.
};

// Modifier un livre 
exports.modifyBook = (req,res,next) =>{
    const book = new Book({
        _id: req.params.id,
        // A compléter ....
    });
    Book.updateOne({_id: req.params.id}, book)
    .then(()=>{res.status(201).json({message: 'Le livre a été modifié !'});})
    .catch((error)=>{res.status(400).json({error: error});});
};

// Supprimer un livre
exports.deleteBook = (req,res,next)=>{
    Book.deleteOne({_id: req.params.id})
    /// Vérifiez comment supprimer l'imageUrl du livre également !!
    .then(
        () => {
            res.status(200).json({
                message : 'Le livre a été supprimé !'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};
// Récupère tous les livres 
exports.getAllBooks = (req,res,next)=>{
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error)=>{
            res.status(400).json({
                error: error
            });
        }
    );
};