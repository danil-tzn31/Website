// ============================================
// FLIGHT SEARCH SCRIPT (Google Flights API - Fixed Header & Carousel)
// ============================================

(function() {

    console.log('Google Flights script loaded');

    // API Config
    const G_API_KEY = 'ec6af1c89emsh3cfda7fc1782613p11a2c5jsnc219ed81965e'; 
    const G_API_HOST = 'google-flights2.p.rapidapi.com';

    const LOCAL_AIRPORTS = {
        'manila': 'MNL', 'cebu': 'CEB', 'clark': 'CRK', 'davao': 'DVO',
        'boracay': 'MPH', 'palawan': 'PPS', 'bohol': 'TAG', 'siargao': 'IAO',
        'coron': 'USU', 'iloilo': 'ILO', 'bacolod': 'BCD', 'tacloban': 'TAC',
        'dumaguete': 'DGT', 'cagayan': 'CGY', 'gensan': 'GES', 'zamboanga': 'ZAM',
        'laoag': 'LAO', 'legazpi': 'DRP'
    };

    const getFlightOptions = () => ({
        method: 'GET',
        headers: { 'x-rapidapi-key': G_API_KEY, 'x-rapidapi-host': G_API_HOST }
    });

    // DOM Elements
    const flightFromInput = document.getElementById('flight-from');
    const flightToInput = document.getElementById('flight-to');
    const flightDateInput = document.getElementById('flight-depart'); 
    const flightSearchBtn = document.getElementById('btn-flight-search');
    
    const flightResultsContainer = document.querySelector('#destinationsCarousel .carousel-inner');
    const sectionHeader = document.querySelector('.destinations-section h2');

    const sortContainer = document.getElementById('sort-container');
    const sortPills = document.querySelectorAll('#sort-container .sort-pill');

    // --- STATE VARIABLES (This fixes the '---' issue) ---
    let currentFlightResults = [];
    let currentSortType = 'best'; 
    let currentFromCode = ''; // Stores the Origin (e.g., MNL)
    let currentToCode = '';   // Stores the Destination (e.g., CEB)

    if (flightSearchBtn) {
        
        setupFlightSorting(); 

        flightSearchBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const adultCountElement = document.getElementById('count-adults');
            const childrenCountElement = document.getElementById('count-children');

            const adults = adultCountElement ? parseInt(adultCountElement.textContent) : 1;
            const children = childrenCountElement ? parseInt(childrenCountElement.textContent) : 0;
            const totalPassengers = adults + children; 

            if (!flightFromInput || !flightToInput || !flightDateInput) {
                handleFlightError("Search input fields not found. Check HTML IDs.");
                return;
            }

            const fromQuery = flightFromInput.value.trim().toLowerCase();
            const toQuery = flightToInput.value.trim().toLowerCase();
            const dateRaw = flightDateInput.value; 

            if (!fromQuery || !toQuery || !dateRaw) {
                alert('Please fill in Origin, Destination, and Date.');
                return;
            }
            
            if (totalPassengers === 0) {
                alert('Please select at least 1 passenger.');
                return;
            }

            const fromIata = LOCAL_AIRPORTS[fromQuery] || fromQuery.toUpperCase();
            const toIata = LOCAL_AIRPORTS[toQuery] || toQuery.toUpperCase();

            // Save the codes to our variables immediately
            currentFromCode = fromIata;
            currentToCode = toIata;

            // Loading UI
            if(sectionHeader) sectionHeader.innerText = `Searching flights: ${fromIata} to ${toIata} for ${totalPassengers} pax...`;
            if(flightResultsContainer) { 
                flightResultsContainer.innerHTML = `
                    <div class="carousel-item active">
                        <div class="d-flex justify-content-center align-items-center" style="height: 450px;">
                            <div class="text-center">
                                <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;"></div>
                                <p class="text-muted">Scanning airlines...</p>
                            </div>
                        </div>
                    </div>`;
            }
            
            toggleCarouselControls(false);
            if (sortContainer) sortContainer.style.display = 'block';

            await fetchGoogleFlights(fromIata, toIata, dateRaw, totalPassengers);
        });
    }

    function toggleCarouselControls(show) {
        const prevControl = document.querySelector('#destinationsCarousel .carousel-control-prev');
        const nextControl = document.querySelector('#destinationsCarousel .carousel-control-next');
        if (prevControl && nextControl) {
            prevControl.style.display = show ? 'block' : 'none';
            nextControl.style.display = show ? 'block' : 'none';
        }
    }

    // --- SORTING LOGIC ---

    function setupFlightSorting() {
        sortPills.forEach(pill => {
            pill.addEventListener('click', function() {
                sortPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                
                currentSortType = this.getAttribute('data-sort');
                applyFlightSort(currentFlightResults);
            });
        });
    }

    function applyFlightSort(results) {
        let sortedResults = [...results];
        
        const getPrice = (item) => item.price || Infinity;
        const getDuration = (item) => item.duration?.raw || Infinity;
        
        if (currentSortType === 'price_asc') {
            sortedResults.sort((a, b) => getPrice(a) - getPrice(b));
        } else if (currentSortType === 'rating_desc') {
            sortedResults.sort((a, b) => getDuration(a) - getDuration(b));
        } else {
            sortedResults = results;
        }
        
        // IMPORTANT: We use the stored variables (currentFromCode) instead of reading the screen
        renderFlightCards(sortedResults, currentFromCode, currentToCode);
    }

    // 2. FETCH FUNCTION
    async function fetchGoogleFlights(fromCode, toCode, date, totalPassengers) {
        const url = `https://${G_API_HOST}/api/v1/searchFlights?departure_id=${fromCode}&arrival_id=${toCode}&outbound_date=${date}&currency=PHP&travel_class=ECONOMY&adults=${totalPassengers}&stops=1&limit=50`; 
        console.log("Fetching URL:", url);

        try {
            const response = await fetch(url, getFlightOptions());
            const result = await response.json();
            console.log("API Response:", result);

            if (result.status && result.data && result.data.itineraries) {
                const allFlights = [
                    ...(result.data.itineraries.topFlights || []),
                    ...(result.data.itineraries.otherFlights || [])
                ];
                if (allFlights.length > 0) {
                    currentFlightResults = allFlights; 
                    currentSortType = 'best'; 
                    
                    // Reset sort UI
                    sortPills.forEach(p => p.classList.remove('active'));
                    document.querySelector('#sort-container .sort-pill[data-sort="best"]').classList.add('active');
                    
                    applyFlightSort(currentFlightResults); 
                } else {
                    handleFlightError(`No flights found for ${fromCode} -> ${toCode}.`);
                }
            } else {
                handleFlightError(`No flights available on this date.`);
            }
        } catch (error) {
            console.error("Flight Search Error:", error);
            handleFlightError("An error occurred while fetching flight data.");
        }
    }

    // 3. RENDER FUNCTION (CAROUSEL: 2 Rows x 4 Cols = 8 Items)
    function renderFlightCards(flights, fromCode, toCode) {
        // Fallback in case variables are empty for some reason
        const displayFrom = fromCode || 'Origin';
        const displayTo = toCode || 'Dest';

        if(sectionHeader) sectionHeader.innerText = `Flights: ${displayFrom} → ${displayTo}`;
        if(!flightResultsContainer) return;
        
        flightResultsContainer.innerHTML = ''; 
        
        const itemsPerSlide = 8; // 2 rows * 4 columns
        const totalSlides = Math.ceil(flights.length / itemsPerSlide);

        for (let i = 0; i < totalSlides; i++) {
            const start = i * itemsPerSlide;
            const end = start + itemsPerSlide;
            const chunk = flights.slice(start, end);

            const slideItem = document.createElement('div');
            slideItem.className = `carousel-item ${i === 0 ? 'active' : ''}`;
            
            const gridContainer = document.createElement('div');
            gridContainer.className = 'row g-3 flight-grid-result';
            
            chunk.forEach((offer, index) => {
                const segment = offer.flights && offer.flights[0] ? offer.flights[0] : {};
                
                const airlineName = segment.airline || 'Airline';
                const airlineLogo = segment.airline_logo || 'https://placehold.co/50?text=Air';
                const flightNumber = segment.flight_number || ''; 
                const aircraft = segment.aircraft || 'Economy Class';

                const rawDep = segment.departure_airport ? segment.departure_airport.time : null;
                const rawArr = segment.arrival_airport ? segment.arrival_airport.time : null;

                const formatTime = (val) => {
                    if (!val) return '--:--';
                    try {
                        const date = new Date(val);
                        if (isNaN(date.getTime())) return val; 
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch (e) { return val; }
                };

                const depTime = formatTime(rawDep);
                const arrTime = formatTime(rawArr);

                const duration = offer.duration?.text || '';
                const price = offer.price ? `₱${offer.price.toLocaleString()}` : '---';

                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-3'; 
                
                colDiv.innerHTML = `
                    <div class="flight-card w-100" style="opacity: 1; transform: none; transition-delay: ${0.05 * index}s;">
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
                                <span class="flight-price">${price}</span>
                                <button class="btn-flight-select">View Deal</button>
                            </div>
                        </div>
                    </div>
                `;
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
            flightResultsContainer.innerHTML = `
                <div class="carousel-item active">
                    <div class="d-flex flex-column justify-content-center align-items-center text-danger" style="height: 400px;">
                        <i class="bi bi-exclamation-circle" style="font-size: 3rem;"></i>
                        <h5 class="mt-3 text-center px-3">${msg}</h5>
                    </div>
                </div>`;
        }
        toggleCarouselControls(false);
        if (sortContainer) sortContainer.style.display = 'none';
    }

})();