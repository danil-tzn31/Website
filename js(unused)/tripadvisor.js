console.log('TripAdvisor script loaded - Final Verified Mode');

// ==========================================
// 1. CONFIGURATION
// ==========================================
var apiKey = '472e3f7851msh356643fa1bb2631p128d26jsn38b54f11b007';
var v16Host = 'tripadvisor16.p.rapidapi.com';

// ==========================================
// 2. MANUAL LOCATION DICTIONARY (VERIFIED DEC 2025)
// ==========================================
var knownLocations = {
    // --- METRO MANILA ---
    "manila": "298573",       // Metro Manila (The Region - Best for general search)
    "manila city": "294245",  // The City of Manila (Intramuros/Malate area only)
    "makati": "298450",       // Makati City
    "pasay": "298451",        // Pasay City (near Airport/MOA)
    "quezon city": "298452",  // Quezon City
    "paranaque": "298455",    // Parañaque City
    "taguig": "298456",       // Taguig (BGC)

    // --- VISAYAS ---
    "boracay": "294260",      // Boracay Island (Malay, Aklan)
    "cebu": "298460",         // Cebu City (Main City)
    "cebu city": "298460",    
    "mactan": "298461",       // Lapu-Lapu City (This is where Mactan resorts are)
    "lapu lapu": "298461",
    "bohol": "294259",        // Bohol Province (General)
    "panglao": "298448",      // Panglao Island (Beach resorts)
    "dumaguete": "298463",    // Dumaguete City
    "bacolod": "298464",      // Bacolod City
    "iloilo": "298466",       // Iloilo City
    "bantayan":"1218897",   // Bantayan Island

    // --- PALAWAN ---
    "palawan": "294255",      // Palawan Province
    "el nido": "294256",      // El Nido
    "coron": "294257",        // Coron
    "puerto princesa": "294258", // Puerto Princesa City

    // --- LUZON ---
    "baguio": "298445",       // Baguio City
    "tagaytay": "298453",     // Tagaytay City (Cavite)
    "vigan": "424958",        // Vigan City (Ilocos Sur)
    "la union": "655794",     // La Union Province
    "san juan": "656268",     // San Juan (The Surfing Spot in La Union)
    "sagada": "304053",       // Sagada
    "subic": "298458",        // Subic Bay Freeport Zone
    "clark": "298457",        // Clark Freeport Zone (Angeles)

    // --- MINDANAO ---
    "davao": "298459",        // Davao City
    "davao city": "298459",
    "siargao": "678563",      // Siargao Island
    "general santos": "298467", // General Santos City
    "gensan": "298467",
    "cagayan de oro": "298468", // CDO
    "zamboanga": "298472"     // Zamboanga City
};

// ==========================================
// 3. SELECTORS
// ==========================================
var hotelInput = document.getElementById('hotel-input');
var checkInInput = document.getElementById('checkin-input');
var checkOutInput = document.getElementById('checkout-input');
var searchButton = document.querySelector('#hotels .btn-simple-search');
var carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
var sectionTitle = document.querySelector('.destinations-section h2');

// ==========================================
// 4. MAIN LISTENER
// ==========================================
if (searchButton && hotelInput) {
  searchButton.addEventListener('click', function() {
    var query = hotelInput.value.trim();

    if (query === '') {
      alert('Please enter a destination.');
      return;
    }

    // Default Dates
    var checkIn = checkInInput.value;
    var checkOut = checkOutInput.value;

    if (checkIn === '' || checkOut === '') {
      var d1 = new Date();
      d1.setDate(d1.getDate() + 1);
      checkIn = d1.toISOString().split('T')[0];

      var d2 = new Date();
      d2.setDate(d2.getDate() + 2);
      checkOut = d2.toISOString().split('T')[0];
      
      checkInInput.value = checkIn;
      checkOutInput.value = checkOut;
    }

    sectionTitle.innerText = 'Searching for "' + query + '"...';
    carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center" style="height: 450px;"><div class="spinner-border text-success"></div></div></div>';

    var normalizedQuery = query.toLowerCase();
    
    // --- BYPASS CHECK ---
    if (knownLocations[normalizedQuery]) {
        var forcedId = knownLocations[normalizedQuery];
        console.log('Bypassing Search API. Using ID: ' + forcedId);
        getHotelsV16(forcedId, query, checkIn, checkOut);
    } else {
        console.log('Location unknown. Asking API to search...');
        findGeoIdV16(query, checkIn, checkOut);
    }
  });
}

// ==========================================
// STEP 1: API FALLBACK
// ==========================================
function findGeoIdV16(query, checkIn, checkOut) {
  var req = new XMLHttpRequest();
  var url = 'https://' + v16Host + '/api/v1/hotels/searchLocation?query=' + encodeURIComponent(query);
  
  req.open('GET', url);
  req.setRequestHeader('x-rapidapi-key', apiKey);
  req.setRequestHeader('x-rapidapi-host', v16Host);
  
  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        try {
          var response = JSON.parse(this.responseText);
          var data = response.data || response; 
          
          if (data && data.length > 0) {
            var geoId = data[0].geoId || data[0].locationId;
            var name = data[0].title || data[0].name || query;

            if (geoId) {
                console.log('API Found GeoID: ' + geoId);
                getHotelsV16(geoId, name, checkIn, checkOut);
            } else {
                handleError('Could not find Location ID for: ' + query);
            }
          } else {
            handleError('Location not found via API.');
          }
        } catch (e) {
          handleError('Error parsing location data.');
        }
      } else {
        handleError('API Error (Step 1): ' + this.status);
      }
    }
  };
  req.send();
}

