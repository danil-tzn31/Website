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

// Retrieve inputs
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$username = $_POST['username'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];

if ($password !== $confirmPassword) {
    die("Error: Passwords do not match!");
}

// Check Username
$queryCheckUsername = "SELECT * FROM USERINFO WHERE USERNAME = '$username'";
$resultCheck = sqlsrv_query($conn, $queryCheckUsername);

if ($resultCheck === false) {
    die("Error checking username: " . print_r(sqlsrv_errors(), true));
}

if (sqlsrv_fetch_array($resultCheck) != null) {
    die("Error: Username already exists! Please choose a different username.");
}

// Check Email
$queryCheckEmail = "SELECT * FROM USERINFO WHERE EMAIL = '$email'";
$resultEmailCheck = sqlsrv_query($conn, $queryCheckEmail);

if ($resultEmailCheck === false) {
    die("Error checking email: " . print_r(sqlsrv_errors(), true));
}

if (sqlsrv_fetch_array($resultEmailCheck) != null) {
    die("Error: Email already exists! Please use a different email address.");
}

// Insert User
$queryInsertUser = "INSERT INTO USERINFO (
    EMAIL, PASSWORDS, USERNAME, FIRST_NAME, LAST_NAME, MOBILE
) VALUES (
    '$email', '$password', '$username', '$firstName', '$lastName', '$phone'
)";

$result = sqlsrv_query($conn, $queryInsertUser);

if ($result == true) {
    header("Location: booking_success.php");
} else {
    echo "Error: " . print_r(sqlsrv_errors(), true);
}

sqlsrv_close($conn);
?>