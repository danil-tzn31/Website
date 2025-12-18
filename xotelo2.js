// ===========================================
// XOTELO SEARCH
// ===========================================

(function() {

    // 1. CONFIGURATION
    var KNOWN_PH_KEYS = {
        "cebu": "g298460", "manila": "g298573", "boracay": "g294260", "davao": "g298459",
        "baguio": "g298445", "palawan": "g294255", "el nido": "g294256", "coron": "g1879007",
        "bohol": "g294259", "panglao": "g1036817", "siargao": "g674645", "tagaytay": "g317121",
        "makati": "g298450", "vigan": "g424958", "elyu": "g655794", "la union": "g655794",
    };

    var RAPIDAPI_HOST = 'xotelo-hotel-prices.p.rapidapi.com';
    var RAPIDAPI_KEY = '52f7cf1586msh55c6872a1c10c08p1c127cjsn19c27e52187c'; 
    var BASE_URL = 'https://' + RAPIDAPI_HOST;

    // 2. STATE
    var currentSearchParams = {}; 
    var hotelGuests = { adults: 1, children: 0 };
    var currentHotelData = []; 
    var currentSortMode = 'best';

    // DOM Elements
    var hotelInput = document.getElementById('hotel-input');
    var checkInInput = document.getElementById('checkin-input');
    var checkOutInput = document.getElementById('checkout-input');
    var searchButton = document.querySelector('#hotels .btn-simple-search');
    var carouselInner = document.querySelector('#destinationsCarousel .carousel-inner');
    var sectionTitle = document.querySelector('.destinations-section h2');
    var hotelSortContainer = document.getElementById('hotel-sort-container');
    var sortPills = document.querySelectorAll('#hotel-sort-container .sort-pill');
    var flightSortContainer = document.getElementById('sort-container');

    // 3. API HELPER (Using XMLHttpRequest)
    function callApi(endpoint) {
        return new Promise(function(resolve, reject) {
            var url = endpoint.indexOf('http') === 0 ? endpoint : BASE_URL + endpoint;
            var xhr = new XMLHttpRequest();
            
            xhr.open('GET', url, true);
            
            // Set Headers
            xhr.setRequestHeader('x-rapidapi-host', RAPIDAPI_HOST);
            xhr.setRequestHeader('x-rapidapi-key', RAPIDAPI_KEY);

            xhr.onreadystatechange = function() {
                // ReadyState 4 means the request is done
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (e) {
                            reject(new Error("JSON Parse Error"));
                        }
                    } else {
                        reject(new Error('HTTP Error: ' + xhr.status));
                    }
                }
            };

            xhr.onerror = function() {
                reject(new Error("Network Error"));
            };

            xhr.send();
        });
    }

    // 4. API FUNCTIONS
    async function fetchLocationKey(query) {
        var baseUrl = '/api/search?query=' + encodeURIComponent(query);
        var data = await callApi(baseUrl + '&location_type=geo');
        
        if (!data || !data.result || !data.result.list || data.result.list.length === 0) {
            data = await callApi(baseUrl + '&location_type=accommodation');
        }
        
        if (data && data.result && data.result.list && data.result.list.length > 0) {
            var list = data.result.list;
            var match;
            for (var i = 0; i < list.length; i++) {
                if (list[i].location_key && list[i].location_key.indexOf('g') === 0) {
                    match = list[i];
                    break;
                }
            }
            if (!match) match = list[0];
            return { location_key: match.location_key, name: match.short_place_name || match.name };
        }
        return null;
    }

    async function fetchHotelList(locationKey, locationName) {
        renderLoading('Fetching hotels in ' + locationName + '...');
        var params = new URLSearchParams({ location_key: locationKey, limit: '24', sort: 'popularity' });
        
        try {
            var data = await callApi('/api/list?' + params.toString());
            if (data && data.result && data.result.list && data.result.list.length > 0) {
                await processHotelsWithRates(data.result.list, locationName);
            } else {
                handleError('No hotels found in ' + locationName + '.');
            }
        } catch (err) { 
            handleError("Failed to load hotel list."); 
        }
    }

    async function fetchHotelRate(hotelKey) {
        var checkin = currentSearchParams.checkin;
        var checkout = currentSearchParams.checkout;
        var adults = currentSearchParams.adults;
        var children = currentSearchParams.children;
        
        var params = new URLSearchParams({
            hotel_key: hotelKey, chk_in: checkin, chk_out: checkout,
            adults: adults, rooms: '1', currency: 'USD',
            age_of_children: Array(children).fill('0').join(',')
        });

        try {
            var data = await callApi('/api/rates?' + params.toString());
            if (data && data.result && data.result.rates && data.result.rates.length > 0) {
                var minRate = Infinity;
                for(var i=0; i < data.result.rates.length; i++) {
                    var r = data.result.rates[i].rate;
                    if (r > 0 && r < minRate) minRate = r;
                }
                return minRate === Infinity ? 0 : minRate;
            }
        } catch (e) { return 0; }
        return 0;
    }

    // 5. EVENT LISTENERS
    if (searchButton && hotelInput) {
        updateGuestDisplay();
        setupSorting(); 
        
        searchButton.addEventListener('click', async function(e) {
            e.preventDefault(); 
            var query = hotelInput.value.trim().toLowerCase();
            if (!query) { alert('Please enter a destination.'); return; }
            
            if(hotelSortContainer) hotelSortContainer.style.display = 'none';
            if(flightSortContainer) flightSortContainer.style.display = 'none';
            toggleControls(false);
            
            renderLoading('Resolving location for ' + query + '...');
            prepareDateParams();
            
            try {
                var destData;
                if (KNOWN_PH_KEYS[query]) {
                    var displayName = query.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
                    destData = { location_key: KNOWN_PH_KEYS[query], name: displayName };
                } else {
                    destData = await fetchLocationKey(query);
                }
                
                if (destData && destData.location_key) {
                    console.log('[Location Found] ' + destData.name + ' (' + destData.location_key + ')');
                    await fetchHotelList(destData.location_key, destData.name);
                } else {
                    handleError('Could not find "' + query + '". Please check spelling.');
                }
            } catch (error) {
                console.error('[Search Error]', error);
                handleError('An unexpected error occurred.');
            }
        });
    }

    function setupSorting() {
        if (!sortPills) return;
        var pillsArray = Array.prototype.slice.call(sortPills);
        pillsArray.forEach(function(pill) {
            pill.addEventListener('click', function() {
                pillsArray.forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                currentSortMode = this.getAttribute('data-sort');
                applySort(currentHotelData);
            });
        });
    }

    // 6. PROCESSING & RENDERING
    async function processHotelsWithRates(hotels, locationName) {
        if(sectionTitle) sectionTitle.innerText = 'Top Stays in: ' + locationName;
        
        var promises = hotels.map(function(h) { return fetchHotelRate(h.key); });
        var rates = await Promise.all(promises);
        
        currentHotelData = hotels.map(function(hotel, i) {
            var rate = rates[i];
            var price = 0;
            var text = "Check Rates";
            
            if (rate > 0 && rate !== Infinity) {
                price = rate;
                text = 'USD ' + Math.round(rate).toLocaleString();
            } else if (hotel.price_ranges && hotel.price_ranges.minimum) {
                price = hotel.price_ranges.minimum;
                text = 'USD ' + Math.round(price).toLocaleString() + ' (Est.)';
            }
            
            var rating = 0;
            if (hotel.review_summary && hotel.review_summary.rating) {
                rating = parseFloat(hotel.review_summary.rating);
            } else if (hotel.rating) {
                rating = parseFloat(hotel.rating);
            }
            
            return {
                name: hotel.name || "Unknown",
                image: hotel.image || 'https://placehold.co/400x500?text=No+Image',
                finalPrice: price,
                priceText: text,
                ratingVal: rating,
                ratingHtml: rating > 0 ? ' &nbsp;•&nbsp; ' + rating.toFixed(1) + ' ★' : ''
            };
        });

        if(hotelSortContainer) hotelSortContainer.style.display = 'block';
        currentSortMode = 'best';
        if(sortPills.length) sortPills[0].classList.add('active');
        applySort(currentHotelData);
    }

    function applySort(data) {
        var sorted = data.slice();
        if (currentSortMode === 'price_asc') {
            sorted.sort(function(a, b) { return (a.finalPrice || Infinity) - (b.finalPrice || Infinity); });
        } else if (currentSortMode === 'rating_desc') {
            sorted.sort(function(a, b) { return b.ratingVal - a.ratingVal; });
        }
        renderCarousel(sorted);
    }

    function renderCarousel(data) {
        if(!carouselInner) return;
        carouselInner.innerHTML = ''; 
        var currentRow;

        data.forEach(function(hotel, i) {
            if (i % 4 === 0) {
                var slide = document.createElement('div');
                slide.className = (i === 0) ? 'carousel-item active' : 'carousel-item';
                currentRow = document.createElement('div');
                currentRow.className = 'row g-3';
                slide.appendChild(currentRow);
                carouselInner.appendChild(slide);
            }

            // Create Column
            var col = document.createElement('div');
            col.className = 'col-md-3';

            // Create Card Article
            var article = document.createElement('article');
            article.className = 'destination-card animate-in';
            article.style.transitionDelay = (i % 4) * 0.1 + 's';

            // Booking Data
            var bookingData = {
                category: 'Hotel',
                name: hotel.name,
                displayPrice: hotel.priceText,
                rawPrice: hotel.finalPrice,
                dateFrom: currentSearchParams.checkin,
                dateTo: currentSearchParams.checkout,
                guests: hotelGuests.adults + " Adults, " + hotelGuests.children + " Children"
            };

            // Image Container with Hover Button
            var imgContainer = document.createElement('div');
            imgContainer.className = 'image-hover-container'; 

            var img = document.createElement('img');
            img.src = hotel.image;
            img.alt = hotel.name;
            img.loading = 'lazy';
            
            var bookBtn = document.createElement('button');
            bookBtn.className = 'btn btn-primary book-hover-btn'; 
            bookBtn.textContent = 'Book Now';
            
            bookBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.openBookingModal === 'function') {
                    window.openBookingModal(bookingData);
                }
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(bookBtn);

            // Info Div
            var infoDiv = document.createElement('div');
            infoDiv.className = 'destination-info';

            var title = document.createElement('h6');
            title.title = hotel.name;
            title.textContent = hotel.name;

            var priceP = document.createElement('p');
            priceP.className = 'price';
            priceP.setAttribute('data-base-val', hotel.finalPrice);
            priceP.setAttribute('data-base-cur', 'USD');
            priceP.innerHTML = hotel.priceText + hotel.ratingHtml;

            infoDiv.appendChild(title);
            infoDiv.appendChild(priceP);

            article.appendChild(imgContainer);
            article.appendChild(infoDiv);
            col.appendChild(article);
            currentRow.appendChild(col);
        });
        
        toggleControls(data.length > 4);
    }

    // 7. UTILITIES
    function prepareDateParams() {
        var today = new Date();
        var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        var dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        
        var checkIn = checkInInput.value ? new Date(checkInInput.value) : tomorrow;
        var checkOut = checkOutInput.value ? new Date(checkOutInput.value) : dayAfter;
        
        if (checkIn < today) checkIn = tomorrow;
        if (checkOut <= checkIn) { 
            checkOut = new Date(checkIn); 
            checkOut.setDate(checkIn.getDate() + 1); 
        }
        
        checkInInput.value = checkIn.toISOString().split('T')[0];
        checkOutInput.value = checkOut.toISOString().split('T')[0];
        
        currentSearchParams = {
            checkin: checkInInput.value,
            checkout: checkOutInput.value,
            adults: hotelGuests.adults,
            children: hotelGuests.children
        };
    }

    function updateGuestDisplay() {
        var display = document.getElementById('hotel-guest-display');
        if (display) {
            display.textContent = hotelGuests.adults + ' Adult' + (hotelGuests.adults!==1?'s':'') + ' · ' + hotelGuests.children + ' Children';
        }
    }

    window.updateHotelGuests = function(type, step) {
        var newCount = hotelGuests[type] + step;
        if (type === 'adults' && newCount < 1) newCount = 1;
        if (type === 'children' && newCount < 0) newCount = 0;
        
        if (hotelGuests[type] !== newCount) {
            hotelGuests[type] = newCount;
            var el = document.getElementById('count-hotel-' + type);
            if(el) el.textContent = newCount;
            updateGuestDisplay();
        }
    };

    function renderLoading(msg) {
        if(sectionTitle) sectionTitle.innerText = msg;
        if(carouselInner) {
            carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center flex-column" style="height: 450px;"><div class="spinner-border text-success mb-3" role="status"></div><p class="text-muted">' + msg + '</p></div></div>';
        }
    }

    function handleError(msg) {
        if(sectionTitle) sectionTitle.innerText = "Search Results";
        if(carouselInner) {
            carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center text-danger flex-column" style="height: 450px;"><i class="bi bi-exclamation-circle" style="font-size: 2.5rem; margin-bottom: 1rem;"></i><h5>' + msg + '</h5></div></div>';
        }
    }

    function toggleControls(show) {
        var prev = document.querySelector('#destinationsCarousel .carousel-control-prev');
        var next = document.querySelector('#destinationsCarousel .carousel-control-next');
        if (prev && next) {
            prev.style.display = show ? 'block' : 'none';
            next.style.display = show ? 'block' : 'none';
        }
    }

})();
