// ============================================
// SEARCH HANDLER - Hotels, Flights, Destinations
// ============================================

// Sample data for different categories
const hotelData = [
    {
        name: "Henann Regency Resort & Spa",
        location: "Boracay",
        price: "₱4,500.00",
        rating: "4.8",
        image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        amenities: "Pool, Beach Access, Restaurant"
    },
    {
        name: "El Nido Resorts",
        location: "Palawan",
        price: "₱5,200.00",
        rating: "4.9",
        image: "https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        amenities: "Private Beach, Spa, Diving"
    },
    {
        name: "Crimson Resort & Spa",
        location: "Cebu",
        price: "₱3,800.00",
        rating: "4.7",
        image: "https://images.pexels.com/photos/584302/pexels-photo-584302.jpeg",
        amenities: "Pool, Gym, Restaurant"
    },
    {
        name: "Nay Palad Hideaway",
        location: "Siargao",
        price: "₱4,100.00",
        rating: "4.8",
        image: "https://images.unsplash.com/photo-1722704629854-ed679b4b81b4?w=600&auto=format&fit=crop&q=60",
        amenities: "Beachfront, Surfing, Bar"
    },
    {
        name: "The Manor at Camp John Hay",
        location: "Baguio",
        price: "₱2,500.00",
        rating: "4.5",
        image: "https://images.pexels.com/photos/943927/pexels-photo-943927.jpeg",
        amenities: "Mountain View, Golf, Restaurant"
    },
    {
        name: "Marco Polo Davao",
        location: "Davao",
        price: "₱4,800.00",
        rating: "4.6",
        image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        amenities: "City View, Pool, Spa"
    },
    {
        name: "Amorita Resort",
        location: "Bohol",
        price: "₱4,300.00",
        rating: "4.7",
        image: "https://images.pexels.com/photos/3601422/pexels-photo-3601422.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        amenities: "Infinity Pool, Beach, Restaurant"
    },
    {
        name: "Hotel Luna",
        location: "Vigan",
        price: "₱3,200.00",
        rating: "4.4",
        image: "https://images.pexels.com/photos/161815/manila-city-urban-philippines-161815.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        amenities: "Heritage Site, Museum, Restaurant"
    }
];

const flightData = [
    {
        airline: "Philippine Airlines",
        route: "Manila → Boracay (Caticlan)",
        price: "₱3,200.00",
        duration: "1h 15m",
        image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        departure: "08:00 AM"
    },
    {
        airline: "Cebu Pacific",
        route: "Manila → Palawan (Puerto Princesa)",
        price: "₱2,800.00",
        duration: "1h 20m",
        image: "https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        departure: "09:30 AM"
    },
    {
        airline: "AirAsia",
        route: "Manila → Cebu",
        price: "₱2,100.00",
        duration: "1h 25m",
        image: "https://images.pexels.com/photos/584302/pexels-photo-584302.jpeg",
        departure: "07:45 AM"
    },
    {
        airline: "Philippine Airlines",
        route: "Manila → Siargao",
        price: "₱3,500.00",
        duration: "2h 10m",
        image: "https://images.unsplash.com/photo-1722704629854-ed679b4b81b4?w=600&auto=format&fit=crop&q=60",
        departure: "10:00 AM"
    }
];

const destinationData = [
    {
        name: "Boracay Island",
        description: "White sand beaches and crystal clear waters",
        price: "₱4,500.00",
        image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        activities: "Beach, Water Sports, Nightlife"
    },
    {
        name: "El Nido, Palawan",
        description: "Stunning lagoons and limestone cliffs",
        price: "₱5,200.00",
        image: "https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=1",
        activities: "Island Hopping, Snorkeling, Kayaking"
    },
    {
        name: "Cebu City",
        description: "Historical sites and beautiful beaches",
        price: "₱3,800.00",
        image: "https://images.pexels.com/photos/584302/pexels-photo-584302.jpeg",
        activities: "Diving, History, Shopping"
    },
    {
        name: "Siargao Island",
        description: "Surfing paradise and island adventures",
        price: "₱4,100.00",
        image: "https://images.unsplash.com/photo-1722704629854-ed679b4b81b4?w=600&auto=format&fit=crop&q=60",
        activities: "Surfing, Island Tours, Beach"
    }
];

// Store original content
let isShowingResults = false;
let originalContent = '';

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Store original content
    const destinationsSection = document.querySelector('.destinations-section .container');
    if (destinationsSection) {
        originalContent = destinationsSection.innerHTML;
    }

    // Search buttons
    const searchButtons = document.querySelectorAll('.btn-simple-search');
    searchButtons.forEach(button => {
        button.addEventListener('click', handleSearch);
    });

    // Search inputs - trigger on Enter key
    const searchInputs = document.querySelectorAll('.simple-search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    });

    // Tab changes - reset to original when switching tabs
    const tabs = document.querySelectorAll('.search-tabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            resetToOriginal();
        });
    });
});

