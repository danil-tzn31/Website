<?php
session_start();

// Security Check
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}

$user_id = $_SESSION['user_id']; 

// Retrieve Data
$category = isset($_POST['category']) ? $_POST['category'] : '';
$name = isset($_POST['name']) ? $_POST['name'] : '';
$priceRaw = isset($_POST['price']) ? $_POST['price'] : 0;
$currency = isset($_POST['currency']) ? $_POST['currency'] : 'USD';
$date_from = isset($_POST['date_from']) ? $_POST['date_from'] : '';
$date_to = isset($_POST['date_to']) ? $_POST['date_to'] : '';
$guests = isset($_POST['guests']) ? $_POST['guests'] : '';
$flight_number = isset($_POST['flight_number']) ? $_POST['flight_number'] : '';
$departure_time = isset($_POST['departure_time']) ? $_POST['departure_time'] : '';

$displayPrice = "USD " . number_format((float)$priceRaw, 2);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Payment - Halina</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/payment.css">
</head>
<body>

    <div class="checkout-container">
        
        <div class="summary-panel">
            <a href="index.php" class="brand-logo">Halina</a>
            
            <div class="mt-4 w-100">
                <h5 class="text-uppercase small fw-bold mb-3" style="opacity: 0.8;">Booking Summary</h5>
                
                <div class="summary-card">
                    <div class="badge bg-primary mb-3"><?php echo htmlspecialchars($category); ?></div>
                    <h2 class="h3 fw-bold mb-4"><?php echo htmlspecialchars($name); ?></h2>
                    
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-calendar-check fs-5 me-3"></i>
                        <div>
                            <small class="d-block text-uppercase" style="font-size: 0.7rem; opacity: 0.7;">Check-in/Date</small>
                            <span class="fw-bold"><?php echo htmlspecialchars($date_from); ?></span>
                        </div>
                    </div>

                    <?php if($date_to && $date_to !== 'Flexible'): ?>
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-calendar-x fs-5 me-3"></i>
                        <div>
                            <small class="d-block text-uppercase" style="font-size: 0.7rem; opacity: 0.7;">Check-out</small>
                            <span class="fw-bold"><?php echo htmlspecialchars($date_to); ?></span>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php if(!empty($flight_number)): ?>
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-airplane fs-5 me-3"></i>
                        <div>
                            <small class="d-block text-uppercase" style="font-size: 0.7rem; opacity: 0.7;">Flight No.</small>
                            <span class="fw-bold"><?php echo htmlspecialchars($flight_number); ?></span>
                        </div>
                    </div>
                    <?php endif; ?>

                    <div class="d-flex align-items-center mb-4">
                        <i class="bi bi-people fs-5 me-3"></i>
                        <div>
                            <small class="d-block text-uppercase" style="font-size: 0.7rem; opacity: 0.7;">Guests</small>
                            <span class="fw-bold"><?php echo htmlspecialchars($guests); ?></span>
                        </div>
                    </div>

                    <hr class="my-4" style="border-color: rgba(255,255,255,0.2);">
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">Total to pay</span>
                        <div class="price-tag"><?php echo $displayPrice; ?></div>
                    </div>
                </div>
                
                <div class="mt-4 small text-center" style="opacity: 0.7;">
                    <i class="bi bi-info-circle me-1"></i> Free cancellation within 24 hours of booking.
                </div>
            </div>
        </div>

        <div class="payment-panel">
            <div class="payment-form-wrapper">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-0 fw-bold" style="color: #333;">Payment Details</h4>
                    <span class="secure-badge"><i class="bi bi-shield-lock-fill me-1"></i> SSL Encrypted</span>
                </div>

                <form action="payment_process.php" method="POST" class="payment-form">
                    
                    <input type="hidden" name="user_id" value="<?php echo htmlspecialchars($user_id); ?>">
                    <input type="hidden" name="category" value="<?php echo htmlspecialchars($category); ?>">
                    <input type="hidden" name="name" value="<?php echo htmlspecialchars($name); ?>">
                    <input type="hidden" name="price" value="<?php echo htmlspecialchars($priceRaw); ?>">
                    <input type="hidden" name="currency" value="<?php echo htmlspecialchars($currency); ?>">
                    <input type="hidden" name="date_from" value="<?php echo htmlspecialchars($date_from); ?>">
                    <input type="hidden" name="date_to" value="<?php echo htmlspecialchars($date_to); ?>">
                    <input type="hidden" name="guests" value="<?php echo htmlspecialchars($guests); ?>">
                    <input type="hidden" name="flight_number" value="<?php echo htmlspecialchars($flight_number); ?>">
                    <input type="hidden" name="departure_time" value="<?php echo htmlspecialchars($departure_time); ?>">

                    <div class="mb-3">
                        <label class="form-label">Cardholder Name</label>
                        <input type="text" class="form-control" placeholder="Juan Dela Cruz" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Card Number</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-credit-card"></i></span>
                            <input type="text" class="form-control border-start-0" placeholder="0000 0000 0000 0000" maxlength="19" required>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-6">
                            <label class="form-label">Expiry Date</label>
                            <input type="text" class="form-control" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label">CVV</label>
                            <div class="input-group">
                                <input type="password" class="form-control border-end-0" placeholder="123" maxlength="4" required>
                                <span class="input-group-text bg-white border-start-0"><i class="bi bi-question-circle text-muted"></i></span>
                            </div>
                        </div>
                    </div>

                    <div class="form-check mb-4 mt-3">
                        <input class="form-check-input" type="checkbox" id="saveCard">
                        <label class="form-check-label text-muted" for="saveCard">
                            Save this card for future bookings securely.
                        </label>
                    </div>

                    <button type="submit" class="btn btn-payment">
                        Pay <?php echo $displayPrice; ?> & Confirm
                    </button>
                    
                    <div class="text-center mt-3">
                        <a href="index.php" class="text-decoration-none text-muted small">Cancel and Return to Home</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>