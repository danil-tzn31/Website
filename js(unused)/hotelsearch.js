console.log('TripAdvisor script loaded - Optimized Mode');

// ==========================================
// CONFIGURATION
// ==========================================
var apiKey = '52f7cf1586msh55c6872a1c10c08p1c127cjsn19c27e52187c';
var scraperHost = 'tripadvisor-scraper.p.rapidapi.com';
var v16Host = 'tripadvisor16.p.rapidapi.com';

// ==========================================
// SELECTORS
// ==========================================
var hotelInput = document.getElementById('hotel-input');
var checkInInput = document.getElementById('checkin-input');
var checkOutInput = document.getElementById('checkout-input');
var searchButton = document.querySelector('#hotels .btn-simple-search');
var carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
var sectionTitle = document.querySelector('.destinations-section h2');

// ==========================================
// EVENT LISTENER
// ==========================================
if (searchButton && hotelInput) {
  searchButton.addEventListener('click', function() {
    var query = hotelInput.value.trim();

    if (query === '') {
      alert('Please enter a destination.');
      return;
    }

    // Set default dates if empty
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

    // Update UI
    sectionTitle.innerHTML = 'Searching for "' + query + '"...';
    // Use a simple loading text for speed
    carouselInner.innerHTML = '<div class="carousel-item active"><div style="height:450px; display:flex; align-items:center; justify-content:center;"><h3>Loading Best Rates...</h3></div></div>';

    // Start Process
    findLocation(query, checkIn, checkOut);
  });
}

// ==========================================
// STEP 1: FIND LOCATION ID (Scraper API)
// ==========================================
function findLocation(query, checkIn, checkOut) {
  var req = new XMLHttpRequest();
  // We use the scraper just to find the GeoID
  var url = 'https://' + scraperHost + '/hotels/search?query=' + encodeURIComponent(query);
  
  req.open('GET', url);
  req.setRequestHeader('x-rapidapi-key', apiKey);
  req.setRequestHeader('x-rapidapi-host', scraperHost);
  
  req.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        var response = JSON.parse(this.responseText);
        var results = response.results;
        var locationId = null;
        var locationName = '';

        // Optimization: Quick loop to find Philippines match
        if (results && results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            var item = results[i];
            if (item.parent_location && item.parent_location.name === 'Philippines') {
                 if (item.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                     locationId = item.tripadvisor_entity_id;
                     locationName = item.name;
                     break;
                 }
            }
          }
        }

        if (locationId) {
          getHotelDetails(locationId, locationName, checkIn, checkOut, results);
        } else {
          sectionTitle.innerHTML = 'Location not found';
          carouselInner.innerHTML = '';
        }
    }
  };
  req.send();
}

// ==========================================
// STEP 2: GET HOTEL LIST (v16 API)
// ==========================================
function getHotelDetails(geoId, name, checkIn, checkOut, scraperImages) {
  var req = new XMLHttpRequest();
  var url = 'https://' + v16Host + '/api/v1/hotels/searchHotels?geoId=' + geoId + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&pageNumber=1&currencyCode=PHP';
  
  req.open('GET', url);
  req.setRequestHeader('x-rapidapi-key', apiKey);
  req.setRequestHeader('x-rapidapi-host', v16Host);
  
  req.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        var response = JSON.parse(this.responseText);
        var hotels = [];

        if (response.data && response.data.data) {
            hotels = response.data.data;
        } else if (response.data) {
            hotels = response.data;
        }

        if (hotels.length > 0) {
          renderHotels(name, hotels, scraperImages);
        } else {
          sectionTitle.innerHTML = 'No hotels found in ' + name;
        }
    }
  };
  req.send();
}

// ==========================================
// STEP 3: OPTIMIZED RENDER
// ==========================================
function renderHotels(locationName, hotelList, scraperImages) {
  sectionTitle.innerHTML = 'Hotels in ' + locationName;
  carouselInner.innerHTML = '';
  
  // OPTIMIZATION: Create an Image Lookup Map
  // Instead of looping through images 100 times, we loop once and save them.
  var imageMap = {};
  for (var k = 0; k < scraperImages.length; k++) {
      var item = scraperImages[k];
      if (item.name && item.featured_image) {
          // Create a "clean key" (lowercase, no spaces)
          var key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          imageMap[key] = item.featured_image;
      }
  }

  var currentSlideRow = null;
  var limit = 12; 
  if (hotelList.length < limit) limit = hotelList.length;

  for (var i = 0; i < limit; i++) {
    var hotel = hotelList[i];
    
    if (hotel.title) {
        var cleanTitle = hotel.title.replace(/^\d+\.\s*/, '');
        var matchKey = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

        // FAST LOOKUP: Check the map
        var displayImage = 'https://placehold.co/400x500?text=' + encodeURIComponent(cleanTitle);
        
        // 1. Try High Res Scraper Image
        if (imageMap[matchKey]) {
            displayImage = imageMap[matchKey];
        } 
        // 2. Fallback to v16 Thumbnail
        else if (hotel.cardPhotos && hotel.cardPhotos.length > 0) {
             var photo = hotel.cardPhotos[0].sizes;
             if (photo && photo.urlTemplate) {
                 displayImage = photo.urlTemplate.replace('{width}', '400').replace('{height}', '500');
             }
        }

        // PRICE
        var price = 'View Rates';
        if (hotel.priceForDisplay) {
            price = hotel.priceForDisplay;
        } else if (hotel.commerceInfo && hotel.commerceInfo.priceForDisplay) {
            price = hotel.commerceInfo.priceForDisplay.text;
        }

        // RATING LOGIC
        var ratingHtml = '';
        if (hotel.bubbleRating && hotel.bubbleRating.rating) {
            var score = hotel.bubbleRating.rating;
            // Add a star character
            ratingHtml = ' <span style="color:#fbcf33; font-weight:bold;">★ ' + score + '</span>';
        }

        // SLIDE LOGIC (Bootstrap Carousel)
        if (i % 4 === 0) {
            var slide = document.createElement('div');
            if (i === 0) slide.className = 'carousel-item active';
            else slide.className = 'carousel-item';
            
            currentSlideRow = document.createElement('div');
            currentSlideRow.className = 'row g-3';
            slide.appendChild(currentSlideRow);
            carouselInner.appendChild(slide);
        }

        // BUILD CARD
        var col = document.createElement('div');
        col.className = 'col-md-3';
        
        // Using innerHTML for speed and simplicity in this specific block
        // Note: We inject the Rating HTML here
        col.innerHTML = 
            '<div class="destination-card">' +
                '<img src="' + displayImage + '" alt="' + cleanTitle + '" style="height:300px; object-fit:cover; width:100%;">' +
                '<div class="destination-info">' +
                    '<p class="price">' + price + ratingHtml + '</p>' +
                    '<h6>' + cleanTitle + '</h6>' +
                '</div>' +
            '</div>';

        currentSlideRow.appendChild(col);
    }
  }
}