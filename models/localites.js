const mongoose = require("mongoose");

const localiteSchema = mongoose.Schema({
    codePostal: Number,
    ville: String,
    zone: Number,
});

const Localite = mongoose.model('localites', localiteSchema);

module.exports = Localite;


