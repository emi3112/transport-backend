const mongoose = require("mongoose");

const clientSchema = mongoose.Schema({
    codePostal: Number,
    idClient: Number,
    raisonSociale: String, 
    ville: String,
    whoPaid: String,
});

const Client = mongoose.model('clients', clientSchema);

module.exports = Client;

