// ============================================
// ATTRACTIONS SEARCH (Fixed: Var & XHR)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var API_KEY = '5559c078d8mshd05aafeafe9af7ap11c3d1jsn9352a8e5b475';
    var API_HOST = 'tripadvisor-scraper.p.rapidapi.com';
    
    var LOCATION_MAP = { 
        'siargao': 'General Luna', 
        'bohol': 'Panglao', 
        'palawan': 'El Nido', 
        'elyu': 'San Juan', 
        'la union': 'San Juan', 
        'baguio': 'Baguio City' 
    };

    var destInput = document.getElementById('dest-input');
    var destBtn = document.querySelector('#destinations .btn-simple-search');
    var viewAllBtn = document.getElementById('view-all-btn');

    if (destBtn && destInput) {
        destBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var raw = destInput.value.trim();
            if (!raw) {
                alert('Please enter a destination.');
                return;
            }

            var query = LOCATION_MAP[raw.toLowerCase()] || raw;

            if (viewAllBtn) {
                viewAllBtn.href = "view_all.php?category=destinations&query=" + encodeURIComponent(query);
            }

            showLoading("Finding attractions in " + query + "...");
            getAttractions(query);
        });
    }

    // Replaced fetch with XMLHttpRequest for consistency
    function getAttractions(query) {
        var url = "https://" + API_HOST + "/attractions/list?query=" + encodeURIComponent(query) + "&page=1&currency=PHP";
        
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("x-rapidapi-key", API_KEY);
        xhr.setRequestHeader("x-rapidapi-host", API_HOST);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var results = data.results || data.data || [];

                    if (results.length > 0) {
                        renderResults(results.slice(0, 8), query);
                    } else {
                        showError("No attractions found in " + query + ".");
                    }
                } catch (error) {
                    console.error(error);
                    showError("Data parsing error.");
                }
            } else if (xhr.status === 429) {
                showError("Too many requests. Please wait a moment.");
            } else {
                showError("API Error: " + xhr.status);
            }
        };

        xhr.onerror = function() {
            showError("Network error occurred.");
        };

        xhr.send();
    }

    function renderResults(items, location) {
        var container = document.querySelector('#destinationsCarousel .carousel-inner');
        var title = document.querySelector('.destinations-section h2');
        if(title) title.innerText = 'Top Attractions in "' + location + '"';
        
        if(container) {
            container.innerHTML = '';
            var chunk = 4;
            for (var i = 0; i < items.length; i += chunk) {
                var slide = document.createElement('div');
                slide.className = (i === 0) ? 'carousel-item active' : 'carousel-item';
                
                var rowDiv = document.createElement('div');
                rowDiv.className = 'row g-3';
                
                var sliceItems = items.slice(i, i + chunk);
                
                sliceItems.forEach(function(p) {
                    var img = p.featured_image || (p.thumbnail ? p.thumbnail.url : null) || 'https://placehold.co/400x500';
                    var badge = p.rating ? p.rating + " ★" : 'Recommended';
                    
                    var col = document.createElement('div');
                    col.className = 'col-md-3';
                    col.innerHTML = 
                        '<article class="destination-card animate-in">' +
                            '<img src="' + img + '" style="height: 100%; object-fit: cover;">' +
                            '<div class="destination-info">' +
                                '<h6 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + p.name + '</h6>' +
                                '<p class="price">' + badge + '</p>' +
                            '</div>' +
                        '</article>';
                    rowDiv.appendChild(col);
                });

                slide.appendChild(rowDiv);
                container.appendChild(slide);
            }
        }
    }

    function showLoading(msg) { 
        var title = document.querySelector('.destinations-section h2');
        var container = document.querySelector('#destinationsCarousel .carousel-inner');
        if(title) title.innerText = msg; 
        if(container) container.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center" style="height: 450px;"><div class="spinner-border text-success"></div></div></div>'; 
    }

    function showError(msg) { 
        var title = document.querySelector('.destinations-section h2');
        var container = document.querySelector('#destinationsCarousel .carousel-inner');
        if(title) title.innerText = 'Search Results'; 
        if(container) container.innerHTML = '<div class="carousel-item active"><div class="d-flex justify-content-center align-items-center text-danger" style="height: 450px;"><h5>' + msg + '</h5></div></div>'; 
    }
});