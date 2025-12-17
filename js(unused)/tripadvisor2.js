// TRIPADVISOR FINAL SCRIPT - MERGED DATA MODE
// 1. Search Location via Scraper (Get GeoID + High Res Images)
// 2. Get Hotel List via v16 (Get Prices + Ratings)
// 3. Merge Data & Render

console.log('TripAdvisor script loaded - Merged Data Mode');

// ==========================================
// 1. CONFIGURATION
// ==========================================
const API_KEY = '472e3f7851msh356643fa1bb2631p128d26jsn38b54f11b007';
const SCRAPER_HOST = 'tripadvisor-scraper.p.rapidapi.com';
const V16_HOST = 'tripadvisor16.p.rapidapi.com';

const getOptions = (host) => ({
    method: 'GET',
    headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': host
    }
});

// ==========================================
// 2. SELECTORS
// ==========================================
const hotelInput = document.getElementById('hotel-input'); 
const checkInInput = document.getElementById('checkin-input');
const checkOutInput = document.getElementById('checkout-input');
const searchButton = document.querySelector('#hotels .btn-simple-search');
const carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
const sectionTitle = document.querySelector('.destinations-section h2');

// ==========================================
// 3. MAIN LISTENER
// ==========================================
if (searchButton && hotelInput) {
    searchButton.addEventListener('click', function() {
        var query = hotelInput.value.trim(); 
        
        if (!query) { alert('Please enter a destination.'); return; }

        // --- DATE LOGIC ---
        let checkInDate = checkInInput.value;
        let checkOutDate = checkOutInput.value;

        if (!checkInDate || !checkOutDate) {
            checkInDate = getFutureDate(1);
            checkOutDate = getFutureDate(2);
            checkInInput.value = checkInDate;
            checkOutInput.value = checkOutDate;
        }

        console.log(`Searching: "${query}" | Dates: ${checkInDate} to ${checkOutDate}`);

        // UI: Show Loading
        sectionTitle.innerText = `Searching...`;
        carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center" style="height: 450px;"><div class="spinner-border text-success"></div></div></div>';

        // START PROCESS
        findLocationAndMerge(query, checkInDate, checkOutDate);
    });
}

// ==========================================
// STEP 1: FIND LOCATION (Scraper API)
// ==========================================
function findLocationAndMerge(query, checkIn, checkOut) {
    // We search specifically for HOTELS in the query location to get their images upfront
    // Note: The Scraper search endpoint returns a mix of locations and hotels.
    const url = `https://${SCRAPER_HOST}/hotels/search?query=${encodeURIComponent(query)}`;

    fetch(url, getOptions(SCRAPER_HOST))
        .then(res => res.json())
        .then(scraperData => {
            console.log('1. Scraper Response:', scraperData);

            if (scraperData.results && scraperData.results.length > 0) {
                
                // A. Find the Location ID (e.g., "Bohol Island")
                // We prioritize a location that matches the query and is in Philippines
                const locationMatch = scraperData.results.find(item => {
                    const isPH = item.parent_location && item.parent_location.name === 'Philippines';
                    const nameMatch = item.name.toLowerCase().includes(query.toLowerCase());
                    return isPH && nameMatch;
                });

                if (locationMatch) {
                    const geoId = locationMatch.tripadvisor_entity_id;
                    const locationName = locationMatch.name;
                    console.log(`   -> Location Match: ${locationName} (ID: ${geoId})`);

                    // B. Pass the ENTIRE scraper result set to the next step
                    // We will use this array to enrich the v16 data later
                    fetchHotelListV16(geoId, locationName, checkIn, checkOut, scraperData.results);

                } else {
                    console.warn('Location not found in Philippines.');
                    sectionTitle.innerText = `"${query}" not found in Philippines.`;
                    showBackupData(query);
                }
            } else {
                console.warn('Scraper returned no results.');
                showBackupData(query);
            }
        })
        .catch(err => {
            console.error('Scraper API Error:', err);
            showBackupData(query);
        });
}

// ==========================================
// STEP 2: GET HOTEL LIST (v16 API)
// ==========================================
function fetchHotelListV16(geoId, locationName, checkIn, checkOut, scraperResults) {
    sectionTitle.innerText = `Searching...`;

    const url = `https://${V16_HOST}/api/v1/hotels/searchHotels?geoId=${geoId}&checkIn=${checkIn}&checkOut=${checkOut}&pageNumber=1&currencyCode=PHP`;

    fetch(url, getOptions(V16_HOST))
        .then(res => res.json())
        .then(v16Data => {
            console.log('2. v16 Response:', v16Data);

            let v16Hotels = [];
            if (v16Data.data && Array.isArray(v16Data.data.data)) {
                v16Hotels = v16Data.data.data;
            } else if (Array.isArray(v16Data.data)) {
                v16Hotels = v16Data.data;
            }

            // Filter valid hotels from v16
            const validV16Hotels = v16Hotels.filter(item => item.title);

            if (validV16Hotels.length > 0) {
                // --- STEP 3: MERGE DATA ---
                const mergedHotels = mergeDatasets(validV16Hotels, scraperResults);
                renderCarouselSlides(mergedHotels, locationName);
            } else {
                console.warn('v16 returned 0 hotels.');
                showBackupData(locationName);
            }
        })
        .catch(err => {
            console.error('v16 API Error:', err);
            showBackupData(locationName);
        });
}

