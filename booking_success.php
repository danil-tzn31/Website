<?php
session_start();

// Security Check
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Successful - Halina</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/successregister.css">
</head>
<body>
    <div class="success-overlay"></div>
    
    <div class="success-container">
        <h1>Booking Confirmed!</h1>
        <p>Your trip has been successfully booked. Pack your bags and get ready for your adventure with Halina!</p>
        <a href="index.php" class="btn btn-login">Back to Homepage</a>
    </div>
</body>
</html>