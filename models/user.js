const mongoose = require('mongoose');
// Hacher les mdp !!
const userSchema = mongoose.Schema({
    email : { type : String, required : true},
    password : { type: String, required : true}
});

module.exports = mongoose.model('User', userSchema);