// ==========================================
// STEP 3: MERGE LOGIC
// ==========================================
function mergeDatasets(v16List, scraperList) {
    console.log('3. Merging Datasets...');
    
    // Create a Lookup Map from Scraper Data (Key: Name, Value: Image URL)
    // We match by NAME because IDs might differ slightly between API versions, 
    // but names are usually consistent enough for a fuzzy match.
    const imageMap = {};
    
    scraperList.forEach(item => {
        if (item.name && item.featured_image) {
            // Normalize name: lowercase, remove spaces/punctuation for better matching
            const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            imageMap[key] = item.featured_image;
        }
    });

    // Enrich v16 Data
    return v16List.map(hotel => {
        const cleanName = hotel.title.replace(/^\d+\.\s*/, ''); // Remove "1. " from v16 title
        const matchKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Try to find a better image from Scraper
        const highResImage = imageMap[matchKey];

        return {
            ...hotel,
            cleanTitle: cleanName,
            // Use Scraper image if found, otherwise keep null (will fall back to v16 thumbnail later)
            mergedImage: highResImage 
        };
    });
}

// ==========================================
// STEP 4: RENDER
// ==========================================
function renderCarouselSlides(hotelList, queryName) {
    sectionTitle.innerText = 'Hotels in ' + queryName;
    carouselInner.innerHTML = ''; 
    var currentSlideRow = null;

    for (var i = 0; i < Math.min(hotelList.length, 12); i++) {
        if (i % 4 === 0) {
            var slideItem = document.createElement('div');
            slideItem.className = (i === 0) ? 'carousel-item active' : 'carousel-item';
            currentSlideRow = document.createElement('div');
            currentSlideRow.className = 'row g-3';
            slideItem.appendChild(currentSlideRow);
            carouselInner.appendChild(slideItem);
        }

        var hotel = hotelList[i];
        var name = hotel.cleanTitle || 'Unknown Hotel';

        // Rating
        var rating = '';
        if (hotel.bubbleRating && hotel.bubbleRating.rating) {
            rating = ` • ⭐ ${hotel.bubbleRating.rating}`;
        }

        // Price
        var priceTag = 'View Rates';
        if (hotel.priceForDisplay) {
            priceTag = hotel.priceForDisplay;
        } else if (hotel.commerceInfo?.priceForDisplay?.text) {
            priceTag = hotel.commerceInfo.priceForDisplay.text;
        }

        // Image Selection Priority:
        // 1. Merged Image (High Res from Scraper)
        // 2. Card Photo (Low Res from v16)
        // 3. Placeholder
        var img = 'https://placehold.co/400x500?text=' + encodeURIComponent(name.substring(0,10));
        
        if (hotel.mergedImage) {
            img = hotel.mergedImage; // Use the high quality one!
        } else if (hotel.cardPhotos && hotel.cardPhotos.length > 0) {
            var photoObj = hotel.cardPhotos[0].sizes;
            if (photoObj && photoObj.urlTemplate) {
                img = photoObj.urlTemplate.replace('{width}', '400').replace('{height}', '500');
            }
        }

        var colDiv = document.createElement('div');
        colDiv.className = 'col-md-3';
        colDiv.innerHTML = `
            <div class="destination-card">
                <img src="${img}" alt="${name}" onerror="this.src='https://placehold.co/400x500?text=Image+Unavailable'">
                <div class="destination-info">
                    <p class="price">${priceTag}${rating}</p>
                    <h6>${name}</h6>
                </div>
            </div>
        `;
        currentSlideRow.appendChild(colDiv);
    }
}

// ==========================================
// HELPERS
// ==========================================
function getFutureDate(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
}

function showBackupData(query) {
    sectionTitle.innerText = 'Hotels in ' + query + ' (Demo Mode)';
    carouselInner.innerHTML = '';
    
    var slideItem = document.createElement('div');
    slideItem.className = 'carousel-item active';
    var row = document.createElement('div');
    row.className = 'row g-3';
    slideItem.appendChild(row);
    carouselInner.appendChild(slideItem);

    for(var i=1; i<=4; i++) {
        var demoImg = 'https://placehold.co/400x500?text=' + encodeURIComponent(query + ' ' + i);
        var colDiv = document.createElement('div');
        colDiv.className = 'col-md-3';
        colDiv.innerHTML = `
            <div class="destination-card">
                <img src="${demoImg}" alt="Demo Hotel">
                <div class="destination-info">
                    <p class="price">₱3,500</p>
                    <h6>${query} Grand Hotel ${i}</h6>
                </div>
            </div>
        `;
        row.appendChild(colDiv);
    }
}