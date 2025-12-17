// ============================================
// XOTELO HOTEL SEARCH SCRIPT (With Sorting)
// ============================================

(function() { // Wrap in IIFE to prevent global variable conflicts

// 1. CONFIGURATION & STATE
// ============================================
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

// --- RAPIDAPI CONFIGURATION ---
const RAPIDAPI_HOST = 'xotelo-hotel-prices.p.rapidapi.com';
const RAPIDAPI_KEY = '5559c078d8mshd05aafeafe9af7ap11c3d1jsn9352a8e5b475'; 
const XOTELO_BASE_URL = `https://${RAPIDAPI_HOST}`;

// Global State
let currentSearchParams = {}; 
let hotelGuests = { adults: 1, children: 0 };
let currentHotelData = []; // Store fetched data here for sorting
let currentSortMode = 'best';

// DOM Elements
const hotelInput = document.getElementById('hotel-input');
const checkInInput = document.getElementById('checkin-input');
const checkOutInput = document.getElementById('checkout-input');
const searchButton = document.querySelector('#hotels .btn-simple-search');
const carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
const sectionTitle = document.querySelector('.destinations-section h2');

// Sorting Elements
const hotelSortContainer = document.getElementById('hotel-sort-container');
const sortPills = document.querySelectorAll('#hotel-sort-container .sort-pill');

// 2. HELPER FUNCTIONS
// ============================================

function updateHotelDisplay() {
    const display = document.getElementById('hotel-guest-display');
    if (display) {
        display.textContent = 
            `${hotelGuests.adults} Adult${hotelGuests.adults !== 1 ? 's' : ''} · ${hotelGuests.children} Children`;
    }
}

window.updateHotelGuests = function(passenger, step) {
    const countId = `count-hotel-${passenger}`;
    const countElement = document.getElementById(countId);
    let currentCount = hotelGuests[passenger];
    let newCount = currentCount + step;

    if (passenger === 'adults' && newCount < 1) newCount = 1;
    if (passenger === 'children' && newCount < 0) newCount = 0;
    if (passenger === 'adults' && newCount > 32) newCount = 32;

    if (newCount !== currentCount) {
        hotelGuests[passenger] = newCount;
        if (countElement) countElement.textContent = newCount;
        updateHotelDisplay();
    }
};

function getFutureDate(days, baseDateString = null) {
    const date = baseDateString 
        ? new Date(baseDateString + 'T00:00:00Z') 
        : new Date();
    
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0]; 
}

function formatDateToISO(dateString) {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    const dmy = dateString.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (dmy) {
        return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    return ''; 
}

function handleError(message) {
    if(sectionTitle) sectionTitle.innerText = "Search Results";
    if(carouselInner) {
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="d-flex justify-content-center align-items-center text-danger flex-column" style="height: 450px;">
                    <i class="bi bi-exclamation-circle" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                    <h5>${message}</h5>
                </div>
            </div>`;
    }
    // Hide sort controls on error
    if(hotelSortContainer) hotelSortContainer.style.display = 'none';
    toggleCarouselControls(false);
}

function toggleCarouselControls(show) {
    const prev = document.querySelector('#destinationsCarousel .carousel-control-prev');
    const next = document.querySelector('#destinationsCarousel .carousel-control-next');
    if (prev && next) {
        prev.style.display = show ? 'block' : 'none';
        next.style.display = show ? 'block' : 'none';
    }
}


// 3. MAIN SEARCH LOGIC
// ============================================

if (searchButton && hotelInput) {
    updateHotelDisplay();
    setupSortingListeners(); // Initialize sorting clicks
    
    searchButton.addEventListener('click', async function(e) {
        e.preventDefault(); 
        
        console.clear();
        console.log("[DEBUG] Search Button Clicked");

        const query = hotelInput.value.trim().toLowerCase();
        if (!query) { alert('Please enter a destination.'); return; }

        // Hide sorting while searching
        if(hotelSortContainer) hotelSortContainer.style.display = 'none';
        toggleCarouselControls(false);

        // --- DATE LOGIC ---
        const tomorrowStr = getFutureDate(1);
        let rawCheckIn = checkInInput.value;
        let rawCheckOut = checkOutInput.value;
        let checkIn = formatDateToISO(rawCheckIn);
        let checkOut = formatDateToISO(rawCheckOut);

        // Validate defaults
        if (!checkIn || checkIn < tomorrowStr) {
            checkIn = tomorrowStr;
            checkInInput.value = checkIn;
        }

        if (!checkOut || checkOut <= checkIn) {
            checkOut = getFutureDate(1, checkIn); 
            checkOutInput.value = checkOut;
        }
        
        currentSearchParams = {
            checkin: checkIn,
            checkout: checkOut,
            adults: hotelGuests.adults,
            children: hotelGuests.children
        };

        // UI Loading
        if(sectionTitle) sectionTitle.innerText = `Searching stays in ${query}...`;
        if(carouselInner) {
            carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="d-flex justify-content-center align-items-center flex-column" style="height: 450px;">
                    <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
                    <p class="text-muted">Finding best prices...</p>
                </div>
            </div>`;
        }

        try {
            let destData;
            if (KNOWN_PH_KEYS[query]) {
                const displayName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                destData = { location_key: KNOWN_PH_KEYS[query], name: displayName };
            } else {
                destData = await fetchLocationKey(query);
            }
            
            if (destData && destData.location_key) {
                console.log(`[DEBUG] Location Found: ${destData.name}`);
                await fetchHotelList(destData.location_key, destData.name);
            } else {
                handleError(`Could not find a place for "${query}". Please check spelling.`);
            }
        } catch (error) {
            console.error('[DEBUG] Critical Error:', error);
            handleError('An unexpected error occurred. Please check console.');
        }
    });
}

