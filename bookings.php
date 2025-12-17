<?php
session_start();

// 1. SECURITY
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$firstName = $_SESSION['first_name'] ?? '';
$username = $_SESSION['username'] ?? '';

// 2. DATABASE
$serverName = "LAPTOP-3V9S5SVG\SQLEXPRESS01";
$connectionOptions = [
    "Database" => "WEBSITE",
    "Uid" => "",
    "PWD" => ""
];

$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

// Helper to fix the "DateTime" fatal error
function formatDate($date, $format = 'Y-m-d') {
    if ($date instanceof DateTime) {
        return $date->format($format);
    }
    return $date; 
}

// 3. FETCH BOOKINGS
$flights = [];
$hotels = [];

// Fetch Flight Bookings
$q1 = "SELECT * FROM FLIGHTS_BOOKINGS WHERE USER_ID = '$user_id' ORDER BY DATE_FROM DESC";
$r1 = sqlsrv_query($conn, $q1);

if ($r1) {
    while ($row = sqlsrv_fetch_array($r1)) {
        $flights[] = $row;
    }
}

// Fetch Hotel Bookings
$q2 = "SELECT * FROM HOTELS_BOOKINGS WHERE USER_ID = '$user_id' ORDER BY DATE_FROM DESC";
$r2 = sqlsrv_query($conn, $q2);

if ($r2) {
    while ($row = sqlsrv_fetch_array($r2)) {
        $hotels[] = $row;
    }
}

sqlsrv_close($conn);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Bookings - Halina</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/footer.css">
    <link rel="stylesheet" href="css/bookings.css">
</head>
<body>

    <header>
        <nav class="navbar navbar-expand-lg navbar-custom fixed-top">
            <div class="container-fluid px-4">
                <a class="navbar-brand navbar-brand-custom" href="index.php">Halina</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto align-items-center">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="bookings.php">Bookings</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="currencyDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                USD
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="currencyDropdown">
                                <li><a class="dropdown-item" href="#">USD - US Dollar</a></li>
                                <li><a class="dropdown-item" href="#">PHP - Philippine Peso</a></li>
                                <li><a class="dropdown-item" href="#">EUR - Euro</a></li>
                                <li><a class="dropdown-item" href="#">JPY - Japanese Yen</a></li>
                                <li><a class="dropdown-item" href="#">GBP - British Pound</a></li>
                            </ul>
                        </li>
                        <?php if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true): ?>
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

    <main class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="fw-bold">My Bookings</h1>
        </div>

        <ul class="nav nav-pills mb-4" id="bookingTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="flights-tab" data-bs-toggle="pill" data-bs-target="#pills-flights" type="button" role="tab" aria-controls="pills-flights" aria-selected="true">
                    <i class="bi bi-airplane me-2"></i>Flights (<?php echo count($flights); ?>)
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="hotels-tab" data-bs-toggle="pill" data-bs-target="#pills-hotels" type="button" role="tab" aria-controls="pills-hotels" aria-selected="false">
                    <i class="bi bi-building me-2"></i>Hotels (<?php echo count($hotels); ?>)
                </button>
            </li>
        </ul>

        <div class="tab-content" id="pills-tabContent">
            
            <div class="tab-pane fade show active" id="pills-flights" role="tabpanel" aria-labelledby="flights-tab">
                <?php if (empty($flights)): ?>
                    <div class="empty-state">
                        <i class="bi bi-airplane" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h4 class="mt-3">No flight bookings yet</h4>
                        <p>Ready to take off? Book your first flight now.</p>
                        <a href="index.php" class="btn btn-primary mt-2">Book a Flight</a>
                    </div>
                <?php else: ?>
                    <?php foreach ($flights as $flight): ?>
                        <div class="booking-card">
                            <div class="card-header-custom">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-light p-2 rounded-circle">
                                        <i class="bi bi-airplane-engines text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-0 fw-bold"><?php echo htmlspecialchars($flight['NAME']); ?></h5>
                                        <small class="text-muted">Booking Ref: #FL-<?php echo $flight['ID']; ?></small>
                                    </div>
                                </div>
                                <span class="status-badge"><i class="bi bi-check-circle-fill me-1"></i> Confirmed</span>
                            </div>
                            <div class="card-body">
                                <div class="row g-4">
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Date</div>
                                        <div class="info-value"><?php echo htmlspecialchars(formatDate($flight['DATE_FROM'])); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Flight No.</div>
                                        <div class="info-value"><?php echo htmlspecialchars($flight['FLIGHT_NUMBER']); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Departure</div>
                                        <div class="info-value"><?php echo htmlspecialchars(formatDate($flight['DEPARTURE_TIME'], 'H:i')); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Passengers</div>
                                        <div class="info-value"><?php echo htmlspecialchars($flight['GUESTS']); ?></div>
                                    </div>
                                </div>
                                <hr class="my-3 opacity-25">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small">Paid via Credit Card</span>
                                    <span class="price-text"><?php echo $flight['CURRENCY'] . ' ' . number_format($flight['PRICE'], 2); ?></span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <div class="tab-pane fade" id="pills-hotels" role="tabpanel" aria-labelledby="hotels-tab">
                <?php if (empty($hotels)): ?>
                    <div class="empty-state">
                        <i class="bi bi-building" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h4 class="mt-3">No hotel bookings yet</h4>
                        <p>Find the perfect place to stay for your next trip.</p>
                        <a href="index.php" class="btn btn-primary mt-2">Book a Hotel</a>
                    </div>
                <?php else: ?>
                    <?php foreach ($hotels as $hotel): ?>
                        <div class="booking-card">
                            <div class="card-header-custom">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-light p-2 rounded-circle">
                                        <i class="bi bi-building text-success fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-0 fw-bold"><?php echo htmlspecialchars($hotel['NAME']); ?></h5>
                                        <small class="text-muted">Booking Ref: #HT-<?php echo $hotel['HOTEL_ID']; ?></small>
                                    </div>
                                </div>
                                <span class="status-badge"><i class="bi bi-check-circle-fill me-1"></i> Confirmed</span>
                            </div>
                            <div class="card-body">
                                <div class="row g-4">
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Check-in</div>
                                        <div class="info-value"><?php echo htmlspecialchars(formatDate($hotel['DATE_FROM'])); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Check-out</div>
                                        <div class="info-value"><?php echo htmlspecialchars(formatDate($hotel['DATE_TO'])); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Guests</div>
                                        <div class="info-value"><?php echo htmlspecialchars($hotel['GUESTS']); ?></div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="info-label">Category</div>
                                        <div class="info-value"><?php echo htmlspecialchars($hotel['CATEGORY']); ?></div>
                                    </div>
                                </div>
                                <hr class="my-3 opacity-25">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small">Paid via Credit Card</span>
                                    <span class="price-text"><?php echo $hotel['CURRENCY'] . ' ' . number_format($hotel['PRICE'], 2); ?></span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

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
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="#" class="social-icon">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
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
    <script src="script.js"></script>
</body>
</html>