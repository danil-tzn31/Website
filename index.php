<?php
session_start();

// User State
$isLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
$userId = $isLoggedIn ? $_SESSION['user_id'] : ''; 
$firstName = $isLoggedIn ? $_SESSION['first_name'] : '';
$lastName = $isLoggedIn ? $_SESSION['last_name'] : '';
$username = $isLoggedIn ? $_SESSION['username'] : '';
$email = $isLoggedIn ? $_SESSION['email'] : '';

// Flash Error Messages
$loginError = '';
if (isset($_SESSION['login_error'])) {
    $loginError = $_SESSION['login_error'];
    unset($_SESSION['login_error']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Website</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/hero.css">
    <link rel="stylesheet" href="css/search.css">
    <link rel="stylesheet" href="css/destinations.css">
    <link rel="stylesheet" href="css/recommendations.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/flights.css">
    <link rel="stylesheet" href="css/hover.css">
</head>
<body>
    
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
            <div class="container-fluid px-4">
                <a class="navbar-brand" href="index.php">Halina</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto align-items-center">
                        <li class="nav-item"><a class="nav-link active" href="index.php">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="bookings.php">Bookings</a></li>
                        
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="currencyDropdown" role="button" data-bs-toggle="dropdown">USD</a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="currencyDropdown">
                                <li><a class="dropdown-item" href="#">USD - US Dollar</a></li>
                                <li><a class="dropdown-item" href="#">PHP - Philippine Peso</a></li>
                                <li><a class="dropdown-item" href="#">EUR - Euro</a></li>
                                <li><a class="dropdown-item" href="#">JPY - Japanese Yen</a></li>
                                <li><a class="dropdown-item" href="#">GBP - British Pound</a></li>
                            </ul>
                        </li>

                        <?php if (!$isLoggedIn): ?>
                        <li class="nav-item ms-3">
                            <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#loginModal">Log In</button>
                        </li>
                        <li class="nav-item ms-2">
                            <a href="register.php" class="btn btn-success">Sign Up</a>
                        </li>
                        <?php else: ?>
                        <li class="nav-item dropdown ms-3">
                            <a class="nav-link dropdown-toggle" href="#" id="userMenuDropdown" role="button" data-bs-toggle="dropdown">
                                <?php echo htmlspecialchars($firstName ?: $username); ?>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDropdown">
                                <li><a class="dropdown-item" href="logout.php">Sign Out</a></li>
                            </ul>
                        </li>
                        <?php endif; ?>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <div class="modal fade <?php echo $loginError ? 'show' : ''; ?>" id="loginModal" tabindex="-1" aria-hidden="true" <?php echo $loginError ? 'style="display: block;"' : ''; ?>>
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Halina Login</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="login-modal-subtitle">Login to access your account.</p>
                    <form class="login-modal-form" action="login_process.php" method="POST" novalidate>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" class="form-control <?php echo $loginError ? 'is-invalid' : ''; ?>" id="email" name="email" placeholder="juan@example.com" required>
                            <?php if ($loginError): ?>
                            <div class="invalid-feedback d-block"><?php echo htmlspecialchars($loginError); ?></div>
                            <?php endif; ?>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control <?php echo $loginError ? 'is-invalid' : ''; ?>" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn-login-modal">Log In</button>
                        <div class="login-modal-footer">
                            <p>Don't have an account? <a href="register.php">Sign Up</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <?php if ($loginError): ?><div class="modal-backdrop fade show" id="loginBackdrop"></div><?php endif; ?>
    
    <main>
        <section class="hero-section">
            <div class="hero-overlay"></div>
            <div class="container hero-content">
                <h1 class="hero-title">So saan tayo?</h1>
                <p class="hero-description">Planned or sponti, let's make your dream escapade into a reality.</p>

                <div class="search-card-container">
                    <ul class="nav nav-pills search-tabs mb-5" id="searchTabs" role="tablist">
                        <li class="nav-item"><button class="nav-link active" id="hotels-tab" data-bs-toggle="pill" data-bs-target="#hotels">Hotels</button></li>
                        <li class="nav-item"><button class="nav-link" id="flights-tab" data-bs-toggle="pill" data-bs-target="#flights">Flights</button></li>
                        <li class="nav-item"><button class="nav-link" id="destinations-tab" data-bs-toggle="pill" data-bs-target="#destinations">Destinations</button></li>
                    </ul>
                    
                    <div class="search-card">
                        <div class="tab-content" id="searchTabsContent">
                            <div class="tab-pane fade show active" id="hotels" role="tabpanel">
                                <div class="row g-2">
                                    <div class="col-lg-3 col-md-12">
                                        <label class="form-label">Destination</label>
                                        <input type="text" id="hotel-input" name="hotel-search" class="simple-search-input" placeholder="Where to?">
                                    </div>
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">Check-in</label>
                                        <input type="date" id="checkin-input" name="checkin" class="simple-search-input">
                                    </div>
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">Check-out</label>
                                        <input type="date" id="checkout-input" name="checkout" class="simple-search-input">
                                    </div>
                                    <div class="col-lg-3 col-md-12 position-relative">
                                        <label class="form-label">Guests <small class="text-muted fw-normal">(Optional)</small></label>
                                        <div class="passenger-selector" id="hotel-guest-selector">
                                            <div class="simple-search-input passenger-display" id="hotel-guest-display">1 Adult · 0 Children</div>
                                            <div class="passenger-dropdown" id="hotel-guest-dropdown">
                                                <div class="passenger-row">
                                                    <div class="passenger-label"><span>Adults</span><small>Age 18+</small></div>
                                                    <div class="counter-controls">
                                                        <button type="button" class="btn-counter" onclick="updateHotelGuests('adults', -1)">-</button>
                                                        <span class="passenger-count" id="count-hotel-adults">1</span>
                                                        <button type="button" class="btn-counter" onclick="updateHotelGuests('adults', 1)">+</button>
                                                    </div>
                                                </div>
                                                <div class="passenger-row">
                                                    <div class="passenger-label"><span>Children</span><small>Age 0-17</small></div>
                                                    <div class="counter-controls">
                                                        <button type="button" class="btn-counter" onclick="updateHotelGuests('children', -1)">-</button>
                                                        <span class="passenger-count" id="count-hotel-children">0</span>
                                                        <button type="button" class="btn-counter" onclick="updateHotelGuests('children', 1)">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-12 d-flex align-items-end">
                                        <button class="btn-simple-search w-100" id="btn-hotel-search">Search</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-pane fade" id="flights" role="tabpanel">
                                <div class="row g-2">
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">From</label>
                                        <input type="text" id="flight-from" class="simple-search-input" placeholder="Origin">
                                    </div>
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">To</label>
                                        <input type="text" id="flight-to" name="flight-search" class="simple-search-input" placeholder="Destination">
                                    </div>
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">Departure</label>
                                        <input type="date" id="flight-depart" class="simple-search-input">
                                    </div>
                                    <div class="col-lg-2 col-md-6">
                                        <label class="form-label">Return <small class="text-muted fw-normal">(Optional)</small></label>
                                        <input type="date" id="flight-return" class="simple-search-input">
                                    </div>
                                    <div class="col-lg-2 col-md-12">
                                        <label class="form-label">Passengers</label>
                                        <div class="passenger-selector" id="passenger-selector">
                                            <div class="simple-search-input passenger-display" id="passenger-display">1 Passenger</div>
                                            <div class="passenger-dropdown" id="passenger-dropdown">
                                                <div class="passenger-row">
                                                    <div class="passenger-label"><span>Adults</span><small>Age 12+</small></div>
                                                    <div class="counter-controls">
                                                        <button type="button" class="btn-counter" onclick="updatePassengers('adults', -1)">-</button>
                                                        <span class="passenger-count" id="count-adults">1</span>
                                                        <button type="button" class="btn-counter" onclick="updatePassengers('adults', 1)">+</button>
                                                    </div>
                                                </div>
                                                <div class="passenger-row">
                                                    <div class="passenger-label"><span>Children</span><small>Age 2-11</small></div>
                                                    <div class="counter-controls">
                                                        <button type="button" class="btn-counter" onclick="updatePassengers('children', -1)">-</button>
                                                        <span class="passenger-count" id="count-children">0</span>
                                                        <button type="button" class="btn-counter" onclick="updatePassengers('children', 1)">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-12 d-flex align-items-end">
                                        <button class="btn-simple-search w-100" id="btn-flight-search">Search</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-pane fade" id="destinations" role="tabpanel">
                                <div class="row g-3">
                                    <div class="col-md-10">
                                        <label class="form-label">Explore Places</label>
                                        <input type="text" id="dest-input" name="dest-search" class="simple-search-input" placeholder="Try 'Boracay' or 'Palawan'" list="dest-suggestions">
                                        <datalist id="dest-suggestions">
                                            <option value="Boracay"><option value="Palawan"><option value="Siargao"><option value="Cebu"><option value="Bohol">
                                            <option value="Baguio"><option value="Davao"><option value="Vigan"><option value="Batanes"><option value="Manila">
                                        </datalist>
                                    </div>
                                    <div class="col-md-2 d-flex align-items-end">
                                        <button class="btn-simple-search w-100" type="button" onclick="alert('Mock Search: Showing results for ' + document.getElementById('dest-input').value)">Search</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="destinations-section py-5">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <h2>Stay at Top-Rated Hotels</h2>
                    
                    <div id="sort-container" style="display: none;">
                        <span class="sort-pill active me-2" data-sort="best">Best Flights</span>
                        <span class="sort-pill me-2" data-sort="price_asc">Cheapest</span>
                        <span class="sort-pill" data-sort="rating_desc">Fastest</span>
                    </div>

                    <div id="hotel-sort-container" style="display: none;">
                        <span class="sort-pill active me-2" style="cursor:pointer;" data-sort="best">Our top picks</span>
                        <span class="sort-pill me-2" style="cursor:pointer;" data-sort="price_asc">Lowest price first</span>
                        <span class="sort-pill" style="cursor:pointer;" data-sort="rating_desc">Top reviewed</span>
                    </div>
                </div>
                
                <div class="position-relative">
                    <div id="destinationsCarousel" class="carousel slide" data-bs-ride="false">
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&auto=format&fit=crop" alt="The Lind Boracay">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'The Lind Boracay', displayPrice: 'USD 250.00', rawPrice: '250', dateFrom: '2025-03-10', dateTo: '2025-03-12', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>The Lind Boracay</h6>
                                                <p class="price" data-base-val="250" data-base-cur="USD">From USD 250.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&auto=format&fit=crop" alt="Miniloc Island Resort">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Miniloc Island Resort', displayPrice: 'USD 450.00', rawPrice: '450', dateFrom: '2025-04-01', dateTo: '2025-04-03', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Miniloc Island Resort</h6>
                                                <p class="price" data-base-val="450" data-base-cur="USD">From USD 450.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop" alt="Crimson Resort Cebu">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Crimson Resort Cebu', displayPrice: 'USD 200.00', rawPrice: '200', dateFrom: '2025-05-15', dateTo: '2025-05-17', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Crimson Resort Cebu</h6>
                                                <p class="price" data-base-val="200" data-base-cur="USD">From USD 200.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop" alt="Amorita Resort Bohol">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Amorita Resort Bohol', displayPrice: 'USD 150.00', rawPrice: '150', dateFrom: '2025-06-20', dateTo: '2025-06-22', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Amorita Resort Bohol</h6>
                                                <p class="price" data-base-val="150" data-base-cur="USD">From USD 150.00</p>
                                            </div>
                                        </article>
                                    </div>
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&auto=format&fit=crop" alt="The Manor">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'The Manor at CJH', displayPrice: 'USD 120.00', rawPrice: '120', dateFrom: '2025-12-01', dateTo: '2025-12-03', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>The Manor at CJH</h6>
                                                <p class="price" data-base-val="120" data-base-cur="USD">From USD 120.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop" alt="Pearl Farm">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Pearl Farm Resort', displayPrice: 'USD 220.00', rawPrice: '220', dateFrom: '2025-08-10', dateTo: '2025-08-12', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Pearl Farm Resort</h6>
                                                <p class="price" data-base-val="220" data-base-cur="USD">From USD 220.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop" alt="Hotel Luna">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Hotel Luna Vigan', displayPrice: 'USD 90.00', rawPrice: '90', dateFrom: '2025-09-05', dateTo: '2025-09-07', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Hotel Luna Vigan</h6>
                                                <p class="price" data-base-val="90" data-base-cur="USD">From USD 90.00</p>
                                            </div>
                                        </article>
                                    </div>
                                    <div class="col-md-3">
                                        <article class="destination-card no-animate">
                                            <div class="image-hover-container">
                                                <img src="https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?w=500&auto=format&fit=crop" alt="Nay Palad">
                                                <button class="btn btn-primary book-hover-btn" onclick="openBookingModal({ category: 'Hotel', name: 'Nay Palad Hideaway', displayPrice: 'USD 600.00', rawPrice: '600', dateFrom: '2025-10-15', dateTo: '2025-10-17', guests: '2 Adults' })">Book Now</button>
                                            </div>
                                            <div class="destination-info">
                                                <h6>Nay Palad Hideaway</h6>
                                                <p class="price" data-base-val="600" data-base-cur="USD">From USD 600.00</p>
                                            </div>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button class="carousel-control-prev" type="button" data-bs-target="#destinationsCarousel" data-bs-slide="prev">
                            <span class="carousel-control-icon">←</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#destinationsCarousel" data-bs-slide="next">
                            <span class="carousel-control-icon">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="recommendations-section py-5">
            <div class="container">
                <div class="text-center mb-4">
                    <h2>Travel Recommendations</h2>
                    <p class="text-muted">Discover handpicked experiences tailored just for you</p>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-3">
                        <div class="recommendation-card">
                            <div class="recommendation-image">
                                <img src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=500&auto=format&fit=crop" alt="Bohol Countryside">
                                <span class="recommendation-badge">Top Pick</span>
                            </div>
                            <div class="recommendation-content">
                                <h5>Bohol Countryside Tour</h5>
                                <p>Visit the Chocolate Hills, Tarsier Sanctuary, and Loboc River Cruise.</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="recommendation-duration">USD 45.00</span>
                                    <button class="btn btn-outline-success btn-sm" onclick="openBookingModal({ category: 'Experience', name: 'Bohol Countryside Tour', displayPrice: 'USD 45.00', rawPrice: '45', dateFrom: 'Flexible', guests: '1 Person' })">Book</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="recommendation-card">
                            <div class="recommendation-image">
                                <img src="https://images.unsplash.com/photo-1534008897995-27a23e859048?w=500&auto=format&fit=crop" alt="El Nido Hopping">
                                <span class="recommendation-badge">Best Value</span>
                            </div>
                            <div class="recommendation-content">
                                <h5>El Nido Island Hopping</h5>
                                <p>Explore the Big Lagoon, Secret Lagoon, and Shimizu Island.</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="recommendation-duration">USD 30.00</span>
                                    <button class="btn btn-outline-success btn-sm" onclick="openBookingModal({ category: 'Experience', name: 'El Nido Island Hopping Tour A', displayPrice: 'USD 30.00', rawPrice: '30', dateFrom: 'Flexible', guests: '1 Person' })">Book</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="recommendation-card">
                            <div class="recommendation-image">
                                <img src="https://thequeensescape.com/wp-content/uploads/2020/02/Bambike2BIntramuros-26-1.jpg" alt="Intramuros Tour">
                            </div>
                            <div class="recommendation-content">
                                <h5>Intramuros Bambike Tour</h5>
                                <p>Cycle through history on bamboo bikes in the Walled City.</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="recommendation-duration">USD 25.00</span>
                                    <button class="btn btn-outline-success btn-sm" onclick="openBookingModal({ category: 'Experience', name: 'Intramuros Bambike Tour', displayPrice: 'USD 25.00', rawPrice: '25', dateFrom: 'Flexible', guests: '1 Person' })">Book</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="recommendation-card">
                            <div class="recommendation-image">
                                <img src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&auto=format&fit=crop" alt="Siargao Surf">
                                <span class="recommendation-badge">Trending</span>
                            </div>
                            <div class="recommendation-content">
                                <h5>Siargao Surfing Lessons</h5>
                                <p>Catch your first wave at Cloud 9 with expert instructors.</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="recommendation-duration">USD 20.00</span>
                                    <button class="btn btn-outline-success btn-sm" onclick="openBookingModal({ category: 'Experience', name: 'Siargao Surfing Lesson', displayPrice: 'USD 20.00', rawPrice: '20', dateFrom: 'Flexible', guests: '1 Person' })">Book</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-4 text-center text-md-start mb-3 mb-md-0">
                    <h5 class="footer-brand">Halina</h5>
                    <p class="footer-tagline">Your Gateway to Wanderland</p>
                </div>
                <div class="col-md-4 text-center mb-3 mb-md-0">
                    <div class="footer-links">
                        <a href="#">About</a><a href="#">Services</a><a href="#">Contact</a><a href="#">Privacy</a>
                    </div>
                </div>
                <div class="col-md-4 text-center text-md-end">
                    <div class="footer-social">
                        <a href="#" class="social-icon"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                        <a href="#" class="social-icon"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                    </div>
                </div>
            </div>
            <hr class="footer-divider">
            <div class="text-center">
                <p class="footer-copyright">&copy; 2025 Halina. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Booking</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <h4 id="modalBookName" class="fw-bold"></h4>
                        <span id="modalBookCategory" class="badge bg-success mb-2"></span>
                        <div class="d-flex justify-content-between border-bottom pb-2"><span>Dates:</span><span id="modalBookDates" class="fw-bold"></span></div>
                        <div class="d-flex justify-content-between border-bottom py-2"><span>Guests:</span><span id="modalBookGuests" class="fw-bold"></span></div>
                        <div class="d-flex justify-content-between pt-2"><span class="h5">Total Price:</span><span id="modalBookPrice" class="h5 text-danger fw-bold"></span></div>
                    </div>

                    <form action="payment.php" method="POST">
                        <input type="hidden" name="category" id="inputCategory">
                        <input type="hidden" name="name" id="inputName">
                        <input type="hidden" name="currency" id="inputCurrency">
                        <input type="hidden" name="price" id="inputPrice">
                        <input type="hidden" name="date_from" id="inputDateFrom">
                        <input type="hidden" name="date_to" id="inputDateTo">
                        <input type="hidden" name="guests" id="inputGuests">
                        <input type="hidden" name="flight_number" id="inputFlightNumber">
                        <input type="hidden" name="departure_time" id="inputDepartureTime">

                        <?php if($isLoggedIn): ?>
                            <div class="d-grid gap-2"><button type="submit" class="btn btn-primary btn-lg">Proceed to Payment</button></div>
                        <?php else: ?>
                            <div class="alert alert-warning text-center">You must be logged in to book.</div>
                            <div class="d-grid gap-2"><button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Log In Now</button></div>
                        <?php endif; ?>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>      
    <script src="xotelo2.js"></script>     
    <script src="flights3.js"></script>    
    <script src="destinations.js"></script> 
    <script src="currency.js"></script>    
</body>
</html>
