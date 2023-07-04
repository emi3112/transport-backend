const mongoose = require("mongoose");

const tarifSchema = mongoose.Schema({
    codeDepartement: Number,
    idClient: Number,
    idClientHeritage: Number, 
    montant: Number,
    zone: Number,
});

const Tarif = mongoose.model('tarifs', tarifSchema);

module.exports = Tarif;

