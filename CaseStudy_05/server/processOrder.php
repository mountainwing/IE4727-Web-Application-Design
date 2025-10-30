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
if (!isset($input['customerName']) || !isset($input['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$customerName = trim($input['customerName']);
$items = $input['items'];

// Validate customer info
if (empty($customerName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Customer name is required']);
    exit;
}

// Validate items
if (empty($items) || !is_array($items)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No items in order']);
    exit;
}

// Fetch current prices from database
$priceQuery = "SELECT coffee_name, single_price, double_price FROM coffee_prices";
$priceResult = $conn->query($priceQuery);

if (!$priceResult) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch current prices']);
    exit;
}

$currentPrices = [];
while ($row = $priceResult->fetch_assoc()) {
    $currentPrices[$row['coffee_name']] = [
        'single' => floatval($row['single_price']),
        'double' => floatval($row['double_price'])
    ];
}

// Start transaction
$conn->begin_transaction();

try {
    // Initialize quantity variables and calculate total
    $justJavaSingleQty = 0;
    $cafeAuLaitSingleQty = 0;
    $cafeAuLaitDoubleQty = 0;
    $icedCappucinoSingleQty = 0;
    $icedCappucinoDoubleQty = 0;
    $calculatedTotal = 0.0;
    
    // Parse items and extract quantities
    foreach ($items as $item) {
        $coffeeName = $item['name'];
        $shotType = isset($item['shotType']) ? $item['shotType'] : null;
        $quantity = intval($item['quantity']);
        
        if ($quantity <= 0) {
            throw new Exception("Invalid quantity for " . $coffeeName);
        }
        
        // Calculate price based on current database prices
        $itemPrice = 0;
        
        // Map items to database columns and calculate cost
        switch ($coffeeName) {
            case 'Just Java':
                $justJavaSingleQty = $quantity;
                if (isset($currentPrices['Just Java'])) {
                    $itemPrice = $currentPrices['Just Java']['single'] * $quantity;
                } else {
                    throw new Exception("Price not found for Just Java");
                }
                break;
            case 'Cafe au Lait':
                if ($shotType === 'single') {
                    $cafeAuLaitSingleQty = $quantity;
                    if (isset($currentPrices['Cafe au Lait'])) {
                        $itemPrice = $currentPrices['Cafe au Lait']['single'] * $quantity;
                    } else {
                        throw new Exception("Price not found for Cafe au Lait single");
                    }
                } elseif ($shotType === 'double') {
                    $cafeAuLaitDoubleQty = $quantity;
                    if (isset($currentPrices['Cafe au Lait'])) {
                        $itemPrice = $currentPrices['Cafe au Lait']['double'] * $quantity;
                    } else {
                        throw new Exception("Price not found for Cafe au Lait double");
                    }
                }
                break;
            case 'Iced Cappucino':
                if ($shotType === 'single') {
                    $icedCappucinoSingleQty = $quantity;
                    if (isset($currentPrices['Iced Cappucino'])) {
                        $itemPrice = $currentPrices['Iced Cappucino']['single'] * $quantity;
                    } else {
                        throw new Exception("Price not found for Iced Cappucino single");
                    }
                } elseif ($shotType === 'double') {
                    $icedCappucinoDoubleQty = $quantity;
                    if (isset($currentPrices['Iced Cappucino'])) {
                        $itemPrice = $currentPrices['Iced Cappucino']['double'] * $quantity;
                    } else {
                        throw new Exception("Price not found for Iced Cappucino double");
                    }
                }
                break;
            default:
                throw new Exception("Unknown coffee type: " . $coffeeName);
        }
        
        $calculatedTotal += $itemPrice;
    }
    
    // Validate calculated total
    if ($calculatedTotal <= 0) {
        throw new Exception("Calculated total must be greater than 0");
    }
    
    // Insert order into orders table using calculated total
    $orderStmt = $conn->prepare("INSERT INTO orders (customer_name, just_java_single_quantity, cafe_au_lait_single_quantity, cafe_au_lait_double_quantity, iced_cappucino_single_quantity, iced_cappucino_double_quantity, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$orderStmt) {
        throw new Exception("Failed to prepare order statement: " . $conn->error);
    }
    
    $orderStmt->bind_param("siiiid", $customerName, $justJavaSingleQty, $cafeAuLaitSingleQty, $cafeAuLaitDoubleQty, $icedCappucinoSingleQty, $icedCappucinoDoubleQty, $calculatedTotal);
    
    if (!$orderStmt->execute()) {
        throw new Exception("Failed to insert order: " . $orderStmt->error);
    }
    
    $orderId = $conn->insert_id;
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully!',
        'orderId' => $orderId,
        'calculatedTotal' => $calculatedTotal,
        'orderDetails' => [
            'customer' => $customerName,
            'total' => $calculatedTotal,
            'justJava' => $justJavaSingleQty,
            'cafeAuLaitSingle' => $cafeAuLaitSingleQty,
            'cafeAuLaitDouble' => $cafeAuLaitDoubleQty,
            'icedCappucinoSingle' => $icedCappucinoSingleQty,
            'icedCappucinoDouble' => $icedCappucinoDoubleQty
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to process order: ' . $e->getMessage()
    ]);
}

// Close statements and connection
if (isset($orderStmt)) $orderStmt->close();
$conn->close();
?>