<?php
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
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Successful - GalaGo Travel</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/successregister.css">
</head>
<body>
    <div class="success-overlay"></div>
    
    <div class="success-container">
        <h1>You're all set!</h1>
        <p>Your account has been created successfully. You can now log in to start your journey with GalaGo.</p>
        <a href="index.php" class="btn btn-login">Back to Homepage</a>
    </div>
</body>
</html>