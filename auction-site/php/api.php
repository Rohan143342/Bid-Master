<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'config.php';
require_once 'auth.php';
require_once 'auctions.php';
require_once 'wallet.php';

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$endpoint = $request[0] ?? '';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Initialize response array
$response = [
    'status' => 'error',
    'message' => 'Invalid request',
    'data' => null
];

try {
    switch ($endpoint) {
        case 'auth':
            switch ($method) {
                case 'POST':
                    if (isset($input['action'])) {
                        switch ($input['action']) {
                            case 'login':
                                $response = login($input['email'], $input['password']);
                                break;
                            case 'register':
                                $response = register($input);
                                break;
                            case 'logout':
                                $response = logout();
                                break;
                        }
                    }
                    break;
            }
            break;

        case 'auctions':
            switch ($method) {
                case 'GET':
                    if (isset($request[1])) {
                        // Get single auction
                        $response = getAuction($request[1]);
                    } else {
                        // Get all auctions with filters
                        $filters = $_GET;
                        $response = getAllAuctions($filters);
                    }
                    break;
                case 'POST':
                    if (isAuthenticated()) {
                        $response = createAuction($input);
                    } else {
                        $response['message'] = 'Authentication required';
                    }
                    break;
                case 'PUT':
                    if (isset($request[1]) && isAuthenticated()) {
                        $response = updateAuction($request[1], $input);
                    }
                    break;
                case 'DELETE':
                    if (isset($request[1]) && isAuthenticated()) {
                        $response = deleteAuction($request[1]);
                    }
                    break;
            }
            break;

        case 'bids':
            switch ($method) {
                case 'GET':
                    if (isset($request[1])) {
                        // Get bids for specific auction
                        $response = getAuctionBids($request[1]);
                    }
                    break;
                case 'POST':
                    if (isAuthenticated()) {
                        $response = placeBid($input);
                    } else {
                        $response['message'] = 'Authentication required';
                    }
                    break;
            }
            break;

        case 'wallet':
            if (!isAuthenticated()) {
                $response['message'] = 'Authentication required';
                break;
            }
            
            switch ($method) {
                case 'GET':
                    $response = getWalletBalance();
                    break;
                case 'POST':
                    if (isset($input['action'])) {
                        switch ($input['action']) {
                            case 'add_funds':
                                $response = addFunds($input['amount']);
                                break;
                            case 'withdraw':
                                $response = withdrawFunds($input['amount']);
                                break;
                        }
                    }
                    break;
            }
            break;

        case 'categories':
            if ($method === 'GET') {
                $response = getAllCategories();
            }
            break;

        default:
            $response['message'] = 'Endpoint not found';
    }
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage(),
        'data' => null
    ];
}

// Send response
 