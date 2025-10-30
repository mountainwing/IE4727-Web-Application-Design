<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

try {
    // Check request parameters
    $reportType = isset($_GET['type']) ? $_GET['type'] : 'orders';
    $filterDate = isset($_GET['date']) ? $_GET['date'] : null;

    switch ($reportType) {
        case 'orders':
            handleOrdersReport($conn, $filterDate);
            break;

        case 'products':
            handleProductsReport($conn, $filterDate);
            break;

        case 'categories':
            handleCategoriesReport($conn, $filterDate);
            break;

        default:
            throw new Exception("Invalid report type: " . $reportType);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to generate report: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}

// Handle orders report
function handleOrdersReport($conn, $filterDate)
{
    $dateCondition = $filterDate ? "WHERE DATE(order_date) = ?" : "";

    $query = "
        SELECT 
            id, order_date, customer_name,
            just_java_single_quantity,
            cafe_au_lait_single_quantity,
            cafe_au_lait_double_quantity,
            iced_cappucino_single_quantity,
            iced_cappucino_double_quantity,
            total_amount, created_at
        FROM orders
        $dateCondition
        ORDER BY order_date DESC, id DESC
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    if ($filterDate) {
        $stmt->bind_param("s", $filterDate);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => intval($row['id']),
            'order_date' => $row['order_date'],
            'customer_name' => $row['customer_name'],
            'just_java_single_quantity' => intval($row['just_java_single_quantity']),
            'cafe_au_lait_single_quantity' => intval($row['cafe_au_lait_single_quantity']),
            'cafe_au_lait_double_quantity' => intval($row['cafe_au_lait_double_quantity']),
            'iced_cappucino_single_quantity' => intval($row['iced_cappucino_single_quantity']),
            'iced_cappucino_double_quantity' => intval($row['iced_cappucino_double_quantity']),
            'total_amount' => floatval($row['total_amount']),
            'created_at' => $row['created_at']
        ];
    }

    $totalOrders = count($orders);
    $totalRevenue = array_sum(array_column($orders, 'total_amount'));
    $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'summary' => [
            'totalOrders' => $totalOrders,
            'totalRevenue' => round($totalRevenue, 2),
            'averageOrderValue' => round($averageOrderValue, 2),
            'reportType' => 'Orders Report',
            'dateRange' => $filterDate ? "Date: $filterDate" : 'All Time'
        ]
    ]);

    $stmt->close();
}

