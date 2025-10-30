<?php
// Simple script to view orders from the database
header('Content-Type: application/json');

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "casestudy5";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

try {
    // Get recent orders
    $ordersQuery = "
        SELECT 
            id as order_id,
            order_date,
            customer_name,
            just_java_single_quantity,
            cafe_au_lait_single_quantity,
            cafe_au_lait_double_quantity,
            iced_cappucino_single_quantity,
            iced_cappucino_double_quantity,
            total_amount
        FROM orders
        ORDER BY order_date DESC, id DESC
        LIMIT 50
    ";
    
    $result = $conn->query($ordersQuery);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $orders = [];
    
    while ($row = $result->fetch_assoc()) {
        $order = [
            'order_id' => intval($row['order_id']),
            'order_date' => $row['order_date'],
            'customer_name' => $row['customer_name'],
            'total_amount' => floatval($row['total_amount']),
            'items' => []
        ];
        
        // Add items if they have quantities > 0
        if ($row['just_java_single_quantity'] > 0) {
            $order['items'][] = [
                'coffee_name' => 'Just Java',
                'shot_type' => 'single',
                'quantity' => intval($row['just_java_single_quantity'])
            ];
        }
        
        if ($row['cafe_au_lait_single_quantity'] > 0) {
            $order['items'][] = [
                'coffee_name' => 'Cafe au Lait',
                'shot_type' => 'single',
                'quantity' => intval($row['cafe_au_lait_single_quantity'])
            ];
        }
        
        if ($row['cafe_au_lait_double_quantity'] > 0) {
            $order['items'][] = [
                'coffee_name' => 'Cafe au Lait',
                'shot_type' => 'double',
                'quantity' => intval($row['cafe_au_lait_double_quantity'])
            ];
        }
        
        if ($row['iced_cappucino_single_quantity'] > 0) {
            $order['items'][] = [
                'coffee_name' => 'Iced Cappucino',
                'shot_type' => 'single',
                'quantity' => intval($row['iced_cappucino_single_quantity'])
            ];
        }
        
        if ($row['iced_cappucino_double_quantity'] > 0) {
            $order['items'][] = [
                'coffee_name' => 'Iced Cappucino',
                'shot_type' => 'double',
                'quantity' => intval($row['iced_cappucino_double_quantity'])
            ];
        }
        
        $orders[] = $order;
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'total_orders' => count($orders)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>