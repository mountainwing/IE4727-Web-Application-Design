<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "casestudy5";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
if (!isset($input['coffeeType']) || !isset($input['singlePrice'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$coffeeType = trim($input['coffeeType']);
$singlePrice = floatval($input['singlePrice']);
$doublePrice = isset($input['doublePrice']) ? floatval($input['doublePrice']) : null;

// Validate prices
if ($singlePrice <= 0 || ($doublePrice !== null && $doublePrice <= 0)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Prices must be greater than 0']);
    exit;
}

// Map coffee types to database names
$coffeeNameMap = [
    'JustJava' => 'Just Java',
    'CafeAuLait' => 'Cafe au Lait',
    'IcedCappucino' => 'Iced Cappucino'
];

if (!isset($coffeeNameMap[$coffeeType])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid coffee type']);
    exit;
}

$coffeeName = $coffeeNameMap[$coffeeType];

// Prepare update statement
if ($doublePrice !== null) {
    // Update both single and double prices
    $stmt = $conn->prepare("UPDATE coffee_prices SET single_price = ?, double_price = ? WHERE coffee_name = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("dds", $singlePrice, $doublePrice, $coffeeName);
} else {
    // Update only single price (for Just Java)
    $stmt = $conn->prepare("UPDATE coffee_prices SET single_price = ? WHERE coffee_name = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("ds", $singlePrice, $coffeeName);
}

// Execute the update
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Prices updated successfully',
            'updated' => [
                'coffeeType' => $coffeeType,
                'coffeeName' => $coffeeName,
                'singlePrice' => $singlePrice,
                'doublePrice' => $doublePrice
            ]
        ]);
    } else {
        // No rows were affected - coffee might not exist, try to insert
        if ($doublePrice !== null) {
            $insertStmt = $conn->prepare("INSERT INTO coffee_prices (coffee_name, single_price, double_price) VALUES (?, ?, ?)");
            if (!$insertStmt) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to prepare insert statement: ' . $conn->error]);
                exit;
            }
            $insertStmt->bind_param("sdd", $coffeeName, $singlePrice, $doublePrice);
        } else {
            $insertStmt = $conn->prepare("INSERT INTO coffee_prices (coffee_name, single_price, double_price) VALUES (?, ?, 0.00)");
            if (!$insertStmt) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to prepare insert statement: ' . $conn->error]);
                exit;
            }
            $insertStmt->bind_param("sd", $coffeeName, $singlePrice);
        }

        if ($insertStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'New coffee prices added successfully',
                'inserted' => [
                    'coffeeType' => $coffeeType,
                    'coffeeName' => $coffeeName,
                    'singlePrice' => $singlePrice,
                    'doublePrice' => $doublePrice
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to insert new prices: ' . $insertStmt->error]);
        }
        $insertStmt->close();
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update prices: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>