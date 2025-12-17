<?php
session_start();

// Clear and destroy session
session_unset();
session_destroy();

// Redirect
header("Location: index.php");
exit();
?>