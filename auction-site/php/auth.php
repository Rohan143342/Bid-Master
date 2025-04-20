<?php
/**
 * BidMaster Auction Site - User Authentication
 * 
 * This file contains functions for user authentication, registration,
 * and user management.
 */

require_once 'config.php';

/**
 * Register a new user
 * 
 * @param array $userData User registration data
 * @return array Response with status and message
 */
function registerUser($userData) {
    // Sanitize input
    $username = sanitizeInput($userData['username']);
    $email = sanitizeInput($userData['email']);
    $password = password_hash($userData['password'], PASSWORD_DEFAULT);
    $firstName = sanitizeInput($userData['first_name']);
    $lastName = sanitizeInput($userData['last_name']);
    
    // Check if username or email already exists
    $query = "SELECT id FROM users WHERE username = '$username' OR email = '$email'";
    $result = getRow($query);
    
    if ($result) {
        return [
            'status' => 'error',
            'message' => 'Username or email already exists'
        ];
    }
    
    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));
    
    // Insert new user
    $query = "INSERT INTO users (username, email, password, first_name, last_name, verification_token) 
              VALUES ('$username', '$email', '$password', '$firstName', '$lastName', '$verificationToken')";
    
    $userId = insertRow($query);
    
    if ($userId) {
        // Create wallet for new user
        $walletQuery = "INSERT INTO wallets (user_id) VALUES ($userId)";
        executeQuery($walletQuery);
        
        // Log activity
        logActivity($userId, 'register', 'New user registration');
        
        // Send verification email (implement this function based on your email service)
        sendVerificationEmail($email, $verificationToken);
        
        return [
            'status' => 'success',
            'message' => 'Registration successful. Please check your email to verify your account.'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Registration failed. Please try again.'
    ];
}

/**
 * Login user
 * 
 * @param string $username Username or email
 * @param string $password Password
 * @return array Response with status and message
 */
function loginUser($username, $password) {
    $username = sanitizeInput($username);
    
    // Get user data
    $query = "SELECT id, username, email, password, is_admin, is_verified, status 
              FROM users 
              WHERE (username = '$username' OR email = '$username')";
    
    $user = getRow($query);
    
    if (!$user) {
        return [
            'status' => 'error',
            'message' => 'Invalid username or password'
        ];
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        return [
            'status' => 'error',
            'message' => 'Invalid username or password'
        ];
    }
    
    // Check if user is verified
    if (!$user['is_verified']) {
        return [
            'status' => 'error',
            'message' => 'Please verify your email address'
        ];
    }
    
    // Check if user is active
    if ($user['status'] !== 'active') {
        return [
            'status' => 'error',
            'message' => 'Your account is ' . $user['status']
        ];
    }
    
    // Update last login
    $query = "UPDATE users SET last_login = NOW() WHERE id = {$user['id']}";
    executeQuery($query);
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['is_admin'] = $user['is_admin'];
    
    // Log activity
    logActivity($user['id'], 'login', 'User logged in');
    
    return [
        'status' => 'success',
        'message' => 'Login successful'
    ];
}

/**
 * Logout user
 * 
 * @return void
 */
function logoutUser() {
    if (isset($_SESSION['user_id'])) {
        logActivity($_SESSION['user_id'], 'logout', 'User logged out');
    }
    
    session_destroy();
    redirect('/auction-site/login.html');
}

/**
 * Verify user email
 * 
 * @param string $token Verification token
 * @return array Response with status and message
 */
