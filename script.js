// ============================================
// NAVBAR & SCROLL EFFECTS
// ============================================

window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// MODAL HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var loginModal = document.getElementById('loginModal');
    var backdrop = document.getElementById('loginBackdrop');
    
    // Fix PHP redirect sticky backdrops
    if (loginModal && loginModal.classList.contains('show') && backdrop) {
        backdrop.remove();
        loginModal.style.display = '';
        loginModal.classList.remove('show');
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            var bsModal = new bootstrap.Modal(loginModal);
            bsModal.show();
        }
    }
});

// ============================================
// ANIMATIONS
// ============================================

var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('animate-in')) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    var destinationCards = document.querySelectorAll('.destination-card');
    destinationCards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        var isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isInViewport) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.classList.add('no-animate');
        } else {
            observer.observe(card);
        }
    });
});

// ============================================
// DROPDOWN LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var dropdownIds = ['passenger-selector', 'hotel-guest-selector'];

    dropdownIds.forEach(function(id) {
        var selector = document.getElementById(id);
        if (!selector) return;

        selector.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownIds.forEach(function(otherId) {
                if (otherId !== id) {
                    var other = document.getElementById(otherId);
                    if (other) other.classList.remove('active');
                }
            });
            this.classList.toggle('active');
        });
    });

    document.addEventListener('click', function() {
        dropdownIds.forEach(function(id) {
            var selector = document.getElementById(id);
            if (selector) selector.classList.remove('active');
        });
    });

    var dropdownMenus = document.querySelectorAll('.passenger-dropdown');
    dropdownMenus.forEach(function(menu) {
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});

// ============================================
// COUNTER FUNCTIONS
// ============================================

window.updatePassengers = function(type, change) {
    var minLimit = (type === 'adults') ? 1 : 0;
    updateCount('count-' + type, change, minLimit);
    updateDisplay('passenger-display', 'count-adults', 'count-children', 'Passenger');
}

window.updateHotelGuests = function(type, change) {
    var minLimit = (type === 'adults') ? 1 : 0;
    updateCount('count-hotel-' + type, change, minLimit);
    updateDisplay('hotel-guest-display', 'count-hotel-adults', 'count-hotel-children', 'Guest');
}

function updateCount(id, change, minLimit) {
    var el = document.getElementById(id);
    if (!el) return;
    var val = parseInt(el.innerText) + change;
    if (val < minLimit) val = minLimit;
    el.innerText = val;
}

function updateDisplay(displayId, adultId, childId, labelBase) {
    var display = document.getElementById(displayId);
    if(!display) return;
    var adults = parseInt(document.getElementById(adultId).innerText);
    var children = parseInt(document.getElementById(childId).innerText);
    var text = adults + " Adult" + (adults !== 1 ? 's' : '');
    if (children > 0) {
        text += " · " + children + " Child" + (children !== 1 ? 'ren' : '');
    }
    display.innerText = text; 
}

// ============================================
// BOOKING MODAL
// ============================================

function openBookingModal(data) {
    var nameEl = document.getElementById('modalBookName');
    var catEl = document.getElementById('modalBookCategory');
    var datesEl = document.getElementById('modalBookDates');
    var guestsEl = document.getElementById('modalBookGuests');
    var priceEl = document.getElementById('modalBookPrice');

    if(nameEl) nameEl.textContent = data.name;
    if(catEl) catEl.textContent = data.category;
    
    var dateText = data.dateFrom;
    if(data.dateTo && data.dateTo !== 'null' && data.dateTo !== '') {
        dateText += ' to ' + data.dateTo;
    }
    if(datesEl) datesEl.textContent = dateText;
    if(guestsEl) guestsEl.textContent = data.guests;
    
    var currBtn = document.getElementById('currencyDropdown');
    var currentCurrency = currBtn ? currBtn.textContent.trim() : 'USD';
    
    if(priceEl) priceEl.textContent = data.displayPrice;

    // Fill Hidden Inputs for Form Submission
    var inputCategory = document.getElementById('inputCategory');
    var inputName = document.getElementById('inputName');
    var inputCurrency = document.getElementById('inputCurrency');
    var inputPrice = document.getElementById('inputPrice');
    var inputDateFrom = document.getElementById('inputDateFrom');
    var inputDateTo = document.getElementById('inputDateTo');
    var inputGuests = document.getElementById('inputGuests');
    var inputFlightNumber = document.getElementById('inputFlightNumber');
    var inputDepartureTime = document.getElementById('inputDepartureTime');

    if(inputCategory) inputCategory.value = data.category;
    if(inputName) inputName.value = data.name;
    if(inputCurrency) inputCurrency.value = currentCurrency;
    if(inputPrice) inputPrice.value = data.rawPrice; 
    if(inputDateFrom) inputDateFrom.value = data.dateFrom;
    if(inputDateTo) inputDateTo.value = data.dateTo || '';
    if(inputGuests) inputGuests.value = data.guests;
    if(inputFlightNumber) inputFlightNumber.value = data.flightNumber || '';
    if(inputDepartureTime) inputDepartureTime.value = data.departureTime || '';

    var modalEl = document.getElementById('bookingModal');
    if (modalEl && window.bootstrap) {
        var myModal = new bootstrap.Modal(modalEl);
        myModal.show();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var tabButtons = document.querySelectorAll('#bookingTabs button[data-bs-toggle="pill"]');
    
    tabButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var tab = new bootstrap.Tab(this);
            tab.show();
        });
    });
});