// ============================================
// BOOKING.COM HOTEL SEARCH SCRIPT
// Layout: Simple Price + Rating (★)
// ============================================

console.log('Booking.com script loaded');

// API Configuration
const API_KEY = '5559c078d8mshd05aafeafe9af7ap11c3d1jsn9352a8e5b475';
const BOOKING_HOST = 'booking-com15.p.rapidapi.com';

const getBookingOptions = () => ({
    method: 'GET',
    headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': BOOKING_HOST
    }
});

// Elements
const hotelInput = document.getElementById('hotel-input');
const checkInInput = document.getElementById('checkin-input');
const checkOutInput = document.getElementById('checkout-input');
const searchButton = document.querySelector('#hotels .btn-simple-search');
const carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
const sectionTitle = document.querySelector('.destinations-section h2');

// Search Event Listener
if (searchButton && hotelInput) {
    searchButton.addEventListener('click', async function(e) {
        e.preventDefault(); 

        const query = hotelInput.value.trim();
        if (!query) { alert('Please enter a destination.'); return; }

        // Date Validation
        const today = new Date().toISOString().split('T')[0];
        let checkIn = checkInInput.value;
        let checkOut = checkOutInput.value;

        if (!checkIn || checkIn < today) {
            checkIn = getFutureDate(1);
            checkInInput.value = checkIn;
        }
        if (!checkOut || checkOut <= checkIn) {
            checkOut = getFutureDate(2);
            checkOutInput.value = checkOut;
        }

        // Loading UI
        if(sectionTitle) sectionTitle.innerText = `Searching stays in ${query}...`;
        if(carouselInner) {
            carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="d-flex justify-content-center align-items-center flex-column" style="height: 450px;">
                    <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
                    <p class="text-muted">Finding the best rates...</p>
                </div>
            </div>`;
        }

        try {
            // Step 1: Get Location ID
            const destData = await fetchDestinationId(query);
            
            if (destData) {
                console.log(`[Dest Found] ${destData.label}`);
                // Step 2: Fetch Hotels
                await fetchHotels(destData.dest_id, destData.search_type, checkIn, checkOut, destData.label);
            } else {
                handleError(`Could not find location "${query}". Try adding "Philippines".`);
            }
        } catch (error) {
            console.error('[Search Error]', error);
            handleError('An error occurred. Please check your connection.');
        }
    });
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchDestinationId(query) {
    const url = `https://${BOOKING_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url, getBookingOptions());
        const data = await response.json();

        if (data.status && data.data && data.data.length > 0) {
            let bestMatch = data.data.find(item => 
                (item.country === 'Philippines') || 
                (item.cc1 === 'ph') ||
                (item.label && item.label.toLowerCase().includes('philippines'))
            );
            if (!bestMatch) bestMatch = data.data[0];

            return {
                dest_id: bestMatch.dest_id,
                search_type: bestMatch.search_type,
                label: bestMatch.label || bestMatch.name
            };
        }
        return null;
    } catch (err) {
        console.error("Dest API Failed", err);
        return null;
    }
}

async function fetchHotels(destId, searchType, checkIn, checkOut, locationName) {
    const params = new URLSearchParams({
        dest_id: destId,
        search_type: searchType,
        arrival_date: checkIn,
        departure_date: checkOut,
        adults: '1',
        children_age: '0,17',
        room_qty: '1',
        currency_code: 'USD',
        units: 'metric'
    });

    const url = `https://${BOOKING_HOST}/api/v1/hotels/searchHotels?${params.toString()}`;

    try {
        const response = await fetch(url, getBookingOptions());
        const data = await response.json();

        if (data.status && data.data && data.data.hotels && data.data.hotels.length > 0) {
            renderHotels(data.data.hotels, locationName);
        } else {
            handleError(`No hotels found in ${locationName} for these dates.`);
        }
    } catch (err) {
        console.error("Hotel API Failed", err);
        handleError("Failed to retrieve hotel data.");
    }
}

// ============================================
// RENDER FUNCTION (Price + Rating Star)
// ============================================

function renderHotels(hotels, locationName) {
    if(sectionTitle) sectionTitle.innerText = `Top Stays in: ${locationName}`;
    if(carouselInner) carouselInner.innerHTML = ''; 
    
    const maxItems = Math.min(hotels.length, 12);
    let currentRow = null;

    for (let i = 0; i < maxItems; i++) {
        const hotel = hotels[i].property; 
        const name = hotel.name || "Unknown Hotel";
        
        // Price Logic
        let priceText = "Check Rates";
        if (hotel.priceBreakdown && hotel.priceBreakdown.grossPrice) {
            const val = Math.round(hotel.priceBreakdown.grossPrice.value);
            priceText = `USD ${val.toLocaleString()}`;
        }

        // Rating Logic (Simple Text with Star)
        let ratingHtml = '';
        if (hotel.reviewScore) {
            ratingHtml = ` &nbsp;•&nbsp; ${hotel.reviewScore} ★`;
        }

        // Image Logic
        let imageUrl = 'https://placehold.co/400x500?text=No+Image';
        if (hotel.photoUrls && hotel.photoUrls.length > 0) {
            imageUrl = hotel.photoUrls[0];
        }

        // Carousel Logic
        if (i % 4 === 0) {
            const slideItem = document.createElement('div');
            slideItem.className = (i === 0) ? 'carousel-item active' : 'carousel-item';
            currentRow = document.createElement('div');
            currentRow.className = 'row g-3';
            slideItem.appendChild(currentRow);
            carouselInner.appendChild(slideItem);
        }

        // Card HTML Structure
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-3';
        
        colDiv.innerHTML = `
            <article class="destination-card animate-in">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
                
                <div class="destination-info">
                    <h6 title="${name}">${name}</h6>
                    <p class="price">${priceText}${ratingHtml}</p>
                </div>
            </article>
        `;
        
        currentRow.appendChild(colDiv);
    }
}

// ============================================
// HELPERS
// ============================================

function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; 
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
}