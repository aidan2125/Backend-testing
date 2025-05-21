const apiURL = "https://api.exchangerate-api.com/v4/latest/USD";
let exchangeRates = {};

async function loadCurrencies() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    exchangeRates = data.rates;

    const currencySelects = [
      document.getElementById("fromCurrency"),
      document.getElementById("toCurrency"),
    ];

    Object.keys(exchangeRates).forEach((currency) => {
      currencySelects.forEach((select) => {
        const option = document.createElement("option");
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
      });
    });

    document.getElementById("fromCurrency").value = "USD";
    document.getElementById("toCurrency").value = "ZAR";
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    document.getElementById("result").innerText = "Failed to load currencies.";
  }
}

async function convert(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById("valueField").value) || 0;
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;

  const convertButton = document.getElementById("convertBtn");
  convertButton.setAttribute("disabled", "true");

  document.getElementById("loading-container").style.display = "flex";
  document.getElementById("result").innerText = "";

  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    document.getElementById("result").innerText = "Error fetching exchange rates.";
    return;
  }

  setTimeout(() => {
    const conversionRate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    const convertedAmount = (amount * conversionRate).toFixed(2);

    convertButton.removeAttribute("disabled");
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("result").innerText = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
  }, 2000);
}

function resetConverter() {
  document.getElementById("valueField").value = "";
  document.getElementById("result").innerText = "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadCurrencies();

  const convertBtn = document.getElementById("convertBtn");
  if (!convertBtn) {
    console.error('Element with id "convertBtn" not found.');
    return;
  }

  convertBtn.addEventListener("click", convert);
});