// 4. SORTING LOGIC
// ============================================
function setupSortingListeners() {
    if (!sortPills) return;
    
    sortPills.forEach(pill => {
        pill.addEventListener('click', function() {
            // UI Update
            sortPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Logic Update
            currentSortMode = this.getAttribute('data-sort');
            applySort(currentHotelData);
        });
    });
}

function applySort(data) {
    if (!data || data.length === 0) return;

    // Create a copy to sort
    let sorted = [...data];

    if (currentSortMode === 'price_asc') {
        // Sort Low to High. Note: Some prices might be 0/null, move them to bottom
        sorted.sort((a, b) => {
            const pA = a.finalPrice || Infinity;
            const pB = b.finalPrice || Infinity;
            return pA - pB;
        });
    } else if (currentSortMode === 'rating_desc') {
        // Sort High to Low
        sorted.sort((a, b) => {
            const rA = a.ratingVal || 0;
            const rB = b.ratingVal || 0;
            return rB - rA;
        });
    } 
    // 'best' does nothing (keeps API order)

    renderCarousel(sorted);
}


// 5. API CALLS
// ============================================

async function callXoteloApi(url, headers = {}) {
    try {
        const defaultHeaders = {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
            ...headers
        };
        
        const fullUrl = url.startsWith('http') ? url : XOTELO_BASE_URL + url;
        const response = await fetch(fullUrl, { headers: defaultHeaders });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error("[DEBUG] Network Error:", err);
        return null;
    }
}

async function fetchLocationKey(query) {
    const baseUrl = `/api/search?query=${encodeURIComponent(query)}`;
    
    // Try geo
    let data = await callXoteloApi(baseUrl + `&location_type=geo`);
    
    // Try accommodation fallback
    if (!data || !data.result || !data.result.list || data.result.list.length === 0) {
        data = await callXoteloApi(baseUrl + `&location_type=accommodation`);
    }
    
    if (data && data.result && data.result.list && data.result.list.length > 0) {
        let bestMatch = data.result.list.find(item => 
            item.location_key && item.location_key.startsWith('g') && item.location_key.length <= 7
        );
        if (!bestMatch) bestMatch = data.result.list[0];
        
        if(bestMatch.location_key) {
            return {
                location_key: bestMatch.location_key,
                name: bestMatch.short_place_name || bestMatch.place_name || bestMatch.name
            };
        }
    }
    return null;
}

async function fetchHotelList(locationKey, locationName) {
    // Fetch 24 items to allow for 6 pages of slides
    const params = new URLSearchParams({
        location_key: locationKey,
        limit: '24', 
        sort: 'popularity' 
    });

    const url = `/api/list?${params.toString()}`;
    if(sectionTitle) sectionTitle.innerText = `Fetching hotels in ${locationName}...`;

    const data = await callXoteloApi(url); 
    
    if (data && data.error) {
        handleError(`Error listing hotels: ${data.error.message || data.error}`);
        return;
    }

    const hotels = data && data.result && data.result.list ? data.result.list : [];
    
    if (hotels.length > 0) {
        processAndRenderHotels(hotels, locationName);
    } else {
        handleError(`No hotels found in ${locationName}.`);
    }
}

