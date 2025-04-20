<?php
/**
 * BidMaster Auction Site - Wallet Operations
 * 
 * This file contains functions for managing user wallets
 * and transactions.
 */

require_once 'config.php';

/**
 * Get user's wallet balance
 * 
 * @param int $userId User ID
 * @return float|false User's balance or false on failure
 */
function getWalletBalance($userId = null) {
    if (!$userId && !isLoggedIn()) {
        return false;
    }
    
    $userId = $userId ?: $_SESSION['user_id'];
    
    $query = "SELECT balance FROM wallets WHERE user_id = $userId";
    $result = getRow($query);
    
    return $result ? $result['balance'] : false;
}

/**
 * Add funds to user's wallet
 * 
 * @param float $amount Amount to add
 * @param string $referenceId Payment reference ID
 * @return array Response with status and message
 */
function addFunds($amount, $referenceId) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to add funds'
        ];
    }
    
    $userId = $_SESSION['user_id'];
    $amount = (float)$amount;
    
    if ($amount <= 0) {
        return [
            'status' => 'error',
            'message' => 'Invalid amount'
        ];
    }
    
    // Start transaction
    $conn = getDbConnection();
    $conn->begin_transaction();
    
    try {
        // Add transaction record
        $query = "INSERT INTO transactions (user_id, amount, type, reference_id, status)
                  VALUES ($userId, $amount, 'deposit', '$referenceId', 'completed')";
        $conn->query($query);
        
        // Update wallet balance
        $query = "UPDATE wallets 
                  SET balance = balance + $amount 
                  WHERE user_id = $userId";
        $conn->query($query);
        
        $conn->commit();
        
        logActivity($userId, 'add_funds', "Added \$$amount to wallet");
        
        return [
            'status' => 'success',
            'message' => "Successfully added \$$amount to your wallet",
            'new_balance' => getWalletBalance($userId)
        ];
        
    } catch (Exception $e) {
        $conn->rollback();
        
        return [
            'status' => 'error',
            'message' => 'Failed to add funds'
        ];
    }
}

/**
 * Withdraw funds from user's wallet
 * 
 * @param float $amount Amount to withdraw
 * @param string $referenceId Payment reference ID
 * @return array Response with status and message
 */
function withdrawFunds($amount, $referenceId) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to withdraw funds'
        ];
    }
    
    $userId = $_SESSION['user_id'];
    $amount = (float)$amount;
    
    if ($amount <= 0) {
        return [
            'status' => 'error',
            'message' => 'Invalid amount'
        ];
    }
    
    // Check balance
    $balance = getWalletBalance($userId);
    if ($balance < $amount) {
        return [
            'status' => 'error',
            'message' => 'Insufficient funds'
        ];
    }
    
    // Start transaction
    $conn = getDbConnection();
    $conn->begin_transaction();
    
    try {
        // Add transaction record
        $query = "INSERT INTO transactions (user_id, amount, type, reference_id, status)
                  VALUES ($userId, $amount, 'withdrawal', '$referenceId', 'pending')";
        $conn->query($query);
        
        // Update wallet balance
        $query = "UPDATE wallets 
                  SET balance = balance - $amount 
                  WHERE user_id = $userId";
        $conn->query($query);
        
        $conn->commit();
        
        logActivity($userId, 'withdraw_funds', "Withdrew \$$amount from wallet");
        
        return [
            'status' => 'success',
            'message' => "Withdrawal of \$$amount initiated",
            'new_balance' => getWalletBalance($userId)
        ];
        
    } catch (Exception $e) {
        $conn->rollback();
        
        return [
            'status' => 'error',
            'message' => 'Failed to withdraw funds'
        ];
    }
}

/**
 * Process bid payment when auction ends
 * 
 * @param int $auctionId Auction ID
 * @param int $bidderId Winning bidder ID
 * @param float $amount Winning bid amount
 * @return array Response with status and message
 */
