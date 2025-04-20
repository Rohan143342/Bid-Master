<?php
/**
 * BidMaster Auction Site - Auction Operations
 * 
 * This file contains functions for managing auctions, including
 * creating, updating, bidding, and retrieving auction data.
 */

require_once 'config.php';

/**
 * Create a new auction
 * 
 * @param array $auctionData Auction details
 * @param array $images Array of image files
 * @return array Response with status and message
 */
function createAuction($auctionData, $images = []) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to create an auction'
        ];
    }
    
    // Sanitize input
    $sellerId = $_SESSION['user_id'];
    $categoryId = (int)$auctionData['category_id'];
    $title = sanitizeInput($auctionData['title']);
    $description = sanitizeInput($auctionData['description']);
    $startingBid = (float)$auctionData['starting_bid'];
    $reservePrice = isset($auctionData['reserve_price']) ? (float)$auctionData['reserve_price'] : null;
    $buyNowPrice = isset($auctionData['buy_now_price']) ? (float)$auctionData['buy_now_price'] : null;
    $minBidIncrement = isset($auctionData['min_bid_increment']) ? (float)$auctionData['min_bid_increment'] : 1.00;
    $startTime = sanitizeInput($auctionData['start_time']);
    $endTime = sanitizeInput($auctionData['end_time']);
    
    // Validate dates
    if (strtotime($startTime) < time()) {
        return [
            'status' => 'error',
            'message' => 'Start time must be in the future'
        ];
    }
    
    if (strtotime($endTime) <= strtotime($startTime)) {
        return [
            'status' => 'error',
            'message' => 'End time must be after start time'
        ];
    }
    
    // Insert auction
    $query = "INSERT INTO auctions (
                seller_id, category_id, title, description, 
                starting_bid, reserve_price, buy_now_price, min_bid_increment,
                start_time, end_time, status
              ) VALUES (
                $sellerId, $categoryId, '$title', '$description',
                $startingBid, " . ($reservePrice ? $reservePrice : "NULL") . ",
                " . ($buyNowPrice ? $buyNowPrice : "NULL") . ", $minBidIncrement,
                '$startTime', '$endTime', 'pending'
              )";
    
    $auctionId = insertRow($query);
    
    if (!$auctionId) {
        return [
            'status' => 'error',
            'message' => 'Failed to create auction'
        ];
    }
    
    // Handle image uploads
    if (!empty($images)) {
        $uploadPath = '../images/auctions/' . $auctionId . '/';
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }
        
        foreach ($images as $index => $image) {
            $fileName = time() . '_' . $index . '_' . sanitizeInput($image['name']);
            $filePath = $uploadPath . $fileName;
            
            if (move_uploaded_file($image['tmp_name'], $filePath)) {
                $isPrimary = $index === 0 ? 1 : 0;
                $query = "INSERT INTO auction_images (auction_id, image_path, is_primary, display_order)
                         VALUES ($auctionId, 'images/auctions/$auctionId/$fileName', $isPrimary, $index)";
                executeQuery($query);
            }
        }
    }
    
    logActivity($sellerId, 'create_auction', "Created auction ID: $auctionId");
    
    return [
        'status' => 'success',
        'message' => 'Auction created successfully',
        'auction_id' => $auctionId
    ];
}

/**
 * Update an existing auction
 * 
 * @param int $auctionId Auction ID
 * @param array $auctionData Updated auction details
 * @return array Response with status and message
 */
