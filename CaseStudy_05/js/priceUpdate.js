// Admin Price Update JavaScript
// Handles checkbox selection (only one at a time) and price updates

// Handle checkbox selection - only allow one checkbox to be selected at a time
function handleCheckboxSelection(selectedCheckbox) {
    // Get all checkboxes with name="coffeeSelect"
    const checkboxes = document.querySelectorAll('input[name="coffeeSelect"]');
    
    // Uncheck all other checkboxes
    checkboxes.forEach(checkbox => {
        if (checkbox !== selectedCheckbox) {
            checkbox.checked = false;
        }
    });
    
    // If checkbox is selected, show alert to prompt for price update
    if (selectedCheckbox.checked) {
        const coffeeType = selectedCheckbox.value;
        promptPriceUpdate(coffeeType);
    }
}

// Prompt user to update prices using alert boxes
async function promptPriceUpdate(coffeeType) {

    // Load current prices first
    const response = await fetch('../server/menuPrices.php');
    const data = await response.json();
    
    if (data.error) {
        alert('Error loading current prices: ' + data.error);
        return;
    }
    
    let updateData = {
        coffeeType: coffeeType
    };
    
    // Handle different coffee types
    if (coffeeType === 'JustJava') {
        const currentPrice = data.singlePrices?.JustJava || 0;
        const newPrice = prompt(`Update price for Just Java\nCurrent price: $${currentPrice.toFixed(2)}\n\nEnter new price:`);
        
        if (newPrice === null) {
            // User cancelled
            document.getElementById('checkbox-JustJava').checked = false;
            return;
        }
        
        const priceValue = parseFloat(newPrice);
        if (isNaN(priceValue) || priceValue <= 0) {
            alert('Please enter a valid price greater than 0');
            document.getElementById('checkbox-JustJava').checked = false;
            return;
        }
        
        updateData.singlePrice = priceValue;
        
    } else {
        // For Cafe au Lait and Iced Cappucino
        const currentSingle = data.singlePrices?.[coffeeType] || 0;
        const currentDouble = data.doublePrices?.[coffeeType] || 0;
        const coffeeName = coffeeType.replace(/([A-Z])/g, ' $1').trim();
        
        const newSingle = prompt(`Update prices for ${coffeeName}\nCurrent Single: $${currentSingle.toFixed(2)}\nCurrent Double: $${currentDouble.toFixed(2)}\n\nEnter new Single price:`);
        
        if (newSingle === null) {
            // User cancelled
            document.getElementById(`checkbox-${coffeeType}`).checked = false;
            return;
        }
        
        const singleValue = parseFloat(newSingle);
        if (isNaN(singleValue) || singleValue <= 0) {
            alert('Please enter a valid price greater than 0');
            document.getElementById(`checkbox-${coffeeType}`).checked = false;
            return;
        }
        
        const newDouble = prompt(`Enter new Double price for ${coffeeName}:`);
        
        if (newDouble === null) {
            // User cancelled
            document.getElementById(`checkbox-${coffeeType}`).checked = false;
            return;
        }
        
        const doubleValue = parseFloat(newDouble);
        if (isNaN(doubleValue) || doubleValue <= 0) {
            alert('Please enter a valid price greater than 0');
            document.getElementById(`checkbox-${coffeeType}`).checked = false;
            return;
        }
        
        updateData.singlePrice = singleValue;
        updateData.doublePrice = doubleValue;
    }
    
    // Send update request to server
    await updatePrices(updateData);
}

// Handle price update requests to server
async function updatePrices(updateData) {
    const response = await fetch('../server/updatePrices.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Update the displayed prices immediately
        updateDisplayedPrices(updateData.coffeeType, updateData);
        
        // Show success message
        alert('Prices updated successfully!');
        
        // Reset checkbox
        document.getElementById(`checkbox-${updateData.coffeeType}`).checked = false;
        
        // Optional: Also refresh the entire page's price data to ensure consistency
        setTimeout(() => {
            loadInitialPrices();
        }, 500);
    } else {
        alert(`Error updating prices: ${result.error}`);
        document.getElementById(`checkbox-${updateData.coffeeType}`).checked = false;
    }
}

// Update the displayed prices in the UI
function updateDisplayedPrices(coffeeType, newPrices) {
    console.log('Updating displayed prices for:', coffeeType, newPrices); // Debug log
    
    if (coffeeType === 'JustJava') {
        const singleElement = document.getElementById('current-price-JustJava');
        if (singleElement) {
            singleElement.textContent = newPrices.singlePrice.toFixed(2);
            console.log('Updated Just Java price to:', newPrices.singlePrice.toFixed(2));
        } else {
            console.error('Element not found: current-price-JustJava');
        }
    } else if (coffeeType === 'CafeAuLait') {
        const singleElement = document.getElementById('current-single-CafeAuLait');
        const doubleElement = document.getElementById('current-double-CafeAuLait');
        
        if (singleElement && doubleElement) {
            singleElement.textContent = newPrices.singlePrice.toFixed(2);
            doubleElement.textContent = newPrices.doublePrice.toFixed(2);
            console.log('Updated CafeAuLait prices to:', newPrices.singlePrice.toFixed(2), newPrices.doublePrice.toFixed(2));
        } else {
            console.error('Elements not found for CafeAuLait:', {
                single: !!singleElement,
                double: !!doubleElement
            });
        }
    } else if (coffeeType === 'IcedCappucino') {
        const singleElement = document.getElementById('current-single-IcedCappucino');
        const doubleElement = document.getElementById('current-double-IcedCappucino');
        
        if (singleElement && doubleElement) {
            singleElement.textContent = newPrices.singlePrice.toFixed(2);
            doubleElement.textContent = newPrices.doublePrice.toFixed(2);
            console.log('Updated IcedCappucino prices to:', newPrices.singlePrice.toFixed(2), newPrices.doublePrice.toFixed(2));
        } else {
            console.error('Elements not found for IcedCappucino:', {
                single: !!singleElement,
                double: !!doubleElement
            });
        }
    }
}



// Load initial prices on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('../server/menuPrices.php');
        const data = await response.json();
        
        if (!data.error) {
            // Update displayed current prices
            if (data.singlePrices?.JustJava) {
                document.getElementById('current-price-JustJava').textContent = data.singlePrices.JustJava.toFixed(2);
            }
            if (data.singlePrices?.CafeAuLait && data.doublePrices?.CafeAuLait) {
                document.getElementById('current-single-CafeAuLait').textContent = data.singlePrices.CafeAuLait.toFixed(2);
                document.getElementById('current-double-CafeAuLait').textContent = data.doublePrices.CafeAuLait.toFixed(2);
            }
            if (data.singlePrices?.IcedCappucino && data.doublePrices?.IcedCappucino) {
                document.getElementById('current-single-IcedCappucino').textContent = data.singlePrices.IcedCappucino.toFixed(2);
                document.getElementById('current-double-IcedCappucino').textContent = data.doublePrices.IcedCappucino.toFixed(2);
            }
        }
    } catch (error) {
        console.error('Error loading initial prices:', error);
    }
});