async function fetchHotelRates(hotelKey) {
    const { checkin, checkout, adults, children } = currentSearchParams;
    
    const params = new URLSearchParams({
        hotel_key: hotelKey,
        chk_in: checkin,
        chk_out: checkout,
        adults: adults.toString(),
        age_of_children: Array(children).fill('0').join(','),
        rooms: '1', 
        currency: 'USD'
    });

    const url = `/api/rates?${params.toString()}`;
    
    try {
        const data = await callXoteloApi(url);
        if (data && data.result && data.result.rates && data.result.rates.length > 0) {
            const minimumRate = data.result.rates.reduce((min, rate) => 
                (rate.rate > 0 && rate.rate < min) ? rate.rate : min, Infinity);
            return minimumRate === Infinity ? 0 : minimumRate;
        }
        return 0; 
    } catch (err) {
        return 0; 
    }
}

// 6. PROCESSING & RENDERING
// ============================================

async function processAndRenderHotels(hotels, locationName) {
    if(sectionTitle) sectionTitle.innerText = `Top Stays in: ${locationName}`;
    
    const maxItems = hotels.length;
    console.log(`[DEBUG] Fetching rates for ${maxItems} hotels...`);
    
    // Wait for ALL rates to finish fetching
    const ratePromises = hotels.map(hotel => fetchHotelRates(hotel.key));
    const rates = await Promise.all(ratePromises);

    // MERGE Data into a single structure we can sort later
    currentHotelData = hotels.map((hotel, index) => {
        const rate = rates[index];
        let finalPrice = 0;
        let priceText = "Check Rates";

        // Logic to determine price text
        if (rate > 0) {
            finalPrice = rate;
            priceText = `USD ${Math.round(rate).toLocaleString()}`;
        } else {
            // Fallback to cached price if live rate fails
            const fallbackPrice = hotel.price_ranges && hotel.price_ranges.minimum ? hotel.price_ranges.minimum : 0;
            if (fallbackPrice > 0) {
                 finalPrice = fallbackPrice;
                 priceText = `USD ${Math.round(fallbackPrice).toLocaleString()} (Est.)`;
            }
        }

        const ratingVal = hotel.review_summary && hotel.review_summary.rating ? parseFloat(hotel.review_summary.rating) : (parseFloat(hotel.rating) || 0);

        return {
            name: hotel.name || "Unknown Hotel",
            imageUrl: hotel.image || 'https://placehold.co/400x500?text=No+Image',
            finalPrice: finalPrice,
            priceText: priceText,
            ratingVal: ratingVal,
            ratingHtml: ratingVal > 0 ? ` &nbsp;•&nbsp; ${ratingVal.toFixed(1)} ★` : ''
        };
    });

    // Reset UI for "Best" by default
    currentSortMode = 'best';
    sortPills.forEach(p => p.classList.remove('active'));
    if(sortPills.length > 0) sortPills[0].classList.add('active');

    // Show Sort Controls
    if (hotelSortContainer) hotelSortContainer.style.display = 'block';

    // Initial Render
    applySort(currentHotelData);
}

function renderCarousel(data) {
    if(carouselInner) carouselInner.innerHTML = ''; 
    let currentRow = null;

    for (let i = 0; i < data.length; i++) {
        const hotel = data[i];

        // --- CAROUSEL SLIDE GENERATION ---
        // Create new slide every 4 items
        if (i % 4 === 0) {
            const slideItem = document.createElement('div');
            slideItem.className = (i === 0) ? 'carousel-item active' : 'carousel-item';
            
            currentRow = document.createElement('div');
            currentRow.className = 'row g-3';
            slideItem.appendChild(currentRow);
            carouselInner.appendChild(slideItem);
        }

        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-3';
        const delay = (i % 4) * 0.1; // Stagger animation

        // INJECT RESULTS INTO CARD
        colDiv.innerHTML = `
            <article class="destination-card animate-in" style="transition-delay: ${delay}s;">
                <img src="${hotel.imageUrl}" alt="${hotel.name}" loading="lazy">
                <div class="destination-info">
                    <h6 title="${hotel.name}">${hotel.name}</h6>
                    <p class="price">${hotel.priceText}${hotel.ratingHtml}</p>
                </div>
            </article>
        `;
        currentRow.appendChild(colDiv);
    }
    
    toggleCarouselControls(data.length > 4);
}

})(); // End IIFE