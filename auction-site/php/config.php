<?php
/**
 * BidMaster Auction Site - Database Configuration
 * 
 * This file contains the database connection settings and helper functions
 * for interacting with the MySQL database.
 */

// Database connection settings
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'auction_site');

// Error reporting settings
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Database connection function
 * 
 * @return mysqli|false Returns mysqli connection object or false on failure
 */
function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        error_log("Connection failed: " . $conn->connect_error);
        return false;
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

/**
 * Sanitize user input
 * 
 * @param string $input The input to sanitize
 * @return string The sanitized input
 */
function sanitizeInput($input) {
    $conn = getDbConnection();
    if ($conn) {
        $input = $conn->real_escape_string(trim($input));
        $conn->close();
    } else {
        $input = htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    return $input;
}

/**
 * Execute a query and return the result
 * 
 * @param string $query The SQL query to execute
 * @return mysqli_result|bool Query result or false on failure
 */
function executeQuery($query) {
    $conn = getDbConnection();
    if (!$conn) {
        return false;
    }
    
    $result = $conn->query($query);
    $conn->close();
    
    return $result;
}

/**
 * Get a single row from the database
 * 
 * @param string $query The SQL query to execute
 * @return array|false Associative array with the row data or false on failure
 */
function getRow($query) {
    $result = executeQuery($query);
    if ($result && $result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    return false;
}

/**
 * Get multiple rows from the database
 * 
 * @param string $query The SQL query to execute
 * @return array Array of associative arrays with the row data
 */
function getRows($query) {
    $result = executeQuery($query);
    $rows = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
    }
    
    return $rows;
}

/**
 * Insert a row into the database and return the inserted ID
 * 
 * @param string $query The SQL query to execute
 * @return int|false The ID of the inserted row or false on failure
 */
function insertRow($query) {
    $conn = getDbConnection();
    if (!$conn) {
        return false;
    }
    
    if ($conn->query($query)) {
        $id = $conn->insert_id;
        $conn->close();
        return $id;
    }
    
    $conn->close();
    return false;
}

/**
 * Update or delete rows in the database
 * 
 * @param string $query The SQL query to execute
 * @return int|false The number of affected rows or false on failure
 */
function modifyRows($query) {
    $conn = getDbConnection();
    if (!$conn) {
        return false;
    }
    
    if ($conn->query($query)) {
        $affected = $conn->affected_rows;
        $conn->close();
        return $affected;
    }
    
    $conn->close();
    return false;
}

/**
 * Check if a user is logged in
 * 
 * @return bool True if user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if the current user is an admin
 * 
 * @return bool True if user is an admin, false otherwise
 */
function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

/**
 * Redirect to a different page
 * 
 * @param string $url The URL to redirect to
 * @return void
 */
function redirect($url) {
    header("Location: $url");
    exit;
}

/**
 * Set a flash message
 * 
 * @param string $type The type of message (success, error, info, warning)
 * @param string $message The message to display
 * @return void
 */
function setFlashMessage($type, $message) {
    $_SESSION['flash_message'] = [
        'type' => $type,
        'message' => $message
    ];
}

/**
 * Get and clear the flash message
 * 
 * @return array|false The flash message or false if none exists
 */
function getFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $message = $_SESSION['flash_message'];
        unset($_SESSION['flash_message']);
        return $message;
    }
    return false;
}

/**
 * Log user activity
 * 
 * @param int $userId The ID of the user
 * @param string $action The action performed
 * @param string $description Description of the action
 * @return bool True on success, false on failure
 */
function logActivity($userId, $action, $description = '') {
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    
    $query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
              VALUES ($userId, '$action', '$description', '$ipAddress', '$userAgent')";
    
    return executeQuery($query) !== false;
} 