function verifyEmail($token) {
    $token = sanitizeInput($token);
    
    $query = "UPDATE users 
              SET is_verified = TRUE, verification_token = NULL 
              WHERE verification_token = '$token'";
    
    $result = modifyRows($query);
    
    if ($result) {
        return [
            'status' => 'success',
            'message' => 'Email verified successfully. You can now login.'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Invalid verification token'
    ];
}

/**
 * Request password reset
 * 
 * @param string $email User's email
 * @return array Response with status and message
 */
function requestPasswordReset($email) {
    $email = sanitizeInput($email);
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    $query = "UPDATE users 
              SET reset_token = '$resetToken', reset_token_expiry = '$expiry' 
              WHERE email = '$email' AND is_verified = TRUE";
    
    $result = modifyRows($query);
    
    if ($result) {
        // Send reset email (implement this function based on your email service)
        sendPasswordResetEmail($email, $resetToken);
        
        return [
            'status' => 'success',
            'message' => 'Password reset instructions sent to your email'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Email not found or account not verified'
    ];
}

/**
 * Reset password
 * 
 * @param string $token Reset token
 * @param string $password New password
 * @return array Response with status and message
 */
function resetPassword($token, $password) {
    $token = sanitizeInput($token);
    $password = password_hash($password, PASSWORD_DEFAULT);
    
    $query = "UPDATE users 
              SET password = '$password', reset_token = NULL, reset_token_expiry = NULL 
              WHERE reset_token = '$token' 
              AND reset_token_expiry > NOW()";
    
    $result = modifyRows($query);
    
    if ($result) {
        return [
            'status' => 'success',
            'message' => 'Password reset successful. You can now login.'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Invalid or expired reset token'
    ];
}

/**
 * Update user profile
 * 
 * @param int $userId User ID
 * @param array $userData Updated user data
 * @return array Response with status and message
 */
function updateProfile($userId, $userData) {
    if (!isLoggedIn() || $_SESSION['user_id'] != $userId) {
        return [
            'status' => 'error',
            'message' => 'Unauthorized access'
        ];
    }
    
    $firstName = sanitizeInput($userData['first_name']);
    $lastName = sanitizeInput($userData['last_name']);
    $phone = sanitizeInput($userData['phone']);
    $address = sanitizeInput($userData['address']);
    $city = sanitizeInput($userData['city']);
    $state = sanitizeInput($userData['state']);
    $country = sanitizeInput($userData['country']);
    $postalCode = sanitizeInput($userData['postal_code']);
    
    $query = "UPDATE users 
              SET first_name = '$firstName',
                  last_name = '$lastName',
                  phone = '$phone',
                  address = '$address',
                  city = '$city',
                  state = '$state',
                  country = '$country',
                  postal_code = '$postalCode'
              WHERE id = $userId";
    
    $result = modifyRows($query);
    
    if ($result !== false) {
        logActivity($userId, 'update_profile', 'User profile updated');
        
        return [
            'status' => 'success',
            'message' => 'Profile updated successfully'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to update profile'
    ];
}

/**
 * Change password
 * 
 * @param int $userId User ID
 * @param string $currentPassword Current password
 * @param string $newPassword New password
 * @return array Response with status and message
 */
function changePassword($userId, $currentPassword, $newPassword) {
    if (!isLoggedIn() || $_SESSION['user_id'] != $userId) {
        return [
            'status' => 'error',
            'message' => 'Unauthorized access'
        ];
    }
    
    // Get current password hash
    $query = "SELECT password FROM users WHERE id = $userId";
    $user = getRow($query);
    
    if (!$user || !password_verify($currentPassword, $user['password'])) {
        return [
            'status' => 'error',
            'message' => 'Current password is incorrect'
        ];
    }
    
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $query = "UPDATE users SET password = '$newPasswordHash' WHERE id = $userId";
    $result = modifyRows($query);
    
    if ($result !== false) {
        logActivity($userId, 'change_password', 'Password changed');
        
        return [
            'status' => 'success',
            'message' => 'Password changed successfully'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to change password'
    ];
}

// Note: Implement these email functions based on your email service
function sendVerificationEmail($email, $token) {
    // TODO: Implement email sending functionality
}

function sendPasswordResetEmail($email, $token) {
    // TODO: Implement email sending functionality
} 