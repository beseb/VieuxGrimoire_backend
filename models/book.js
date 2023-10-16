const mongoose = require('mongoose');
// Voir les spécifications techniques pour plus d'infos sur le schema attendu
const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true},
    author: { type: String, required: true},
    imageUrl: { type: String, required: true },
    year: { type : Number, required: true},
    genre: { type: String, required: true}, 
    ratings: [{
        userId: { type: String, required: true},
        grade: { type: Number, required: true, min: 0, max: 5},
    }],
    averageRating: {type: Number,required: true, default: 0},
});

module.exports = mongoose.model('Book', bookSchema);