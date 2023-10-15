const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book');
// Vérifier les routes !! //
router.get('/', bookCtrl.getAllBooks);
// Vérifier bestRating et la route...
router.get('/bestrating', bookCtrl.getBestRatedBooks);
// Idem
router.post('/:id/rating', bookCtrl.rateOneBook);
router.post('/', bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;
