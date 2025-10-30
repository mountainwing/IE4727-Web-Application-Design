<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

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
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Fetch coffee prices for menu display
$result = $conn->query("SELECT coffee_name, single_price, double_price FROM coffee_prices ORDER BY id");

if (!$result) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch prices: ' . $conn->error,
        'debug' => 'SQL query failed'
    ]);
    exit;
}

$singlePrices = [];
$doublePrices = [];

while ($row = $result->fetch_assoc()) {
    // Map database coffee names to menu identifiers
    $coffeeKey = '';
    switch (strtolower(trim($row['coffee_name']))) {
        case 'just java':
            $coffeeKey = 'JustJava';
            break;
        case 'cafe au lait':
            $coffeeKey = 'CafeAuLait';
            break;
        case 'iced cappucino':
            $coffeeKey = 'IcedCappucino';
            break;
    }

    if ($coffeeKey) {
        $singlePrices[$coffeeKey] = ($row['single_price'] !== null) ? floatval($row['single_price']) : 0;
        $doublePrices[$coffeeKey] = ($row['double_price'] !== null) ? floatval($row['double_price']) : 0;
    }
}

// Set default prices if database is empty
if (empty($singlePrices)) {
    $singlePrices = [
        'JustJava' => 22.00,
        'CafeAuLait' => 2.00,
        'IcedCappucino' => 4.75
    ];
    $doublePrices = [
        'JustJava' => 22.00, // Just Java doesn't have double, so same price
        'CafeAuLait' => 3.00,
        'IcedCappucino' => 5.75
    ];
}

// Return the structure that JavaScript expects
echo json_encode([
    'success' => true,
    'singlePrices' => $singlePrices,
    'doublePrices' => $doublePrices,
    'debug' => [
        'raw_data_count' => $result->num_rows,
        'database_query_success' => true
    ]
]);

$conn->close();
?>