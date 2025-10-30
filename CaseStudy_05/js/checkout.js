// Checkout functionality for menu orders

// Function to collect order data and process checkout
async function processCheckout() {
    try {
        // Check if there are items in the order first
        const orderItems = collectOrderItems();
        
        if (orderItems.length === 0) {
            alert('Please add items to your order before checking out.');
            return;
        }
        
        // Calculate total amount
        const totalAmount = calculateTotalAmount(orderItems);
        
        if (totalAmount <= 0) {
            alert('Order total must be greater than $0.00');
            return;
        }
        
        // Prompt for customer name
        const customerName = prompt('Please enter your name:');
        if (!customerName || customerName.trim() === '') {
            alert('Name is required to place an order.');
            return;
        }
        
        // Prepare order data (total will be calculated server-side)
        const orderData = {
            customerName: customerName.trim(),
            items: orderItems
        };
        
        console.log('Processing order:', orderData);
        
        // Disable checkout button during processing
        const checkoutBtn = document.getElementById('checkout-btn');
        const originalText = checkoutBtn.textContent;
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';
        
        // Send order to server
        const response = await fetch('server/processOrder.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message using server-calculated total
            const serverTotal = result.calculatedTotal || result.orderDetails.total;
            alert(`Order placed successfully!\n\nOrder ID: ${result.orderId}\nCustomer: ${customerName.trim()}\nTotal: $${serverTotal.toFixed(2)}\n\nThank you for your order!`);
            
            // Clear the order form
            clearOrder();
        } else {
            alert(`Error placing order: ${result.error}`);
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred while processing your order. Please try again.');
    } finally {
        // Re-enable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
    }
}

// Function to collect current order items from the form
function collectOrderItems() {
    const items = [];
    
    // Get current prices (from menuPrices.js)
    const prices = window.currentPrices || {
        JustJava: 22.00,
        CafeAuLait: { single: 2.00, double: 3.00 },
        IcedCappucino: { single: 4.75, double: 5.75 }
    };
    console.log('Current prices for order collection:', prices);
    
    try {
        // Just Java
        const javaQty = document.querySelector('input[name="quantity-col-JustJava"]');
        console.log('Just Java quantity element:', javaQty);
        if (javaQty && javaQty.value && parseInt(javaQty.value) > 0) {
            items.push({
                name: 'Just Java',
                shotType: null, // Just Java doesn't have shot options
                quantity: parseInt(javaQty.value),
                unitPrice: prices.JustJava,
                totalPrice: parseInt(javaQty.value) * prices.JustJava
            });
        }
    
        // Cafe au Lait
        const auLaitQty = document.querySelector('input[name="quantity-col-CafeAuLait"]');
        const auLaitShot = document.querySelector('input[name="shot-CafeAuLait"]:checked');
        console.log('Cafe au Lait elements:', { quantity: auLaitQty, shot: auLaitShot });
        if (auLaitQty && auLaitShot && auLaitQty.value && parseInt(auLaitQty.value) > 0) {
            const shotType = auLaitShot.value;
            const unitPrice = prices.CafeAuLait[shotType];
            items.push({
                name: 'Cafe au Lait',
                shotType: shotType,
                quantity: parseInt(auLaitQty.value),
                unitPrice: unitPrice,
                totalPrice: parseInt(auLaitQty.value) * unitPrice
            });
        }
    
        // Iced Cappuccino
        const cappuccinoQty = document.querySelector('input[name="quantity-col-IcedCappucino"]');
        const cappuccinoShot = document.querySelector('input[name="shot-IcedCappucino"]:checked');
        console.log('Iced Cappuccino elements:', { quantity: cappuccinoQty, shot: cappuccinoShot });
        if (cappuccinoQty && cappuccinoShot && cappuccinoQty.value && parseInt(cappuccinoQty.value) > 0) {
            const shotType = cappuccinoShot.value;
            const unitPrice = prices.IcedCappucino[shotType];
            items.push({
                name: 'Iced Cappucino',
                shotType: shotType,
                quantity: parseInt(cappuccinoQty.value),
                unitPrice: unitPrice,
                totalPrice: parseInt(cappuccinoQty.value) * unitPrice
            });
        }
        
    } catch (error) {
        console.error('Error collecting order items:', error);
        // Return empty array on error
        return [];
    }
    
    return items;
}

// Function to calculate total amount from order items
function calculateTotalAmount(items) {
    return items.reduce((total, item) => total + item.totalPrice, 0);
}

// Function to clear the order
function clearOrder() {
    // Reset quantity inputs
    const qtyInputs = document.querySelectorAll('input[type="number"][name^="quantity-col-"]');
    qtyInputs.forEach(input => {
        input.value = 0;
    });
    
    // Reset radio buttons to default (single)
    const singleRadios = document.querySelectorAll('input[type="radio"][value="single"]');
    singleRadios.forEach(radio => {
        radio.checked = true;
    });
    
    // Update price display
    if (typeof updateCoffeePrice === 'function') {
        updateCoffeePrice();
    }
    
    console.log('Order cleared');
    alert('Order cleared successfully!');
}

// Initialize checkout functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout functionality loaded');
});