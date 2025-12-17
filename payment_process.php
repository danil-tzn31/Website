<?php
session_start();

// Auth check
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}

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

// Session validation
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
} else {
    die("User ID not found in session. Please login again.");
}

// Retrieve inputs
$category = $_POST['category'];
$name = $_POST['name'];
$price = $_POST['price'];
$currency = $_POST['currency'];
$date_from = $_POST['date_from'];
$date_to = $_POST['date_to'];
$guests = $_POST['guests'];
$flight_number = isset($_POST['flight_number']) ? $_POST['flight_number'] : '';
$departure_time = isset($_POST['departure_time']) ? $_POST['departure_time'] : '';

// Determine query based on category
if (!empty($flight_number)) {
    $queryInsertBooking = "INSERT INTO FLIGHTS_BOOKINGS (
        USER_ID, CATEGORY, NAME, PRICE, CURRENCY, DATE_FROM, DATE_TO, GUESTS, FLIGHT_NUMBER, DEPARTURE_TIME
    ) VALUES (
        '$user_id', '$category', '$name', '$price', '$currency', '$date_from', '$date_to', '$guests', '$flight_number', '$departure_time'
    )";
} else {
    $queryInsertBooking = "INSERT INTO HOTELS_BOOKINGS (
        USER_ID, CATEGORY, NAME, PRICE, CURRENCY, DATE_FROM, DATE_TO, GUESTS
    ) VALUES (
        '$user_id', '$category', '$name', '$price', '$currency', '$date_from', '$date_to', '$guests'
    )";
}

$result = sqlsrv_query($conn, $queryInsertBooking);

if ($result === false) {
    echo "Error inserting data: " . print_r(sqlsrv_errors(), true);
} else {
    header("Location: booking_success.php");
    exit();
}

sqlsrv_close($conn);
?>