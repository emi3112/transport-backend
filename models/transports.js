const mongoose = require("mongoose");

const transportSchema = mongoose.Schema({
    expediteur: String,
    destinataire: String,
    nbColis: Number, 
    poids: Number,
    whoPaid: String,
    tarifHT: Number,
    taxe: Number,
    total: Number
});

const Transport = mongoose.model('transports', transportSchema);

module.exports = Transport;