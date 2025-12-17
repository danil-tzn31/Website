// ============================================
// FLIGHT SEARCH SCRIPT (Var & XHR)
// ============================================

(function() {

    console.log('Google Flights script loaded - Version 3.5 (Standardized)');

    var API_KEY = '5559c078d8mshd05aafeafe9af7ap11c3d1jsn9352a8e5b475'; 
    var API_HOST = 'google-flights2.p.rapidapi.com';
    var BASE_URL = 'https://' + API_HOST;

    var LOCAL_AIRPORTS = {
        'manila': 'MNL', 'cebu': 'CEB', 'clark': 'CRK', 'davao': 'DVO',
        'boracay': 'MPH', 'palawan': 'PPS', 'bohol': 'TAG', 'siargao': 'IAO',
        'coron': 'USU', 'iloilo': 'ILO', 'bacolod': 'BCD', 'tacloban': 'TAC',
        'dumaguete': 'DGT', 'cagayan': 'CGY', 'gensan': 'GES', 'zamboanga': 'ZAM',
        'laoag': 'LAO', 'legazpi': 'DRP'
    };

    var currentFlightResults = [];
    var currentSortType = 'best'; 
    var currentFromCode = ''; 
    var currentToCode = '';

    // Elements
    var flightFromInput = document.getElementById('flight-from');
    var flightToInput = document.getElementById('flight-to');
    var flightDateInput = document.getElementById('flight-depart'); 
    var flightSearchBtn = document.getElementById('btn-flight-search');
    
    var flightResultsContainer = document.querySelector('#destinationsCarousel .carousel-inner');
    var sectionHeader = document.querySelector('.destinations-section h2');
    var sortContainer = document.getElementById('sort-container');
    var sortPills = document.querySelectorAll('#sort-container .sort-pill');
    var hotelSortContainer = document.getElementById('hotel-sort-container');

    // Standardized XHR Promise Wrapper
    function callApi(endpoint) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            var url = endpoint.indexOf('http') === 0 ? endpoint : BASE_URL + endpoint;
            
            xhr.open('GET', url, true);
            xhr.setRequestHeader('x-rapidapi-key', API_KEY);
            xhr.setRequestHeader('x-rapidapi-host', API_HOST);

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('HTTP Error: ' + xhr.status));
                }
            };

            xhr.onerror = function() { reject(new Error("Network Error")); };
            xhr.send();
        });
    }

    async function fetchGoogleFlights(fromCode, toCode, date, totalPassengers) {
        var endpoint = '/api/v1/searchFlights?departure_id=' + fromCode + 
                       '&arrival_id=' + toCode + 
                       '&outbound_date=' + date + 
                       '&currency=USD&travel_class=ECONOMY&adults=' + totalPassengers + 
                       '&stops=1&limit=50';

        try {
            var result = await callApi(endpoint);

            if (result.status && result.data && result.data.itineraries) {
                var topFlights = result.data.itineraries.topFlights || [];
                var otherFlights = result.data.itineraries.otherFlights || [];
                var allFlights = topFlights.concat(otherFlights);

                if (allFlights.length > 0) {
                    currentFlightResults = allFlights; 
                    currentSortType = 'best'; 
                    resetSortUI();
                    
                    if(!currentFromCode) currentFromCode = fromCode;
                    if(!currentToCode) currentToCode = toCode;

                    applyFlightSort(currentFlightResults); 
                } else {
                    handleFlightError('No flights found for ' + fromCode + ' -> ' + toCode + '.');
                }
            } else {
                handleFlightError('No flights available on this date.');
            }
        } catch (error) {
            console.error("Flight Search Error:", error);
            handleFlightError("An error occurred while fetching flight data.");
        }
    }

    if (flightSearchBtn) {
        setupFlightSorting(); 

        flightSearchBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            if (!flightFromInput || !flightToInput || !flightDateInput) return;

            var fromQuery = flightFromInput.value.trim().toLowerCase();
            var toQuery = flightToInput.value.trim().toLowerCase();
            var dateRaw = flightDateInput.value; 
            
            var adultCountElement = document.getElementById('count-adults');
            var childrenCountElement = document.getElementById('count-children');
            var adults = adultCountElement ? parseInt(adultCountElement.textContent) : 1;
            var children = childrenCountElement ? parseInt(childrenCountElement.textContent) : 0;
            var totalPassengers = adults + children; 

            if (!fromQuery || !toQuery || !dateRaw) {
                alert('Please fill in Origin, Destination, and Date.');
                return;
            }
            if (totalPassengers === 0) {
                alert('Please select at least 1 passenger.');
                return;
            }

            var fromIata = LOCAL_AIRPORTS[fromQuery] || fromQuery.toUpperCase();
            var toIata = LOCAL_AIRPORTS[toQuery] || toQuery.toUpperCase();

            currentFromCode = fromIata;
            currentToCode = toIata;
            
            renderLoading('Searching flights: ' + fromIata + ' to ' + toIata + ' for ' + totalPassengers + ' pax...');
            toggleCarouselControls(false);
            
            if (hotelSortContainer) hotelSortContainer.style.display = 'none';
            if (sortContainer) sortContainer.style.display = 'block';

            await fetchGoogleFlights(fromIata, toIata, dateRaw, totalPassengers);
        });
    }

    function setupFlightSorting() {
        if (!sortPills) return;
        var pillsArray = Array.prototype.slice.call(sortPills);

        pillsArray.forEach(function(pill) {
            pill.addEventListener('click', function() {
                pillsArray.forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                
                currentSortType = this.getAttribute('data-sort');
                applyFlightSort(currentFlightResults);
            });
        });
    }

    function resetSortUI() {
        var pillsArray = Array.prototype.slice.call(sortPills);
        pillsArray.forEach(function(p) { p.classList.remove('active'); });
        var bestPill = document.querySelector('#sort-container .sort-pill[data-sort="best"]');
        if(bestPill) bestPill.classList.add('active');
    }

    function applyFlightSort(results) {
        var sortedResults = results.slice();
        
        function getPrice(item) { return item.price || Infinity; }
        function getDuration(item) { return item.duration && item.duration.raw ? item.duration.raw : Infinity; }
        
        if (currentSortType === 'price_asc') {
            sortedResults.sort(function(a, b) { return getPrice(a) - getPrice(b); });
        } else if (currentSortType === 'rating_desc') {
            sortedResults.sort(function(a, b) { return getDuration(a) - getDuration(b); });
        }
        
        renderFlightCards(sortedResults, currentFromCode, currentToCode);
    }

    function toggleCarouselControls(show) {
        var prevControl = document.querySelector('#destinationsCarousel .carousel-control-prev');
        var nextControl = document.querySelector('#destinationsCarousel .carousel-control-next');
        if (prevControl && nextControl) {
            prevControl.style.display = show ? 'block' : 'none';
            nextControl.style.display = show ? 'block' : 'none';
        }
    }

    function renderLoading(msg) {
        if(sectionHeader) sectionHeader.innerText = msg;
        if(flightResultsContainer) { 
            flightResultsContainer.innerHTML = 
                '<div class="carousel-item active">' +
                    '<div class="d-flex justify-content-center align-items-center" style="height: 450px;">' +
                        '<div class="text-center">' +
                            '<div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;"></div>' +
                            '<p class="text-muted">' + msg + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
    }

    function renderFlightCards(flights, fromCode, toCode) {
        var displayFrom = fromCode;
        var displayTo = toCode;

        if (!displayFrom || displayFrom === '---') {
             var rawFrom = document.getElementById('flight-from').value.trim().toLowerCase();
             displayFrom = LOCAL_AIRPORTS[rawFrom] || rawFrom.toUpperCase() || 'Origin';
        }

        if (!displayTo || displayTo === '---') {
             var rawTo = document.getElementById('flight-to').value.trim().toLowerCase();
             displayTo = LOCAL_AIRPORTS[rawTo] || rawTo.toUpperCase() || 'Dest';
        }

        if(sectionHeader) sectionHeader.innerText = 'Flights: ' + displayFrom + ' → ' + displayTo;
        if(!flightResultsContainer) return;
        
        flightResultsContainer.innerHTML = ''; 
        
        var itemsPerSlide = 8; 
        var totalSlides = Math.ceil(flights.length / itemsPerSlide);

        for (var i = 0; i < totalSlides; i++) {
            var start = i * itemsPerSlide;
            var end = start + itemsPerSlide;
            var chunk = flights.slice(start, end);

            var slideItem = document.createElement('div');
            slideItem.className = 'carousel-item' + (i === 0 ? ' active' : '');
            
            var gridContainer = document.createElement('div');
            gridContainer.className = 'row g-3 flight-grid-result';
            
            chunk.forEach(function(offer, index) {
                var segment = (offer.flights && offer.flights[0]) ? offer.flights[0] : {};
                
                var airlineName = segment.airline || 'Airline';
                var airlineLogo = segment.airline_logo || 'https://placehold.co/50?text=Air';
                var flightNumber = segment.flight_number || ''; 
                var aircraft = segment.aircraft || 'Economy Class';

                var rawDep = segment.departure_airport ? segment.departure_airport.time : null;
                var rawArr = segment.arrival_airport ? segment.arrival_airport.time : null;

                function formatTime(val) {
                    if (!val) return '--:--';
                    try {
                        var date = new Date(val);
                        if (isNaN(date.getTime())) return val; 
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch (e) { return val; }
                }

                var depTime = formatTime(rawDep);
                var arrTime = formatTime(rawArr);
                var duration = offer.duration && offer.duration.text ? offer.duration.text : '';
                
                var rawPrice = offer.price || 0;
                var displayPrice = offer.price ? 'USD ' + offer.price.toLocaleString() : '---';

                var colDiv = document.createElement('div');
                colDiv.className = 'col-md-3'; 
                var delay = (0.05 * index);

                var adultCount = document.getElementById('count-adults') ? document.getElementById('count-adults').textContent : 1;
                var childCount = document.getElementById('count-children') ? document.getElementById('count-children').textContent : 0;
                var guestsText = adultCount + " Adults, " + childCount + " Children";

                var dateFrom = document.getElementById('flight-depart').value;
                var dateTo = document.getElementById('flight-return').value; 
                var safeAirline = (airlineName || "Flight").replace(/'/g, "\\'");
                
                // Constructing HTML string with standard concat or template literals
                // Since user wants 'var' but modern browsers support templates, I will use backticks 
                // for readability but keep 'var' logic.
                colDiv.innerHTML = `
                    <div class="flight-card w-100" style="opacity: 1; transform: none; transition-delay: ${delay}s;">
                        <div class="flight-card-visual">
                            <span class="duration-badge">${duration}</span>
                            <img src="${airlineLogo}" alt="${airlineName}" class="airline-logo">
                        </div>
                        <div class="flight-info">
                            <div>
                                <div class="flight-route">
                                    <span>${displayFrom}</span>
                                    <i class="bi bi-arrow-right" style="color: #2a9d8f;"></i>
                                    <span>${displayTo}</span>
                                </div>
                                <div class="flight-time-range">
                                    ${depTime} - ${arrTime}
                                </div>
                                <div class="flight-airline-name">
                                    ${airlineName} <span class="badge bg-light text-dark border ms-1">${flightNumber}</span>
                                </div>
                                <div class="text-muted small mb-3 text-truncate" style="font-size: 0.7rem;">
                                    ${aircraft}
                                </div>
                            </div>
                            <div class="flight-card-footer">
                                <span class="flight-price" data-base-val="${rawPrice}" data-base-cur="USD">${displayPrice}</span>
                                <button class="btn-flight-select" onclick="openBookingModal({
                                    category: 'Flight',
                                    name: '${safeAirline} (${displayFrom} to ${displayTo})',
                                    displayPrice: '${displayPrice}',
                                    rawPrice: '${rawPrice}',
                                    dateFrom: '${dateFrom}',
                                    dateTo: '${dateTo}',
                                    guests: '${guestsText}',
                                    flightNumber: '${flightNumber}',
                                    departureTime: '${depTime}'
                                })">Book Now</button>
                            </div>
                        </div>
                    </div>`;
                
                gridContainer.appendChild(colDiv);
            });

            slideItem.appendChild(gridContainer);
            flightResultsContainer.appendChild(slideItem);
        }
        
        toggleCarouselControls(totalSlides > 1);
    }

    function handleFlightError(msg) {
        if(sectionHeader) sectionHeader.innerText = "Search Results";
        if(flightResultsContainer) { 
            flightResultsContainer.innerHTML = 
                '<div class="carousel-item active">' +
                    '<div class="d-flex flex-column justify-content-center align-items-center text-danger" style="height: 400px;">' +
                        '<i class="bi bi-exclamation-circle" style="font-size: 3rem;"></i>' +
                        '<h5 class="mt-3 text-center px-3">' + msg + '</h5>' +
                    '</div>' +
                '</div>';
        }
        toggleCarouselControls(false);
        if (sortContainer) sortContainer.style.display = 'none';
        if (hotelSortContainer) hotelSortContainer.style.display = 'none'; 
    }

})();