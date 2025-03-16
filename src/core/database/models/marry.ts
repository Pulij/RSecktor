const mongoose = require('mongoose');
const MarrySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    status: { type: String, default: "alone" },
    who: String,
    marrycreator: String,
    marriageDate: String
})
// by letovsky
const marrynaxoi = mongoose.model("marrynaxoi", MarrySchema)
module.exports = marrynaxoi;