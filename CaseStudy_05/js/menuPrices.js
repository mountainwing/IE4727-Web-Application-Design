// Global variable to store current prices from database
let currentPrices = {
    JustJava: 22.00,
    CafeAuLait: { single: 2.00, double: 3.00 },
    IcedCappucino: { single: 4.75, double: 5.75 }
};

// Fetch prices from database
async function loadMenuPrices() {
    const statusElement = document.getElementById('price-status');
    
    if (statusElement) statusElement.textContent = 'Loading prices...';
    
    // Determine the correct path based on current page location
    const isInAdminFolder = window.location.pathname.includes('/admin/');
    const serverPath = isInAdminFolder ? '../server/menuPrices.php' : 'server/menuPrices.php';
    
    console.log('Fetching from:', serverPath, '(isInAdminFolder:', isInAdminFolder, ')');
    
    const response = await fetch(serverPath);
    const result = await response.json();
    
    console.log('Server response:', result); // Debug log
    
    if (result.success) {
        // Convert the server response format to the expected format
        currentPrices = {
            JustJava: result.singlePrices?.JustJava || 22.00,
            CafeAuLait: {
                single: result.singlePrices?.CafeAuLait || 2.00,
                double: result.doublePrices?.CafeAuLait || 3.00
            },
            IcedCappucino: {
                single: result.singlePrices?.IcedCappucino || 4.75,
                double: result.doublePrices?.IcedCappucino || 5.75
            }
        };
        updateMenuDisplay();
        if (statusElement) {
            statusElement.textContent = `Prices updated (${new Date().toLocaleTimeString()})`;
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    } 
}

// Update menu display with current prices
function updateMenuDisplay() {
    // Safety check
    if (!currentPrices || typeof currentPrices.JustJava === 'undefined') {
        console.error('Current prices not properly loaded:', currentPrices);
        return;
    }
    
    // Store prices globally for menuUpdate.js
    window.currentPrices = currentPrices;
    
    // Update Just Java price
    const justJavaDesc = document.querySelector('tr[id="table-row-1"] td[headers="description"]');
    if (justJavaDesc) {
        justJavaDesc.innerHTML = `Regular house blend, decaffeinated coffee, or flavour of the day.<br><strong>Endless Cup $${currentPrices.JustJava.toFixed(2)}</strong>`;
    }

    // Update Cafe au Lait prices
    const cafeAuLaitContainer = document.querySelector('input[name="shot-CafeAuLait"]').closest('td');
    if (cafeAuLaitContainer) {
        cafeAuLaitContainer.innerHTML = `House blended coffee infused into a smooth, steamed milk.<br>
            <label><input type="radio" name="shot-CafeAuLait" value="single" checked><strong> Single $${currentPrices.CafeAuLait.single.toFixed(2)}</strong></label>
            <label><input type="radio" name="shot-CafeAuLait" value="double"><strong> Double $${currentPrices.CafeAuLait.double.toFixed(2)}</strong></label>`;
    }

    // Update Iced Cappucino prices  
    const icedCappucinoContainer = document.querySelector('input[name="shot-IcedCappucino"]').closest('td');
    if (icedCappucinoContainer) {
        icedCappucinoContainer.innerHTML = `Sweetened espresso blended with icy-cold milk and served in chilled glass.<br>
            <label><input type="radio" name="shot-IcedCappucino" value="single" checked><strong> Single $${currentPrices.IcedCappucino.single.toFixed(2)}</strong></label>
            <label><input type="radio" name="shot-IcedCappucino" value="double"><strong> Double $${currentPrices.IcedCappucino.double.toFixed(2)}</strong></label>`;
    }

    // Re-attach event listeners after updating HTML
    setTimeout(() => {
        const shotRadios = document.querySelectorAll('input[type="radio"][name^="shot-"]');
        shotRadios.forEach(function(radio) {
            radio.addEventListener('change', updateCoffeePrice);
        });
        
        // Notify menuUpdate.js about the new prices
        if (typeof updatePricesFromDatabase === 'function') {
            updatePricesFromDatabase(currentPrices);
        }
    }, 100);
}

// Get current price for calculations (to be used by menuUpdate.js)
function getCurrentPrice(item, variant = null) {
    switch (item) {
        case 'JustJava':
            return currentPrices.JustJava;
        case 'CafeAuLait':
            return variant ? currentPrices.CafeAuLait[variant] : currentPrices.CafeAuLait.single;
        case 'IcedCappucino':
            return variant ? currentPrices.IcedCappucino[variant] : currentPrices.IcedCappucino.single;
        default:
            return 0;
    }
}

function updateCoffeePrice() {
	// Use dynamic prices from database (fallback to default if not loaded)
	var prices = window.currentPrices || {
		JustJava: 22.00,
		CafeAuLait: { single: 2.00, double: 3.00 },
		IcedCappucino: { single: 4.75, double: 5.75 }
	};

	// Get quantity inputs
	var qtyJava = document.querySelector('input[name="quantity-col-JustJava"]');
	var qtyAuLait = document.querySelector('input[name="quantity-col-CafeAuLait"]');
	var qtyCappuccino = document.querySelector('input[name="quantity-col-IcedCappucino"]');

	// Get radio buttons for shot selection
	var shotAuLait = document.querySelector('input[name="shot-CafeAuLait"]:checked');
	var shotCappuccino = document.querySelector('input[name="shot-IcedCappucino"]:checked');

	// Get total price cells
	var priceJava = document.getElementById('price-JustJava');
	var priceAuLait = document.getElementById('price-CafeAuLait');
	var priceCappuccino = document.getElementById('price-IcedCappucino');

	// Init total price
	let javaTotal = 0, auLaitTotal = 0, cappuccinoTotal = 0;
	
    // Calculate and update prices
	if (qtyJava && priceJava) {
		javaTotal = qtyJava.value * prices.JustJava;
		priceJava.textContent = "$" + parseFloat(javaTotal).toFixed(2);
	}
	if (qtyAuLait && priceAuLait && shotAuLait) {
		const shotType = shotAuLait.value;
		auLaitTotal = qtyAuLait.value * prices.CafeAuLait[shotType];
		priceAuLait.textContent = "$" + parseFloat(auLaitTotal).toFixed(2);
	}
	if (qtyCappuccino && priceCappuccino && shotCappuccino) {
		const shotType = shotCappuccino.value;
		cappuccinoTotal = qtyCappuccino.value * prices.IcedCappucino[shotType];
		priceCappuccino.textContent = "$" + parseFloat(cappuccinoTotal).toFixed(2);
	}
	
	// Update grand total
	var totalPriceField = document.getElementById('grandTotal');
	var grandTotal = javaTotal + auLaitTotal + cappuccinoTotal;
	if (totalPriceField) {
		totalPriceField.textContent = "$" + grandTotal.toFixed(2);
	}
}

// Add event listeners to quantity inputs
document.addEventListener('DOMContentLoaded', function() {
	var qtyInputs = document.querySelectorAll('input[type="number"][name^="quantity-col-"]');
	qtyInputs.forEach(function(input) {
		input.addEventListener('input', updateCoffeePrice);
	});
	// Add listeners for radio buttons
	var shotRadios = document.querySelectorAll('input[type="radio"][name^="shot-"]');
	shotRadios.forEach(function(radio) {
		radio.addEventListener('change', updateCoffeePrice);
	});

	updateCoffeePrice(); // Initial update
});

// Function to update prices when database prices are loaded
function updatePricesFromDatabase(newPrices) {
	if (typeof window !== 'undefined') {
		window.currentPrices = newPrices;
		updateCoffeePrice(); // Recalculate with new prices
	}
}

// Function to get current price (can be called from other scripts)
function getCurrentPrice(item, variant = null) {
	const prices = window.currentPrices || {
		JustJava: 22.00,
		CafeAuLait: { single: 2.00, double: 3.00 },
		IcedCappucino: { single: 4.75, double: 5.75 }
	};
	
	switch (item) {
		case 'JustJava':
			return prices.JustJava;
		case 'CafeAuLait':
			return variant ? prices.CafeAuLait[variant] : prices.CafeAuLait.single;
		case 'IcedCappucino':
			return variant ? prices.IcedCappucino[variant] : prices.IcedCappucino.single;
		default:
			return 0;
	}
}

// Load prices when page loads
window.addEventListener('load', function() {
    loadMenuPrices();
});