// ==========================================
// STEP 2: GET HOTELS
// ==========================================
function getHotelsV16(geoId, locationName, checkIn, checkOut) {
  var req = new XMLHttpRequest();
  var url = 'https://' + v16Host + '/api/v1/hotels/searchHotels?geoId=' + geoId + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&pageNumber=1&currencyCode=PHP';
  
  req.open('GET', url);
  req.setRequestHeader('x-rapidapi-key', apiKey);
  req.setRequestHeader('x-rapidapi-host', v16Host);
  
  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        try {
          var response = JSON.parse(this.responseText);
          var hotels = [];

          if (response.data && response.data.data) {
              hotels = response.data.data;
          } else if (response.data) {
              hotels = response.data;
          }

          if (hotels.length > 0) {
            renderHotelsV16(locationName, hotels);
          } else {
            handleError('No hotels found in ' + locationName);
          }
        } catch (e) {
            handleError('Error parsing hotel list.');
        }
      } else {
        handleError('API Error (Step 2): ' + this.status);
      }
    }
  };
  req.send();
}

// ==========================================
// STEP 3: RENDER
// ==========================================
function renderHotelsV16(locationName, hotelList) {
  var displayName = locationName.charAt(0).toUpperCase() + locationName.slice(1);
  sectionTitle.innerText = 'Hotels in ' + displayName;
  carouselInner.innerHTML = '';
  
  var currentSlideRow = null;
  var limit = 12; 
  if (hotelList.length < limit) limit = hotelList.length;

  for (var i = 0; i < limit; i++) {
    var hotel = hotelList[i];
    
    if (hotel.title) {
        var cleanTitle = hotel.title.replace(/^\d+\.\s*/, '');
        
        // High Res Image Logic
        var displayImage = 'https://placehold.co/400x500?text=' + encodeURIComponent(cleanTitle);
        if (hotel.cardPhotos && hotel.cardPhotos.length > 0) {
             var photo = hotel.cardPhotos[0].sizes;
             if (photo && photo.urlTemplate) {
                 displayImage = photo.urlTemplate.replace('{width}', '600').replace('{height}', '800');
             }
        }

        var price = 'View Rates';
        if (hotel.priceForDisplay) {
            price = hotel.priceForDisplay;
        } else if (hotel.commerceInfo && hotel.commerceInfo.priceForDisplay) {
            price = hotel.commerceInfo.priceForDisplay.text;
        }

        var ratingHtml = '';
        if (hotel.bubbleRating && hotel.bubbleRating.rating) {
            ratingHtml = ' • ★ ' + hotel.bubbleRating.rating + '</span>';
        }

        if (i % 4 === 0) {
            var slide = document.createElement('div');
            if (i === 0) slide.className = 'carousel-item active';
            else slide.className = 'carousel-item';
            currentSlideRow = document.createElement('div');
            currentSlideRow.className = 'row g-3';
            slide.appendChild(currentSlideRow);
            carouselInner.appendChild(slide);
        }

        var col = document.createElement('div');
        col.className = 'col-md-3';
        var card = document.createElement('article');
        card.className = 'destination-card';
        var img = document.createElement('img');
        img.setAttribute('src', displayImage);
        img.setAttribute('alt', cleanTitle);
        var info = document.createElement('div');
        info.className = 'destination-info';
        var h6 = document.createElement('h6');
        h6.innerText = cleanTitle;
        var p = document.createElement('p');
        p.className = 'price';
        p.innerHTML = price + ratingHtml;
        
        info.appendChild(h6);
        info.appendChild(p);
        card.appendChild(img);
        card.appendChild(info);
        col.appendChild(card);
        currentSlideRow.appendChild(col);
    }
  }
}

function handleError(msg) {
    console.error(msg);
    sectionTitle.innerText = msg;
    showBackup();
}

function showBackup() {
    carouselInner.innerHTML = '';
    var slide = document.createElement('div');
    slide.className = 'carousel-item active';
    var row = document.createElement('div');
    row.className = 'row g-3';
    slide.appendChild(row);
    carouselInner.appendChild(slide);

    for(var i=1; i<=4; i++) {
        var col = document.createElement('div');
        col.className = 'col-md-3';
        col.innerHTML = `
            <article class="destination-card">
                <img src="https://placehold.co/400x500?text=Demo+${i}" alt="Demo">
                <div class="destination-info">
                    <h6>Demo Hotel ${i}</h6>
                    <p class="price">₱4,500</p>
                </div>
            </article>
        `;
        row.appendChild(col);
    }
}