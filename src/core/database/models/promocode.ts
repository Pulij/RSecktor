const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    activationsLeft: { type: Number, default: 1 },  // Количество доступных активаций
    createdAt: { type: Date, default: Date.now },
    reward: {
        type: Map,  // Динамическое хранение данных
        of: String   // Значения наград могут быть строками, но можно сделать и Number
    }
});

const PromoCode = mongoose.model('promoCode', promoCodeSchema);
module.exports = PromoCode