function updateAuction($auctionId, $auctionData) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to update the auction'
        ];
    }
    
    // Check if user owns the auction
    $query = "SELECT seller_id, status FROM auctions WHERE id = $auctionId";
    $auction = getRow($query);
    
    if (!$auction || $auction['seller_id'] != $_SESSION['user_id']) {
        return [
            'status' => 'error',
            'message' => 'Unauthorized access'
        ];
    }
    
    if ($auction['status'] != 'draft' && $auction['status'] != 'pending') {
        return [
            'status' => 'error',
            'message' => 'Cannot update active or ended auctions'
        ];
    }
    
    // Sanitize input
    $categoryId = (int)$auctionData['category_id'];
    $title = sanitizeInput($auctionData['title']);
    $description = sanitizeInput($auctionData['description']);
    $startingBid = (float)$auctionData['starting_bid'];
    $reservePrice = isset($auctionData['reserve_price']) ? (float)$auctionData['reserve_price'] : null;
    $buyNowPrice = isset($auctionData['buy_now_price']) ? (float)$auctionData['buy_now_price'] : null;
    $minBidIncrement = isset($auctionData['min_bid_increment']) ? (float)$auctionData['min_bid_increment'] : 1.00;
    $startTime = sanitizeInput($auctionData['start_time']);
    $endTime = sanitizeInput($auctionData['end_time']);
    
    $query = "UPDATE auctions 
              SET category_id = $categoryId,
                  title = '$title',
                  description = '$description',
                  starting_bid = $startingBid,
                  reserve_price = " . ($reservePrice ? $reservePrice : "NULL") . ",
                  buy_now_price = " . ($buyNowPrice ? $buyNowPrice : "NULL") . ",
                  min_bid_increment = $minBidIncrement,
                  start_time = '$startTime',
                  end_time = '$endTime'
              WHERE id = $auctionId";
    
    $result = modifyRows($query);
    
    if ($result !== false) {
        logActivity($_SESSION['user_id'], 'update_auction', "Updated auction ID: $auctionId");
        
        return [
            'status' => 'success',
            'message' => 'Auction updated successfully'
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to update auction'
    ];
}

/**
 * Place a bid on an auction
 * 
 * @param int $auctionId Auction ID
 * @param float $bidAmount Bid amount
 * @param bool $isAutoBid Whether this is an auto-bid
 * @return array Response with status and message
 */
function placeBid($auctionId, $bidAmount, $isAutoBid = false) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to place a bid'
        ];
    }
    
    $userId = $_SESSION['user_id'];
    $bidAmount = (float)$bidAmount;
    
    // Get auction details
    $query = "SELECT a.*, w.balance 
              FROM auctions a 
              LEFT JOIN wallets w ON w.user_id = $userId
              WHERE a.id = $auctionId";
    $auction = getRow($query);
    
    if (!$auction) {
        return [
            'status' => 'error',
            'message' => 'Auction not found'
        ];
    }
    
    // Various validation checks
    if ($auction['status'] != 'active') {
        return [
            'status' => 'error',
            'message' => 'This auction is not active'
        ];
    }
    
    if ($auction['seller_id'] == $userId) {
        return [
            'status' => 'error',
            'message' => 'You cannot bid on your own auction'
        ];
    }
    
    if (time() < strtotime($auction['start_time'])) {
        return [
            'status' => 'error',
            'message' => 'This auction has not started yet'
        ];
    }
    
    if (time() > strtotime($auction['end_time'])) {
        return [
            'status' => 'error',
            'message' => 'This auction has ended'
        ];
    }
    
    $minBid = $auction['current_bid'] 
        ? $auction['current_bid'] + $auction['min_bid_increment']
        : $auction['starting_bid'];
    
    if ($bidAmount < $minBid) {
        return [
            'status' => 'error',
            'message' => "Minimum bid amount is $minBid"
        ];
    }
    
    if ($auction['balance'] < $bidAmount) {
        return [
            'status' => 'error',
            'message' => 'Insufficient funds in your wallet'
        ];
    }
    
    // Start transaction
    $conn = getDbConnection();
    $conn->begin_transaction();
    
    try {
        // Insert bid
        $query = "INSERT INTO bids (auction_id, bidder_id, bid_amount, is_auto_bid)
                  VALUES ($auctionId, $userId, $bidAmount, " . ($isAutoBid ? 1 : 0) . ")";
        $conn->query($query);
        
        // Update auction
        $query = "UPDATE auctions 
                  SET current_bid = $bidAmount,
                      bid_count = bid_count + 1
                  WHERE id = $auctionId";
        $conn->query($query);
        
        // Update previous winning bid
        $query = "UPDATE bids 
                  SET is_winning_bid = FALSE 
                  WHERE auction_id = $auctionId 
                  AND is_winning_bid = TRUE";
        $conn->query($query);
        
        // Set new winning bid
        $query = "UPDATE bids 
                  SET is_winning_bid = TRUE 
                  WHERE auction_id = $auctionId 
                  AND bidder_id = $userId 
                  AND bid_amount = $bidAmount";
        $conn->query($query);
        
        $conn->commit();
        
        // Log activity and notify seller
        logActivity($userId, 'place_bid', "Placed bid on auction ID: $auctionId");
        notifyUser($auction['seller_id'], 'New Bid', "New bid of $$bidAmount placed on your auction: {$auction['title']}");
        
        return [
            'status' => 'success',
            'message' => 'Bid placed successfully'
        ];
        
    } catch (Exception $e) {
        $conn->rollback();
        
        return [
            'status' => 'error',
            'message' => 'Failed to place bid'
        ];
    }
}

