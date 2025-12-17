<?php
session_start();

// Check if user is logged in
$isLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
$firstName = $isLoggedIn ? $_SESSION['first_name'] : '';
$lastName = $isLoggedIn ? $_SESSION['last_name'] : '';
$username = $isLoggedIn ? $_SESSION['username'] : '';
$email = $isLoggedIn ? $_SESSION['email'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Results - Halina</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/view_all.css">
</head>
<body>

    <header>
        <nav class="navbar navbar-expand-lg navbar-dark fixed-top scrolled"> 
            <div class="container-fluid px-4">
                <a class="navbar-brand" href="index.php">Halina</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto align-items-center">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">About Us</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Services</a>
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
                            <a class="nav-link dropdown-toggle" href="#" id="userMenuDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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

    <div class="search-strip">
        <div class="container" id="dynamic-search-container">
            <div class="search-card-container">
                <ul class="nav nav-pills search-tabs mb-5" id="searchTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="hotels-tab" data-bs-toggle="pill" data-bs-target="#hotels" type="button" role="tab">
                            Hotels
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="flights-tab" data-bs-toggle="pill" data-bs-target="#flights" type="button" role="tab">
                            Flights
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="destinations-tab" data-bs-toggle="pill" data-bs-target="#destinations" type="button" role="tab">
                            Destinations
                        </button>
                    </li>
                </ul>
                
                <div class="search-card">
                    <div class="tab-content" id="searchTabsContent">
                        <div class="tab-pane fade" id="hotels" role="tabpanel">
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
                                        <div class="simple-search-input passenger-display" id="hotel-guest-display">
                                            1 Adult · 0 Children
                                        </div>
                                        <div class="passenger-dropdown" id="hotel-guest-dropdown">
                                            <div class="passenger-row">
                                                <div class="passenger-label">
                                                    <span>Adults</span>
                                                    <small>Age 18+</small>
                                                </div>
                                                <div class="counter-controls">
                                                    <button type="button" class="btn-counter" data-type="hotel" data-passenger="adults" data-action="-1">-</button>
                                                    <span class="passenger-count" id="count-hotel-adults">1</span>
                                                    <button type="button" class="btn-counter" data-type="hotel" data-passenger="adults" data-action="1">+</button>
                                                </div>
                                            </div>
                                            <div class="passenger-row">
                                                <div class="passenger-label">
                                                    <span>Children</span>
                                                    <small>Age 0-17</small>
                                                </div>
                                                <div class="counter-controls">
                                                    <button type="button" class="btn-counter" data-type="hotel" data-passenger="children" data-action="-1">-</button>
                                                    <span class="passenger-count" id="count-hotel-children">0</span>
                                                    <button type="button" class="btn-counter" data-type="hotel" data-passenger="children" data-action="1">+</button>
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
                            <div class="row g-2 align-items-end">
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
                                <div class="col-lg-3 col-md-12">
                                    <label class="form-label">Passengers</label>
                                    <div class="passenger-selector" id="passenger-selector">
                                        <div class="simple-search-input passenger-display" id="passenger-display">
                                            1 Passenger
                                        </div>
                                        <div class="passenger-dropdown" id="passenger-dropdown">
                                            <div class="passenger-row">
                                                <div class="passenger-label">
                                                    <span>Adults</span>
                                                    <small>Age 12+</small>
                                                </div>
                                                <div class="counter-controls">
                                                    <button type="button" class="btn-counter" data-type="flight" data-passenger="adults" data-action="-1">-</button>
                                                    <span class="passenger-count" id="count-adults">1</span>
                                                    <button type="button" class="btn-counter" data-type="flight" data-passenger="adults" data-action="1">+</button>
                                                </div>
                                            </div>
                                            <div class="passenger-row">
                                                <div class="passenger-label">
                                                    <span>Children</span>
                                                    <small>Age 2-11</small>
                                                </div>
                                                <div class="counter-controls">
                                                    <button type="button" class="btn-counter" data-type="flight" data-passenger="children" data-action="-1">-</button>
                                                    <span class="passenger-count" id="count-children">0</span>
                                                    <button type="button" class="btn-counter" data-type="flight" data-passenger="children" data-action="1">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-1 col-md-12 d-flex align-items-end">
                                    <button class="btn-simple-search w-100" id="btn-flight-search">Search</button>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="destinations" role="tabpanel">
                            <div class="row g-3">
                                <div class="col-md-10">
                                    <label class="form-label">To</label>
                                    <input type="text" id="dest-input" name="dest-search" class="simple-search-input" placeholder="Where to?">
                                </div>
                                <div class="col-md-2 d-flex align-items-end">
                                    <button class="btn-simple-search w-100" id="btn-dest-search">Search</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <main class="container">
        <div class="row pt-4">
            <section class="col-md-12">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <h2 class="h4 fw-bold mb-0" id="page-title">Search Results</h2>
                    <div class="text-muted small">Showing results based on your preferences</div>
                </div>

                <div class="mb-4" id="sort-container">
                    <span class="sort-pill active me-2" style="cursor:pointer;" data-sort="best">Our top picks</span>
                    <span class="sort-pill me-2" style="cursor:pointer;" data-sort="price_asc">Lowest price first</span>
                    <span class="sort-pill" style="cursor:pointer;" data-sort="rating_desc">Top reviewed</span>
                </div>

                <div id="loading-spinner" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-success" role="status"></div>
                    <p class="mt-2 text-muted">Searching for the best deals...</p>
                </div>

                <div id="results-grid"></div>
            </section>
        </div>
    </main>
    <footer class="footer-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-4 text-center text-md-start mb-3 mb-md-0">
                    <h5 class="footer-brand">Halina</h5>
                    <p class="footer-tagline">Your travel companion</p>
                </div>
                <div class="col-md-4 text-center mb-3 mb-md-0">
                    <div class="footer-links">
                        <a href="#">About</a>
                        <a href="#">Services</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy</a>
                    </div>
                </div>
                <div class="col-md-4 text-center text-md-end">
                    <div class="footer-social">
                        <a href="#" class="social-icon">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="#" class="social-icon">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                        </a>
                        <a href="#" class="social-icon">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.061-1.277-.261-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <hr class="footer-divider">
            <div class="text-center">
                <p class="footer-copyright">&copy; 2025 Halina. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="view_all.js"></script>
</body>
</html>