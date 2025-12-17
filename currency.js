// ============================================
// GLOBAL CURRENCY CONVERTER
// ============================================

(function() {

    console.log('Currency Converter loaded - Default: USD');

    // 1. CONFIGURATION
    var API_KEY = "9e600f4bddmsh40d2f1f9b0245e7p1d95c0jsn04b0bb4fd54c";
    var API_HOST = "currency-conversion-and-exchange-rates.p.rapidapi.com";
    var BASE_CURRENCY = "USD"; 
    
    var CURRENCY_SYMBOLS = {
        "USD": "$", "EUR": "€", "PHP": "₱", "GBP": "£", "JPY": "¥"
    };

    // 2. STATE
    var exchangeRates = {}; 
    var currentCurrency = "USD"; 
    
    var currencyItems = document.querySelectorAll('.dropdown-menu[aria-labelledby="currencyDropdown"] .dropdown-item');
    var currencyButton = document.getElementById('currencyDropdown');

    // 3. API HELPER (XMLHttpRequest)
    function fetchRates() {
        var url = "https://" + API_HOST + "/latest?from=" + BASE_CURRENCY + "&to=USD,EUR,PHP,GBP,JPY";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("x-rapidapi-key", API_KEY);
        xhr.setRequestHeader("x-rapidapi-host", API_HOST);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.rates) {
                        exchangeRates = data.rates;
                        if (!exchangeRates['USD']) exchangeRates['USD'] = 1; 
                        console.log("Rates loaded:", exchangeRates);
                        updatePagePrices();
                    }
                } catch (e) { console.error("Currency Parse Error", e); }
            }
        };
        xhr.send();
    }

    // 4. CONVERSION LOGIC
    function updatePagePrices() {
        if (!exchangeRates[currentCurrency]) return;

        var priceElements = document.querySelectorAll('.price, .flight-price'); 

        for (var i = 0; i < priceElements.length; i++) {
            var el = priceElements[i];
            
            // Initialize static elements (PHP rendered)
            if (!el.hasAttribute('data-base-val')) {
                var rawText = el.textContent.trim();
                var numString = rawText.replace(/[^0-9.]/g, '');
                var baseVal = parseFloat(numString);

                if (!isNaN(baseVal)) {
                    el.setAttribute('data-base-val', baseVal);
                    el.setAttribute('data-base-cur', "PHP"); 
                    
                    var prefix = "";
                    if (rawText.toLowerCase().indexOf('from') !== -1) prefix = "From ";
                    el.setAttribute('data-prefix', prefix);
                }
            }

            // Calculate
            var baseVal = parseFloat(el.getAttribute('data-base-val'));
            var baseCur = el.getAttribute('data-base-cur');
            var prefixText = el.getAttribute('data-prefix') || "";

            if (!isNaN(baseVal) && exchangeRates[baseCur] && exchangeRates[currentCurrency]) {
                var valInUSD = baseVal / exchangeRates[baseCur];
                var finalVal = valInUSD * exchangeRates[currentCurrency];

                var symbol = CURRENCY_SYMBOLS[currentCurrency] || currentCurrency + " ";
                var formattedVal = "";

                if (currentCurrency === "JPY") {
                    formattedVal = Math.round(finalVal).toLocaleString();
                } else {
                    formattedVal = finalVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                }

                el.textContent = prefixText + symbol + formattedVal;
            }
        }
    }

    // 5. EVENT LISTENERS
    if (currencyItems.length > 0) {
        for (var i = 0; i < currencyItems.length; i++) {
            currencyItems[i].addEventListener('click', function(e) {
                e.preventDefault();
                var text = this.textContent.trim();
                var code = text.split(' ')[0]; 

                if (["USD", "EUR", "PHP", "GBP", "JPY"].indexOf(code) !== -1) {
                    currentCurrency = code;
                    if (currencyButton) currencyButton.textContent = code;
                    updatePagePrices();
                }
            });
        }
    }

    // 6. INIT
    fetchRates(); 

    var observer = new MutationObserver(function(mutations) {
        if (window.currencyUpdateTimeout) clearTimeout(window.currencyUpdateTimeout);
        window.currencyUpdateTimeout = setTimeout(updatePagePrices, 500);
    });

    var targetNode = document.getElementById('destinationsCarousel');
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }

})();