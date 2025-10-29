
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