/**
 * Get auction details
 * 
 * @param int $auctionId Auction ID
 * @return array|false Auction details or false if not found
 */
function getAuctionDetails($auctionId) {
    $query = "SELECT a.*, 
                     c.name as category_name,
                     u.username as seller_username,
                     u.first_name as seller_first_name,
                     u.last_name as seller_last_name,
                     COUNT(DISTINCT w.id) as watchlist_count,
                     GROUP_CONCAT(DISTINCT ai.image_path) as images
              FROM auctions a
              LEFT JOIN categories c ON c.id = a.category_id
              LEFT JOIN users u ON u.id = a.seller_id
              LEFT JOIN watchlist w ON w.auction_id = a.id
              LEFT JOIN auction_images ai ON ai.auction_id = a.id
              WHERE a.id = $auctionId
              GROUP BY a.id";
    
    $auction = getRow($query);
    
    if ($auction) {
        // Increment view count
        $query = "UPDATE auctions SET view_count = view_count + 1 WHERE id = $auctionId";
        executeQuery($query);
        
        // Get bid history
        $query = "SELECT b.*, u.username as bidder_username
                  FROM bids b
                  LEFT JOIN users u ON u.id = b.bidder_id
                  WHERE b.auction_id = $auctionId
                  ORDER BY b.bid_amount DESC, b.created_at DESC";
        $auction['bids'] = getRows($query);
        
        // Convert images string to array
        $auction['images'] = $auction['images'] ? explode(',', $auction['images']) : [];
        
        return $auction;
    }
    
    return false;
}

/**
 * Get auctions list with filters
 * 
 * @param array $filters Filter parameters
 * @param int $page Page number
 * @param int $limit Items per page
 * @return array Auctions list and total count
 */
function getAuctions($filters = [], $page = 1, $limit = 12) {
    $where = ['a.status = "active"'];
    $params = [];
    
    // Apply filters
    if (!empty($filters['category_id'])) {
        $where[] = "a.category_id = " . (int)$filters['category_id'];
    }
    
    if (!empty($filters['search'])) {
        $search = sanitizeInput($filters['search']);
        $where[] = "(a.title LIKE '%$search%' OR a.description LIKE '%$search%')";
    }
    
    if (!empty($filters['min_price'])) {
        $where[] = "a.current_bid >= " . (float)$filters['min_price'];
    }
    
    if (!empty($filters['max_price'])) {
        $where[] = "a.current_bid <= " . (float)$filters['max_price'];
    }
    
    if (!empty($filters['seller_id'])) {
        $where[] = "a.seller_id = " . (int)$filters['seller_id'];
    }
    
    // Build query
    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    
    // Get total count
    $query = "SELECT COUNT(DISTINCT a.id) as total 
              FROM auctions a 
              $whereClause";
    $result = getRow($query);
    $total = $result['total'];
    
    // Calculate offset
    $offset = ($page - 1) * $limit;
    
    // Get auctions
    $query = "SELECT a.*, 
                     c.name as category_name,
                     u.username as seller_username,
                     COUNT(DISTINCT w.id) as watchlist_count,
                     COUNT(DISTINCT b.id) as total_bids,
                     MIN(ai.image_path) as primary_image
              FROM auctions a
              LEFT JOIN categories c ON c.id = a.category_id
              LEFT JOIN users u ON u.id = a.seller_id
              LEFT JOIN watchlist w ON w.auction_id = a.id
              LEFT JOIN bids b ON b.auction_id = a.id
              LEFT JOIN auction_images ai ON ai.auction_id = a.id AND ai.is_primary = 1
              $whereClause
              GROUP BY a.id
              ORDER BY a.is_featured DESC, a.created_at DESC
              LIMIT $offset, $limit";
    
    $auctions = getRows($query);
    
    return [
        'auctions' => $auctions,
        'total' => $total,
        'pages' => ceil($total / $limit)
    ];
}