// Handle search
function handleSearch() {
    const activeTab = document.querySelector('.search-tabs .nav-link.active');
    const activeInput = document.querySelector('.tab-pane.show.active .simple-search-input');
    
    if (!activeTab || !activeInput) return;
    
    const searchQuery = activeInput.value.trim().toLowerCase();
    const tabType = activeTab.textContent.trim().toLowerCase();
    
    if (searchQuery === '') {
        alert('Please enter a search term');
        return;
    }

    // Scroll to results
    document.querySelector('.destinations-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    // Show results based on tab type
    setTimeout(() => {
        if (tabType === 'hotels') {
            showHotelResults(searchQuery);
        } else if (tabType === 'flights') {
            showFlightResults(searchQuery);
        } else if (tabType === 'destinations') {
            showDestinationResults(searchQuery);
        }
    }, 500);
}

// Show hotel results
function showHotelResults(query) {
    const filtered = hotelData.filter(hotel => 
        hotel.name.toLowerCase().includes(query) || 
        hotel.location.toLowerCase().includes(query)
    );

    const resultsHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>Search Results</h2>
                <p class="text-muted mb-0">Found ${filtered.length} hotels matching "${query}"</p>
            </div>
            <button class="btn btn-outline-secondary" onclick="resetToOriginal()">
                <i class="fas fa-times"></i> Clear Search
            </button>
        </div>
        
        <div class="row g-3">
            ${filtered.length > 0 ? filtered.map(hotel => `
                <div class="col-md-3">
                    <div class="destination-card">
                        <img src="${hotel.image}" alt="${hotel.name}">
                        <div class="destination-info">
                            <h6>${hotel.name}</h6>
                            <p class="price">From ${hotel.price}</p>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="col-12"><div class="alert alert-info">No hotels found matching your search.</div></div>'}
        </div>
    `;

    updateResultsSection(resultsHTML);
    isShowingResults = true;
}

// Show flight results
function showFlightResults(query) {
    const filtered = flightData.filter(flight => 
        flight.airline.toLowerCase().includes(query) || 
        flight.route.toLowerCase().includes(query)
    );

    const resultsHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>Search Results</h2>
                <p class="text-muted mb-0">Found ${filtered.length} flights matching "${query}"</p>
            </div>
            <button class="btn btn-outline-secondary" onclick="resetToOriginal()">
                <i class="fas fa-times"></i> Clear Search
            </button>
        </div>
        
        <div class="row g-3">
            ${filtered.length > 0 ? filtered.map(flight => `
                <div class="col-md-3">
                    <div class="destination-card">
                        <img src="${flight.image}" alt="${flight.airline}">
                        <div class="destination-info">
                            <h6>${flight.route}</h6>
                            <p class="price">From ${flight.price}</p>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="col-12"><div class="alert alert-info">No flights found matching your search.</div></div>'}
        </div>
    `;

    updateResultsSection(resultsHTML);
    isShowingResults = true;
}

// Show destination results
function showDestinationResults(query) {
    const filtered = destinationData.filter(dest => 
        dest.name.toLowerCase().includes(query) || 
        dest.description.toLowerCase().includes(query)
    );

    const resultsHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>Search Results</h2>
                <p class="text-muted mb-0">Found ${filtered.length} destinations matching "${query}"</p>
            </div>
            <button class="btn btn-outline-secondary" onclick="resetToOriginal()">
                <i class="fas fa-times"></i> Clear Search
            </button>
        </div>
        
        <div class="row g-3">
            ${filtered.length > 0 ? filtered.map(dest => `
                <div class="col-md-3">
                    <div class="destination-card">
                        <img src="${dest.image}" alt="${dest.name}">
                        <div class="destination-info">
                            <h6>${dest.name}</h6>
                            <p class="price">From ${dest.price}</p>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="col-12"><div class="alert alert-info">No destinations found matching your search.</div></div>'}
        </div>
    `;

    updateResultsSection(resultsHTML);
    isShowingResults = true;
}

// Update the results section
function updateResultsSection(html) {
    const destinationsSection = document.querySelector('.destinations-section .container');
    if (destinationsSection) {
        destinationsSection.innerHTML = html;
    }
}

// Reset to original Popular Destinations
function resetToOriginal() {
    const destinationsSection = document.querySelector('.destinations-section .container');
    if (destinationsSection && originalContent) {
        destinationsSection.innerHTML = originalContent;
        isShowingResults = false;
        
        // Clear search inputs
        const searchInputs = document.querySelectorAll('.simple-search-input');
        searchInputs.forEach(input => input.value = '');
    }
}