
-- Create coffee_prices table
CREATE TABLE IF NOT EXISTS coffee_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coffee_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    single_price DECIMAL(10,2),
    double_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO coffee_prices (coffee_name, description, single_price, double_price) VALUES 
        ('Just Java', 'Regular house blend, decaffeinated coffee, or flavour of the day.', 22.00, NULL),
        ('Cafe au Lait', 'House blended coffee infused into a smooth, steamed milk.', 2.00, 3.00),
        ('Iced Cappucino', 'Sweetened espresso blended with icy-cold milk and served in chilled glass.', 4.75, 5.75);

-- Create orders table to store customer orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    just_java_single_quantity INT(8),
    cafe_au_lait_single_quantity INT(8),
    cafe_au_lait_double_quantity INT(8),
    iced_cappucino_single_quantity INT(8),
    iced_cappucino_double_quantity INT(8),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

