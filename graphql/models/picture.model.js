const mongoose = require('mongoose');

const pictureSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    title: String,
    imageUrl: String,
    genre: String,
    authorId: String
});

module.exports = mongoose.model('Picture', pictureSchema);