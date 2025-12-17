// view_all.js (Final Version with Robust Date Fix)
document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURATION ---
    const API_KEY = '5559c078d8mshd05aafeafe9af7ap11c3d1jsn9352a8e5b475'; 
    const HOSTS = {
        hotels: 'booking-com15.p.rapidapi.com', 
        flights: 'google-flights2.p.rapidapi.com',
        destinations: 'tripadvisor-scraper.p.rapidapi.com'
    };
    
    // ============================================
    // XOTELO HOTEL SEARCH CONFIGURATION
    // ============================================
    const XOTELO_HOST = 'data.xotelo.com';

    const KNOWN_PH_KEYS = {
        "cebu": "g298460",      
        "manila": "g298573",    
        "boracay": "g294260",   
        "davao": "g298459",     
        "baguio": "g298445",    
        "palawan": "g294255",   
        "el nido": "g294256",   
        "coron": "g1879007",    
        "bohol": "g294259",     
        "panglao": "g1036817", 
        "siargao": "g674645",   
        "tagaytay": "g317121",  
        "makati": "g298450",    
        "vigan": "g424958",     
        "elyu": "g655794",      
        "la union": "g655794",  
    };
    // ============================================


    const LOCATION_MAP = {
        'siargao': 'General Luna', 'bohol': 'Panglao', 'palawan': 'El Nido',
        'elyu': 'San Juan', 'la union': 'San Juan', 'baguio': 'Baguio City'
    };

    const AIRPORT_CODES = {
        'manila': 'MNL', 'cebu': 'CEB', 'clark': 'CRK', 'davao': 'DVO',
        'boracay': 'MPH', 'palawan': 'PPS', 'bohol': 'TAG', 'siargao': 'IAO',
        'coron': 'USU', 'iloilo': 'ILO', 'bacolod': 'BCD'
    };

    // --- DOM ELEMENTS ---
    const grid = document.getElementById('results-grid');
    const loader = document.getElementById('loading-spinner');
    const title = document.getElementById('page-title');
    const searchContainer = document.getElementById('dynamic-search-container');
    const sortPills = document.querySelectorAll('.sort-pill');
    
    // Get Filter Checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-box input[type="checkbox"]');


    // --- STATE ---
    let currentResults = [];     
    let filteredResults = [];    
    let currentCategory = 'flights'; 
    let currentExtras = {}; 
    
    // Default passenger state based on index.php initial values
    let flightPassengers = { adults: 1, children: 0 };
    let hotelGuests = { adults: 1, children: 0 };


    // --- PASSENGER COUNTER LOGIC (Copied from index scripts) ---
    function updateFlightDisplay() {
        const total = flightPassengers.adults + flightPassengers.children;
        document.getElementById('passenger-display').textContent = `${total} Passenger${total > 1 ? 's' : ''}`;
    }

    function updateHotelDisplay() {
        document.getElementById('hotel-guest-display').textContent = 
            `${hotelGuests.adults} Adult${hotelGuests.adults !== 1 ? 's' : ''} · ${hotelGuests.children} Children`;
    }

    window.updateCounter = function(type, passenger, action) {
        let state = type === 'flight' ? flightPassengers : hotelGuests;
        const countId = `count-${type}-${passenger}`;
        const countElement = document.getElementById(countId);
        let currentCount = state[passenger];
        const step = parseInt(action);

        let newCount = currentCount + step;
        
        // Flight constraints (Adults >= 1, Total >= 1)
        if (type === 'flight' && passenger === 'adults' && newCount < 1) newCount = 1;
        
        // Hotel constraints (Adults >= 1)
        if (type === 'hotel' && passenger === 'adults' && newCount < 1) newCount = 1;

        // General constraint (Children >= 0)
        if (passenger === 'children' && newCount < 0) newCount = 0;
        
        if (newCount !== currentCount) {
            state[passenger] = newCount;
            if (countElement) countElement.textContent = newCount;
            
            if (type === 'flight') updateFlightDisplay();
            else updateHotelDisplay();
        }
    }

    // --- INITIALIZATION ---
    const params = new URLSearchParams(window.location.search);
    currentCategory = params.get('category') || 'flights';
    
    // Initialize Passenger State from URL parameters
    flightPassengers.adults = parseInt(params.get('adults')) || 1;
    hotelGuests.adults = parseInt(params.get('adults')) || 1; 

    
    // Setup Listeners
    setupSorting();
    setupFiltering(); 
    
    // Start Search
    if (loader) loader.style.display = 'block';

    // --- MAIN CONTROLLER (Now calls updateUI to set initial state) ---
    (async function init() {
        // Setup Search Button Listeners first (as the HTML is static now)
        document.getElementById('btn-flight-search')?.addEventListener('click', (e) => { e.preventDefault(); window.triggerSearch('flights'); });
        document.getElementById('btn-hotel-search')?.addEventListener('click', (e) => { e.preventDefault(); window.triggerSearch('hotels'); });
        document.getElementById('btn-dest-search')?.addEventListener('click', (e) => { e.preventDefault(); window.triggerSearch('destinations'); });

        try {
            let checkin, checkout; 

            if (currentCategory === 'hotels') {
                const location = params.get('location');
                
                // CRITICAL FIX: Robust Date Normalization for inbound URL parameters
                const raw_ci = params.get('checkin');
                const raw_co = params.get('checkout');
                
                // Function to convert any date string to YYYY-MM-DD, or fallback to default
                const normalizeDate = (dateString, defaultDays) => {
                    if (!dateString) return getNextDate(defaultDays);

                    // 1. If it matches YYYY-MM-DD (standard API format), use it directly
                    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        return dateString;
                    }

                    // 2. Otherwise, try to parse from ambiguous DD/MM/YYYY or MM/DD/YYYY format.
                    const parts = dateString.split(/[-\/]/); 
                    if (parts.length === 3 && parts[2].length === 4) {
                        // Assuming DD/MM/YYYY format based on the observed error pattern
                        const day = parts[0].padStart(2, '0');
                        const month = parts[1].padStart(2, '0');
                        const year = parts[2];
                        return `${year}-${month}-${day}`;
                    }

                    // 3. Fallback 
                    console.warn(`[Date Fix] Failed to normalize date string: ${dateString}. Falling back to default.`);
                    return getNextDate(defaultDays);
                };
                
                checkin = normalizeDate(raw_ci, 1); 
                checkout = normalizeDate(raw_co, 2); 

                // Update params object for consistent use in updateUIFromURL and reload
                params.set('checkin', checkin);
                params.set('checkout', checkout);

                if(location) await loadHotels(location, checkin, checkout); 
                else throw new Error("Missing location");
            } 
            else if (currentCategory === 'flights') {
                const from = params.get('from');
                const to = params.get('to');
                const date = params.get('date') || getNextDate(30);
                const adults = parseInt(params.get('adults')) || 1;
                if(from && to) await loadFlights(from, to, date, adults);
                else throw new Error("Missing flight details");
            } 
            else if (currentCategory === 'destinations') {
                const query = params.get('query');
                if(query) await loadDestinations(query);
                else throw new Error("Missing query");
            }
        } catch (error) {
            console.error("Main Init Error:", error);
            showError(error.message || "An error occurred while fetching data.");
        }
        
        updateUIFromURL(params, currentCategory); // Set initial values and active tab
    })();
    
    
    // NEW: Function to set initial values on the search bar
    function updateUIFromURL(params, activeCategory) {
        // Set the active tab
        const activeTabButton = document.querySelector(`#searchTabs button[data-bs-target="#${activeCategory}"]`);
        if (activeTabButton) {
            activeTabButton.classList.add('active');
        }
        
        const activeTabContent = document.getElementById(activeCategory);
        if (activeTabContent) {
             activeTabContent.classList.add('show', 'active');
        }
        
        if (activeCategory === 'flights') {
            document.getElementById('flight-from').value = params.get('from') || '';
            document.getElementById('flight-to').value = params.get('to') || '';
            document.getElementById('flight-depart').value = params.get('date') || getNextDate(30);
            
            flightPassengers.adults = parseInt(params.get('adults')) || 1;
            if (document.getElementById('count-adults')) document.getElementById('count-adults').textContent = flightPassengers.adults;
            updateFlightDisplay();
            
        } else if (activeCategory === 'hotels') {
            document.getElementById('hotel-input').value = params.get('location') || '';
            
            // Dates are now guaranteed to be YYYY-MM-DD from the init() function above
            document.getElementById('checkin-input').value = params.get('checkin') || getNextDate(1);
            document.getElementById('checkout-input').value = params.get('checkout') || getNextDate(2);
            
            hotelGuests.adults = parseInt(params.get('adults')) || 1;
            if (document.getElementById('count-hotel-adults')) document.getElementById('count-hotel-adults').textContent = hotelGuests.adults;
            updateHotelDisplay();
            
        } else if (activeCategory === 'destinations') {
            document.getElementById('dest-input').value = params.get('query') || '';
        }
        
        // Setup click listeners for the newly added passenger buttons
        document.querySelectorAll('.btn-counter').forEach(button => {
            button.removeEventListener('click', handleCounterClick); // Prevent double listeners
            button.addEventListener('click', handleCounterClick);
        });
    }
    
    // NEW: Counter Click Handler
    function handleCounterClick(e) {
        e.preventDefault();
        const type = e.currentTarget.getAttribute('data-type');
        const passenger = e.currentTarget.getAttribute('data-passenger');
        const action = e.currentTarget.getAttribute('data-action');
        window.updateCounter(type, passenger, action);
    }
    
    // --- FILTERING LOGIC ---
    function setupFiltering() {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // When a filter changes, apply all filters and re-render
                filterResults();
            });
        });
    }

    function filterResults() {
        if (!currentResults || currentResults.length === 0) {
            filteredResults = [];
            renderList(filteredResults, currentCategory, currentExtras);
            return;
        }

        // Get currently active price filter IDs
        const activePriceFilters = Array.from(filterCheckboxes)
            .filter(cb => cb.id.startsWith('f') && cb.checked)
            .map(cb => cb.id);

        // Map filter ID to price range [min, max]
        const priceRanges = {
            'f1': [0, 2500],
            'f2': [2500, 5000],
            'f3': [5000, Infinity]
        };

        // If no price filters are selected, assume all results pass the price filter.
        let tempResults = [...currentResults];
        
        if (activePriceFilters.length > 0) {
            tempResults = currentResults.filter(item => {
                let price;
                
                if (currentCategory === 'flights' && item.price !== undefined) {
                    price = item.price;
                } else if (currentCategory === 'hotels') {
                    // Xotelo hotels data structure (price_ranges.minimum is the price base USD)
                    const usdPrice = item.price_ranges && item.price_ranges.minimum ? item.price_ranges.minimum : undefined;
                    if (usdPrice !== undefined) {
                        price = usdPrice * 50; // Assuming approx PHP 50/USD conversion for filter.
                        console.log(`[Filter Log] Hotel ${item.name} USD: ${usdPrice} -> PHP Estimate: ${price}`); 
                    } else {
                        return true; // Skip price filtering if price data is missing
                    }
                    
                } else {
                    return true; // Skip price filtering if category is destinations
                }

                // Check if the item's price falls into any selected range
                return activePriceFilters.some(filterId => {
                    const [min, max] = priceRanges[filterId] || [0, Infinity];
                    // Use >= min AND (price < max OR max is Infinity for the last bracket)
                    return price >= min && price < max;
                });
            });
        }
        
        filteredResults = tempResults;
        
        // Apply current sort after filtering
        applyCurrentSort(filteredResults);
    }
    
    // --- UPDATED SORTING LOGIC ---
    function applyCurrentSort(results) {
        // Clone the results array before sorting so we don't mutate the global state during filtering/sorting
        let sortedResults = [...results];
        
        // Find the active sort pill
        const activePill = document.querySelector('.sort-pill.active');
        const sortType = activePill ? activePill.getAttribute('data-sort') : 'best';

        // Helper function to get price (used for price_asc)
        const getPrice = (item) => {
            if (currentCategory === 'flights') {
                return item.price || Infinity;
            } else if (currentCategory === 'hotels') {
                // Xotelo price is in USD
                const price = (item.price_ranges && item.price_ranges.minimum) || Infinity;
                if (price !== Infinity) console.log(`[Sort Log] Hotel ${item.name} Price (USD): ${price}`); 
                return price;
            }
            return Infinity;
        }
        
        if (sortType === 'price_asc') {
            // Lowest Price First
            sortedResults.sort((a, b) => getPrice(a) - getPrice(b));
            
        } else if (sortType === 'rating_desc') {
            // Top Reviewed (using shortest duration as a proxy for best flight)
            if (currentCategory === 'flights') {
                sortedResults.sort((a, b) => (a.duration?.raw || Infinity) - (b.duration?.raw || Infinity));
            } else if (currentCategory === 'hotels') {
                 // Use review_summary.rating (higher is better)
                const getRating = (item) => item.review_summary?.rating || item.rating || 0;
                sortedResults.sort((a, b) => getRating(b) - getRating(a));
            }
            // Destinations sorting is out of scope for now
            
        } else if (sortType === 'best') {
            // "Our top picks" - Use the original API order (which is usually optimized/best value by default)
            // We ensure that only items that passed the filter are included, maintaining the original order.
            sortedResults = currentResults.filter(item => results.includes(item));
        }

        // Re-render the list with the sorted/filtered data
        renderList(sortedResults, currentCategory === 'flights' ? 'flight' : (currentCategory === 'hotels' ? 'hotel' : 'destination'), currentExtras);
    }
    // -----------------------------
    
    /**
     * Helper function to convert any date input value (e.g. '20/02/2026' or '2026-02-20') to YYYY-MM-DD
     * This function is used when submitting the form to ensure the URL is clean.
     */
    function formatInputDateForAPI(dateString) {
        if (!dateString) return '';
        
        // Check if it's already in YYYY-MM-DD format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // Attempt to parse from other common formats (e.g., DD/MM/YYYY or MM/DD/YYYY)
        const parts = dateString.split(/[-\/]/); 
        
        if (parts.length === 3 && parts[2].length === 4) {
             // Heuristic: If year is last, assume DD/MM/YYYY is the input order since it's common
            const day = parts[0]; 
            const month = parts[1];
            const year = parts[2];
            
            const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            return normalized;
        }
        
        // Fallback for an unknown format
        return dateString;
    }

    /**
     * Overrides the default search action to fix date formatting for hotels.
     * This ensures the URL contains correct YYYY-MM-DD dates for the next page load.
     */
    window.triggerSearch = function(type) {
        if(type === 'flights') {
            const f = document.getElementById('flight-from').value;
            const t = document.getElementById('flight-to').value;
            const d = document.getElementById('flight-depart').value;
            const adults = flightPassengers.adults + flightPassengers.children; 
            window.location.href = `view_all.php?category=flights&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}&date=${d}&adults=${adults}`;
            
        } else if (type === 'hotels') {
            const l = document.getElementById('hotel-input').value;
            
            // CRITICAL FIX: Get the RAW value from the input and reformat it for the URL
            const raw_ci = document.getElementById('checkin-input').value;
            const raw_co = document.getElementById('checkout-input').value;
            
            const ci = formatInputDateForAPI(raw_ci); // Cleaned Check-in date (YYYY-MM-DD)
            const co = formatInputDateForAPI(raw_co); // Cleaned Check-out date (YYYY-MM-DD)
            
            const adults = hotelGuests.adults + hotelGuests.children; 
            
            // Use the CLEANED dates in the URL
            window.location.href = `view_all.php?category=hotels&location=${encodeURIComponent(l)}&checkin=${ci}&checkout=${co}&adults=${adults}`;
            
        } else if (type === 'destinations') {
            const q = document.getElementById('dest-input').value;
            window.location.href = `view_all.php?category=destinations&query=${encodeURIComponent(q)}`;
        }
    };

    // --- XOTELO API FUNCTIONS (COPIED FROM xotelo.js) ---
    /**
     * Fallback search for unknown keys (used for international or uncommon queries).
     */
    async function fetchLocationKey(query) {
        
        // Attempt 1: location_type=geo (Best for general cities/regions)
        let url = `https://${XOTELO_HOST}/api/search?query=${encodeURIComponent(query)}&location_type=geo`;
        console.log("[Location Search] Attempting GEO search URL:", url); 
        let data = await callSearchApi(url);

        // Attempt 2: location_type=accommodation (If geo fails)
        if (!data || !data.result || !data.result.list || data.result.list.length === 0) {
            url = `https://${XOTELO_HOST}/api/search?query=${encodeURIComponent(query)}&location_type=accommodation`;
            console.log("[Location Search] GEO failed. Attempting ACCOMMODATION search URL:", url); 
            data = await callSearchApi(url);
        }
        
        if (data && data.result && data.result.list && data.result.list.length > 0) {
            let bestMatch = data.result.list.find(item => 
                item.location_key && item.location_key.startsWith('g') && item.location_key.length <= 7
            );
            if (!bestMatch) bestMatch = data.result.list[0];

            return {
                location_key: bestMatch.location_key,
                name: bestMatch.short_place_name || bestMatch.place_name || bestMatch.name
            };
        }
        return null;
    }

    async function callSearchApi(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Xotelo Search API HTTP Error:", response.status, url); 
                return null;
            }
            return await response.json();
        } catch (err) {
            console.error("Xotelo Search API Network Error:", err); 
            return null;
        }
    }
    // ----------------------------------------------------


    // --- API CALLS (loadHotels MODIFIED to use XOTELO logic) ---
    async function loadFlights(from, to, date, adults) {
        const fromCode = AIRPORT_CODES[from.toLowerCase()] || from.toUpperCase().substring(0,3);
        const toCode = AIRPORT_CODES[to.toLowerCase()] || to.toUpperCase().substring(0,3);
        currentExtras = { from: fromCode, to: toCode }; 
        if(title) title.innerText = `Flights from ${fromCode} to ${toCode}`;

        const url = `https://${HOSTS.flights}/api/v1/searchFlights?departure_id=${fromCode}&arrival_id=${toCode}&outbound_date=${date}&currency=PHP&travel_class=ECONOMY&stops=1&adults=${adults}`;
        
        const res = await fetch(url, { headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOSTS.flights } });
        const data = await res.json();
        
        currentResults = [...(data.data?.itineraries?.topFlights || []), ...(data.data?.itineraries?.otherFlights || [])];
        
        if(currentResults.length === 0) showError(`No flights found.`);
        else {
            filteredResults = [...currentResults];
            applyCurrentSort(filteredResults);
        }
    }
    
    /**
     * Handles location resolution and calls the Xotelo list API.
     */
    async function loadHotels(location, checkin, checkout) {
        // Dates (checkin, checkout) are now guaranteed to be YYYY-MM-DD from init()
        console.log(`[Hotel Search] Starting search for: ${location}. Dates (Passed to API): ${checkin} to ${checkout}`); 
        if(title) title.innerText = `Stays in ${location}`;
        
        let destData;
        
        // 1. Hybrid Logic: Check PH Map, 2. Fallback to API Search
        const query = location.trim().toLowerCase();
        if (KNOWN_PH_KEYS[query]) {
            const displayName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            destData = { location_key: KNOWN_PH_KEYS[query], name: displayName };
            console.log(`[Hotel Search] Location found in map: ${destData.name} (${destData.location_key})`); 
        } else {
            destData = await fetchLocationKey(query);
        }
        
        if (!destData || !destData.location_key) {
            console.error(`[Hotel Search] Failed to resolve location key for: ${location}`); 
            throw new Error(`Could not find a place for "${location}". Please check spelling or try a known destination.`);
        }
        
        // Use global hotelGuests state for adults/children count
        const adultsCount = hotelGuests.adults; 
        const childrenCount = hotelGuests.children; 

        // Xotelo API List Call 
        const params = new URLSearchParams({
            location_key: destData.location_key,
            limit: '100', // Fetch more results for the view_all page
            sort: 'popularity', 
            checkin: checkin, 
            checkout: checkout, 
            adults: adultsCount,
            children: childrenCount,
        });

        const url = `https://${XOTELO_HOST}/api/list?${params.toString()}`;
        console.log("[Hotel Search] Final Xotelo API List URL:", url); 

        const hRes = await fetch(url);
        const hData = await hRes.json();
        console.log("[Hotel Search] Final Xotelo API List Response:", hData); 
        
        currentResults = hData.result && hData.result.list ? hData.result.list : (Array.isArray(hData.result) ? hData.result : []);
        
        if(currentResults.length === 0) {
            let errorMessage = `No hotels found in ${destData.name}.`;
            if (hData.error && typeof hData.error === 'string') {
                errorMessage += ` (API Error: ${hData.error})`;
            }
            showError(errorMessage);
        }
        else {
            currentExtras = { locationName: destData.name }; 
            filteredResults = [...currentResults];
            applyCurrentSort(filteredResults);
        }
    }


    async function loadDestinations(query) {
        const mappedQuery = LOCATION_MAP[query.toLowerCase()] || query;
        if(title) title.innerText = `Attractions in ${mappedQuery}`;
        const url = `https://${HOSTS.destinations}/attractions/list?query=${encodeURIComponent(mappedQuery)}&currency=PHP&lang=en_US`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOSTS.destinations } });
        const data = await res.json();
        currentResults = data.results || data.data || [];
        
        filteredResults = [...currentResults];
        applyCurrentSort(filteredResults);
    }

    // --- RENDERER WITH YOUR CSS CLASSES ---
    function renderList(items, type, extras = {}) {
        if (loader) loader.style.display = 'none';
        if (!grid) return;
        
        // Use Grid Layout (Row)
        grid.className = 'row g-4';
        grid.innerHTML = '';
        
        if(items.length === 0) {
            grid.innerHTML = `<div class="alert alert-warning text-center mt-4 col-12"><h4><i class="bi bi-info-circle"></i></h4>No results match your current filters.</div>`;
            return;
        }

        items.forEach(item => {
            const col = document.createElement('div');
            
            // Adjust column width based on content type
            col.className = 'col-md-3 d-flex align-items-stretch'; 

            if (type === 'flight') {
                col.className = 'col-md-3'; // Use 4 columns for flights per row
                const seg = item.flights?.[0] || {};
                // Use a dedicated class for the logo parent, remove inline absolute positioning
                const logo = seg.airline_logo || 'https://placehold.co/50';
                const airline = seg.airline || 'Airline';
                // Split flight number to get the carrier code for the badge
                const flightNumFull = seg.flight_number || '';
                const parts = flightNumFull.split(' ');
                const carrierCode = parts[0] || '';
                const flightNumber = parts.length > 1 ? parts.slice(1).join(' ') : flightNumFull;
                
                const aircraft = seg.aircraft || 'Economy';
                const price = item.price ? `₱${item.price.toLocaleString()}` : 'Check Price';
                const duration = item.duration?.text || 'Direct';
                
                const rawDep = seg.departure_airport?.time;
                const rawArr = seg.arrival_airport?.time;
                const depTime = formatTime(rawDep);
                const arrTime = formatTime(rawArr);

                // --- MODIFIED HTML STRUCTURE TO MATCH IMAGE ---
                col.innerHTML = `
                <div class="flight-card w-100">
                    <div class="flight-card-visual">
                        <span class="duration-badge">${duration}</span>
                        <div class="airline-logo-container">
                            <img src="${logo}" alt="${airline}" class="airline-logo">
                        </div>
                    </div>
                    <div class="flight-info">
                        <div class="flight-route-info">
                            <div class="flight-route">
                                <span>${extras.from}</span>
                                <i class="bi bi-arrow-right" style="color: #2a9d8f;"></i>
                                <span>${extras.to}</span>
                            </div>
                            <div class="flight-time-range">
                                ${depTime} - ${arrTime}
                            </div>
                        </div>
                        
                        <div class="flight-details-bottom">
                             <div class="flight-airline-name">
                                ${airline} <span class="flight-badge">${carrierCode} ${flightNumber}</span>
                            </div>
                            <div class="text-muted small mb-3 text-truncate" style="font-size: 0.7rem;">
                                ${aircraft}
                            </div>

                            <div class="flight-card-footer">
                                <span class="flight-price">${price}</span>
                                <button class="btn-flight-select">View Deal</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            } 
            else if (type === 'hotel') {
                const name = item.name || "Hotel Name";
                const img = item.image || "https://placehold.co/400x500";
                
                let ratingHtml = '';
                let rating = item.review_summary?.rating || item.rating || 0;
                if (rating > 0) {
                    ratingHtml = ` • ${parseFloat(rating).toFixed(1)} ★`;
                }

                let priceText = "Check Rates";
                let priceBaseUSD = item.price_ranges && item.price_ranges.minimum ? item.price_ranges.minimum : 0;
                
                if (priceBaseUSD > 0) {
                    // Displaying in USD as per xotelo.js original render logic
                    priceText = `USD ${Math.round(priceBaseUSD).toLocaleString()}`; 
                }
                

                // Structure from xotelo.js (using <article class="destination-card">)
                col.innerHTML = `
                <article class="destination-card animate-in w-100">
                    <img src="${img}" alt="${name}" loading="lazy" style="height: 250px; object-fit: cover;">
                    <div class="destination-info">
                        <h6 title="${name}" class="text-truncate">${name}</h6>
                        <p class="price">${priceText}${ratingHtml}</p>
                    </div>
                </article>`;
            }
            else if (type === 'destination') {
                const name = item.name;
                const img = item.featured_image || item.thumbnail?.url || "https://placehold.co/400x500";
                const rating = item.rating ? ` • ${item.rating} ★` : '';
                const loc = item.location_string || "Philippines";

                // Reusing destination-card style for consistency
                col.innerHTML = `
                <article class="destination-card animate-in w-100">
                    <img src="${img}" alt="${name}" loading="lazy" style="height: 250px; object-fit: cover;">
                    <div class="destination-info">
                        <h6 title="${name}" class="text-truncate">${name}</h6>
                        <p class="price" style="font-size: 0.9rem; color: #666;">${loc}${rating}</p>
                        <button class="btn btn-sm btn-outline-success mt-2 w-100">Explore</button>
                    </div>
                </article>`;
            }
            grid.appendChild(col);
        });
    }

    // --- UTILITIES ---
    function showError(msg) {
        if(loader) loader.style.display = 'none';
        if(grid) grid.innerHTML = `<div class="alert alert-danger text-center mt-4 col-12"><h4><i class="bi bi-exclamation-circle"></i></h4>${msg}</div>`;
    }
    

    function getNextDate(days) { 
        const d = new Date(); d.setDate(d.getDate() + days); 
        return d.toISOString().split('T')[0]; 
    }

    function formatTime(dateStr) {
        if (!dateStr) return '--:--';
        try {
            const date = new Date(dateStr.replace(/-/g, '/')); 
            if (isNaN(date.getTime())) return dateStr;
            
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return '--:--'; }
    }


    function setupSorting() {
        sortPills.forEach(pill => { 
            pill.addEventListener('click', function() { 
                sortPills.forEach(p => p.classList.remove('active')); 
                this.classList.add('active'); 
                
                filterResults(); 
            }); 
        });
    }
});