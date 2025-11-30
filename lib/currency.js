// Currency configuration with symbols and conversion rates
// Rates are approximate and cached - in production use a live API

export const CURRENCIES = {
  INR: {
    symbol: "₹",
    name: "Indian Rupee",
    rate: 1,
  },
  AED: {
    symbol: "د.إ",
    name: "UAE Dirham",
    rate: 0.305,
  },
  USD: {
    symbol: "$",
    name: "US Dollar",
    rate: 0.012,
  },
  JPY: {
    symbol: "¥",
    name: "Japanese Yen",
    rate: 1.8,
  },
};

// Function to format amount with currency
export const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) return `${amount}`;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
};

// Function to convert amount from one currency to another
export const convertCurrency = (
  amount,
  fromCurrency = "INR",
  toCurrency = "INR"
) => {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
  const toRate = CURRENCIES[toCurrency]?.rate || 1;

  return (amount / fromRate) * toRate;
};

// Get locale based on language
export const getLocale = (language = "en") => {
  const localeMap = {
    en: "en-US",
    hi: "hi-IN",
    kn: "kn-IN",
  };
  return localeMap[language] || "en-US";
};
