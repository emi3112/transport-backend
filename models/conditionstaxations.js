const mongoose = require("mongoose");

const conditionstaxationsSchema = mongoose.Schema({
    idClient: Number,
    taxePortDu: Number,
    taxePortPaye: Number, 
    useTaxePortDuGenerale: Boolean,
    useTaxePortPayeGenerale: Boolean,
});

const Taxe = mongoose.model('conditionstaxations', conditionstaxationsSchema);

module.exports = Taxe;



