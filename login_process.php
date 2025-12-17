<?php
session_start();

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

$email = $_POST['email'];
$password = $_POST['password'];

// Authenticate
$queryCheckLogin = "SELECT * FROM USERINFO WHERE EMAIL = '$email' AND PASSWORDS = '$password'";
$result = sqlsrv_query($conn, $queryCheckLogin);

if ($result === false) {
    die("Error checking credentials: " . print_r(sqlsrv_errors(), true));
}

// Check if user exists using sqlsrv_has_rows instead of fetch_assoc
if (sqlsrv_has_rows($result) === true) {
    $row = sqlsrv_fetch_array($result); // Default fetch (BOTH)

    // User exists, store user info in session
    $_SESSION['user_id'] = $row['UserID'];
    $_SESSION['username'] = $row['USERNAME'];
    $_SESSION['first_name'] = $row['FIRST_NAME'];
    $_SESSION['last_name'] = $row['LAST_NAME'];
    $_SESSION['email'] = $row['EMAIL'];
    $_SESSION['logged_in'] = true;
    
    header("Location: index.php");
    exit();
} else {
    // Invalid credentials
    $_SESSION['login_error'] = "Invalid email or password. Please try again.";
    header("Location: index.php");
    exit();
}

sqlsrv_close($conn);
?>