function processBidPayment($auctionId, $bidderId, $amount) {
    // Get auction details
    $query = "SELECT seller_id FROM auctions WHERE id = $auctionId";
    $auction = getRow($query);
    
    if (!$auction) {
        return [
            'status' => 'error',
            'message' => 'Auction not found'
        ];
    }
    
    $sellerId = $auction['seller_id'];
    $amount = (float)$amount;
    
    // Calculate commission
    $query = "SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'";
    $result = getRow($query);
    $commissionRate = $result ? (float)$result['setting_value'] : 5;
    $commission = $amount * ($commissionRate / 100);
    $sellerAmount = $amount - $commission;
    
    // Start transaction
    $conn = getDbConnection();
    $conn->begin_transaction();
    
    try {
        // Record buyer's payment
        $query = "INSERT INTO transactions (user_id, amount, type, reference_id, status)
                  VALUES ($bidderId, $amount, 'bid', 'auction_$auctionId', 'completed')";
        $conn->query($query);
        
        // Record seller's payment
        $query = "INSERT INTO transactions (user_id, amount, type, reference_id, status)
                  VALUES ($sellerId, $sellerAmount, 'bid', 'auction_$auctionId', 'completed')";
        $conn->query($query);
        
        // Record commission
        $query = "INSERT INTO transactions (user_id, amount, type, reference_id, status)
                  VALUES (1, $commission, 'commission', 'auction_$auctionId', 'completed')";
        $conn->query($query);
        
        // Update seller's wallet
        $query = "UPDATE wallets 
                  SET balance = balance + $sellerAmount 
                  WHERE user_id = $sellerId";
        $conn->query($query);
        
        $conn->commit();
        
        // Log activities
        logActivity($bidderId, 'bid_payment', "Paid \$$amount for auction #$auctionId");
        logActivity($sellerId, 'bid_payment', "Received \$$sellerAmount from auction #$auctionId");
        
        return [
            'status' => 'success',
            'message' => 'Payment processed successfully'
        ];
        
    } catch (Exception $e) {
        $conn->rollback();
        
        return [
            'status' => 'error',
            'message' => 'Failed to process payment'
        ];
    }
}

/**
 * Get user's transaction history
 * 
 * @param int $userId User ID
 * @param int $page Page number
 * @param int $limit Items per page
 * @return array Transactions list and total count
 */
function getTransactionHistory($userId = null, $page = 1, $limit = 10) {
    if (!$userId && !isLoggedIn()) {
        return [
            'transactions' => [],
            'total' => 0,
            'pages' => 0
        ];
    }
    
    $userId = $userId ?: $_SESSION['user_id'];
    
    // Get total count
    $query = "SELECT COUNT(*) as total FROM transactions WHERE user_id = $userId";
    $result = getRow($query);
    $total = $result['total'];
    
    // Calculate offset
    $offset = ($page - 1) * $limit;
    
    // Get transactions
    $query = "SELECT * FROM transactions 
              WHERE user_id = $userId 
              ORDER BY created_at DESC 
              LIMIT $offset, $limit";
    $transactions = getRows($query);
    
    return [
        'transactions' => $transactions,
        'total' => $total,
        'pages' => ceil($total / $limit)
    ];
}

/**
 * Update transaction status
 * 
 * @param int $transactionId Transaction ID
 * @param string $status New status
 * @return array Response with status and message
 */
function updateTransactionStatus($transactionId, $status) {
    if (!isAdmin()) {
        return [
            'status' => 'error',
            'message' => 'Unauthorized access'
        ];
    }
    
    $validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        return [
            'status' => 'error',
            'message' => 'Invalid status'
        ];
    }
    
    $query = "UPDATE transactions SET status = '$status' WHERE id = $transactionId";
    $result = modifyRows($query);
    
    if ($result !== false) {
        logActivity($_SESSION['user_id'], 'update_transaction', "Updated transaction #$transactionId status to $status");
        
        return [
            'status' => 'success',
            'message' => 'Transaction status updated'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to update transaction status'
    ];
}

/**
 * Get wallet statistics
 * 
 * @param int $userId User ID
 * @return array Wallet statistics
 */
function getWalletStats($userId = null) {
    if (!$userId && !isLoggedIn()) {
        return false;
    }
    
    $userId = $userId ?: $_SESSION['user_id'];
    
    $query = "SELECT 
                w.balance as current_balance,
                COUNT(DISTINCT t.id) as total_transactions,
                SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposits,
                SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_withdrawals,
                SUM(CASE WHEN t.type = 'bid' THEN t.amount ELSE 0 END) as total_bids,
                COUNT(DISTINCT CASE WHEN t.type = 'bid' THEN t.reference_id END) as total_auctions_won
              FROM wallets w
              LEFT JOIN transactions t ON t.user_id = w.user_id
              WHERE w.user_id = $userId
              GROUP BY w.user_id";
    
    return getRow($query);
} 