// Handle products report
function handleProductsReport($conn, $filterDate)
{
    $dateCondition = $filterDate ? "WHERE DATE(order_date) = ?" : "";

    $query = "
        SELECT 
            SUM(just_java_single_quantity) as just_java_qty,
            SUM(cafe_au_lait_single_quantity) as cafe_single_qty,
            SUM(cafe_au_lait_double_quantity) as cafe_double_qty,
            SUM(iced_cappucino_single_quantity) as iced_single_qty,
            SUM(iced_cappucino_double_quantity) as iced_double_qty,
            SUM(total_amount) as total_revenue,
            COUNT(*) as total_orders
        FROM orders
        $dateCondition
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    if ($filterDate) {
        $stmt->bind_param("s", $filterDate);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    // Get coffee prices to calculate individual product sales
    $priceQuery = "SELECT coffee_name, single_price, double_price FROM coffee_prices";
    $priceResult = $conn->query($priceQuery);

    $prices = [];
    while ($priceRow = $priceResult->fetch_assoc()) {
        switch ($priceRow['coffee_name']) {
            case 'Just Java':
                $prices['just_java'] = $priceRow['single_price'];
                break;
            case 'Cafe au Lait':
                $prices['cafe_au_lait_single'] = $priceRow['single_price'];
                $prices['cafe_au_lait_double'] = $priceRow['double_price'];
                break;
            case 'Iced Cappucino':
                $prices['iced_cappuccino_single'] = $priceRow['single_price'];
                $prices['iced_cappuccino_double'] = $priceRow['double_price'];
                break;
        }
    }

    $products = [];

    if ($row['just_java_qty'] > 0) {
        $products[] = [
            'product_name' => 'Just Java',
            'total_quantity' => intval($row['just_java_qty']),
            'total_sales' => round($row['just_java_qty'] * $prices['just_java'], 2)
        ];
    }

    if ($row['cafe_single_qty'] > 0) {
        $products[] = [
            'product_name' => 'Cafe au Lait (Single Shot)',
            'total_quantity' => intval($row['cafe_single_qty']),
            'total_sales' => round($row['cafe_single_qty'] * $prices['cafe_au_lait_single'], 2)
        ];
    }

    if ($row['cafe_double_qty'] > 0) {
        $products[] = [
            'product_name' => 'Cafe au Lait (Double Shot)',
            'total_quantity' => intval($row['cafe_double_qty']),
            'total_sales' => round($row['cafe_double_qty'] * $prices['cafe_au_lait_double'], 2)
        ];
    }

    if ($row['iced_single_qty'] > 0) {
        $products[] = [
            'product_name' => 'Iced Cappuccino (Single Shot)',
            'total_quantity' => intval($row['iced_single_qty']),
            'total_sales' => round($row['iced_single_qty'] * $prices['iced_cappuccino_single'], 2)
        ];
    }

    if ($row['iced_double_qty'] > 0) {
        $products[] = [
            'product_name' => 'Iced Cappuccino (Double Shot)',
            'total_quantity' => intval($row['iced_double_qty']),
            'total_sales' => round($row['iced_double_qty'] * $prices['iced_cappuccino_double'], 2)
        ];
    }

    echo json_encode([
        'success' => true,
        'products' => $products,
        'summary' => [
            'totalOrders' => intval($row['total_orders']),
            'totalRevenue' => round($row['total_revenue'], 2),
            'averageOrderValue' => $row['total_orders'] > 0 ? round($row['total_revenue'] / $row['total_orders'], 2) : 0,
            'reportType' => 'Sales by Product',
            'dateRange' => $filterDate ? "Date: $filterDate" : 'All Time'
        ]
    ]);

    $stmt->close();
}

// Handle categories report
function handleCategoriesReport($conn, $filterDate)
{
    $dateCondition = $filterDate ? "WHERE DATE(order_date) = ?" : "";

    $query = "
        SELECT 
            SUM(just_java_single_quantity) as regular_qty,
            SUM(cafe_au_lait_single_quantity + iced_cappucino_single_quantity) as single_shot_qty,
            SUM(cafe_au_lait_double_quantity + iced_cappucino_double_quantity) as double_shot_qty,
            SUM(total_amount) as total_revenue,
            COUNT(*) as total_orders
        FROM orders
        $dateCondition
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    if ($filterDate) {
        $stmt->bind_param("s", $filterDate);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    // Get coffee prices to calculate product sales
    $priceQuery = "SELECT coffee_name, single_price, double_price FROM coffee_prices";
    $priceResult = $conn->query($priceQuery);

    $prices = [];
    while ($priceRow = $priceResult->fetch_assoc()) {
        switch ($priceRow['coffee_name']) {
            case 'Just Java':
                $prices['just_java'] = $priceRow['single_price'];
                break;
            case 'Cafe au Lait':
                $prices['cafe_au_lait_single'] = $priceRow['single_price'];
                $prices['cafe_au_lait_double'] = $priceRow['double_price'];
                break;
            case 'Iced Cappucino':
                $prices['iced_cappuccino_single'] = $priceRow['single_price'];
                $prices['iced_cappuccino_double'] = $priceRow['double_price'];
                break;
        }
    }

    $categories = [];

    if ($row['regular_qty'] > 0) {
        $categories[] = [
            'category' => 'Regular',
            'total_quantity' => intval($row['regular_qty']),
            'total_sales' => round($row['regular_qty'] * $prices['just_java'], 2)
        ];
    }

    if ($row['single_shot_qty'] > 0) {
        // Calculate single shot sales (approximation based on average single shot price)
        $avgSinglePrice = ($prices['cafe_au_lait_single'] + $prices['iced_cappuccino_single']) / 2;
        $categories[] = [
            'category' => 'Single Shot',
            'total_quantity' => intval($row['single_shot_qty']),
            'total_sales' => round($row['single_shot_qty'] * $avgSinglePrice, 2)
        ];
    }

    if ($row['double_shot_qty'] > 0) {
        // Calculate double shot sales (approximation based on average double shot price)
        $avgDoublePrice = ($prices['cafe_au_lait_double'] + $prices['iced_cappuccino_double']) / 2;
        $categories[] = [
            'category' => 'Double Shot',
            'total_quantity' => intval($row['double_shot_qty']),
            'total_sales' => round($row['double_shot_qty'] * $avgDoublePrice, 2)
        ];
    }

    echo json_encode([
        'success' => true,
        'categories' => $categories,
        'summary' => [
            'totalOrders' => intval($row['total_orders']),
            'totalRevenue' => round($row['total_revenue'], 2),
            'averageOrderValue' => $row['total_orders'] > 0 ? round($row['total_revenue'] / $row['total_orders'], 2) : 0,
            'reportType' => 'Sales by Categories',
            'dateRange' => $filterDate ? "Date: $filterDate" : 'All Time'
        ]
    ]);

    $stmt->close();

}

?>