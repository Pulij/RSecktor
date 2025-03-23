import mongoose from 'mongoose';
const statEconomySchema = new mongoose.Schema({
  currency: {
    monthlyCurrency: [
      {
        month: String, // Например, "January", "February", и т.д.
        year: Number, // Текущий год
        totalExpenses: { type: Number, default: 0 }, // Количество расходов за месяц
        totalIncome: { type: Number, default: 0 }, // Количество доходов за месяц
        avgCurrencyPerUser: { type: Number, default: 0 }, // Примерно валюты у 1-го пользователя
        totalCurrencyMonth: { type: Number, default: 0 }, // Общий уровень валюты в текущем месяце
      },
    ],
  },
  inflation: {
    monthlyInflation: [
      {
        month: String, // Например, "January", "February", и т.д.
        year: Number, // Текущий год
        rate: { type: Number, default: 0 }, // Уровень инфляции за месяц
      },
    ],
  },
  charitySumma: { type: Number, default: 0 },
});

const statEconomy = mongoose.model(
  'statsEconomy',
  statEconomySchema,
  'statsEconomy',
);
export default statEconomy;

// Валюты у 1-го пользователя = Общеее число валюты поделить на количество пользователей в бд
// Количество доходов за месяц = Валюта текущего месяца - Валюта предыдущего месяца
// Расходы за месяц = (Общий уровень валюты на конец предыдущего месяца + Доходы за месяц) - Общий уровень валюты на конец текущего месяца
// Инфляция = ((Текущий уровень валюты - Предыдущий уровень валюты) / Предыдущий уровень валюты) * 100
