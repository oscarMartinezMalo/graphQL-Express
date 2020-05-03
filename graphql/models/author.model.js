const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    name: String,
    lastName: String,
    facePictureUrl: String
});

module.exports = mongoose.model('Author', authorSchema);