/**
 * Add/remove auction from user's watchlist
 * 
 * @param int $auctionId Auction ID
 * @return array Response with status and message
 */
function toggleWatchlist($auctionId) {
    if (!isLoggedIn()) {
        return [
            'status' => 'error',
            'message' => 'Please login to manage your watchlist'
        ];
    }
    
    $userId = $_SESSION['user_id'];
    
    // Check if already in watchlist
    $query = "SELECT id FROM watchlist WHERE user_id = $userId AND auction_id = $auctionId";
    $exists = getRow($query);
    
    if ($exists) {
        // Remove from watchlist
        $query = "DELETE FROM watchlist WHERE user_id = $userId AND auction_id = $auctionId";
        $result = modifyRows($query);
        
        if ($result !== false) {
            return [
                'status' => 'success',
                'message' => 'Removed from watchlist',
                'action' => 'removed'
            ];
        }
    } else {
        // Add to watchlist
        $query = "INSERT INTO watchlist (user_id, auction_id) VALUES ($userId, $auctionId)";
        $result = insertRow($query);
        
        if ($result) {
            return [
                'status' => 'success',
                'message' => 'Added to watchlist',
                'action' => 'added'
            ];
        }
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to update watchlist'
    ];
}

/**
 * End an auction
 * 
 * @param int $auctionId Auction ID
 * @return array Response with status and message
 */
function endAuction($auctionId) {
    // Get auction details
    $query = "SELECT a.*, b.bidder_id, b.bid_amount, u.email as winner_email
              FROM auctions a
              LEFT JOIN bids b ON b.auction_id = a.id AND b.is_winning_bid = TRUE
              LEFT JOIN users u ON u.id = b.bidder_id
              WHERE a.id = $auctionId";
    $auction = getRow($query);
    
    if (!$auction) {
        return [
            'status' => 'error',
            'message' => 'Auction not found'
        ];
    }
    
    if ($auction['status'] != 'active') {
        return [
            'status' => 'error',
            'message' => 'Auction is not active'
        ];
    }
    
    $status = 'ended';
    if ($auction['bidder_id']) {
        // Check if reserve price is met
        if (!$auction['reserve_price'] || $auction['bid_amount'] >= $auction['reserve_price']) {
            $status = 'sold';
            
            // Notify winner
            notifyUser($auction['bidder_id'], 'Auction Won', 
                "Congratulations! You won the auction: {$auction['title']} with a bid of \${$auction['bid_amount']}");
            
            // Notify seller
            notifyUser($auction['seller_id'], 'Auction Sold', 
                "Your auction {$auction['title']} has sold for \${$auction['bid_amount']}");
        }
    }
    
    // Update auction status
    $query = "UPDATE auctions SET status = '$status' WHERE id = $auctionId";
    $result = modifyRows($query);
    
    if ($result !== false) {
        logActivity(0, 'end_auction', "Ended auction ID: $auctionId with status: $status");
        
        return [
            'status' => 'success',
            'message' => 'Auction ended successfully',
            'auction_status' => $status
        ];
    }
    
    return [
        'status' => 'error',
        'message' => 'Failed to end auction'
    ];
}

/**
 * Notify user about an event
 * 
 * @param int $userId User ID
 * @param string $title Notification title
 * @param string $message Notification message
 * @return bool Success status
 */
function notifyUser($userId, $title, $message) {
    $title = sanitizeInput($title);
    $message = sanitizeInput($message);
    
    $query = "INSERT INTO notifications (user_id, title, message)
              VALUES ($userId, '$title', '$message')";
    
    return executeQuery($query) !== false;
} 