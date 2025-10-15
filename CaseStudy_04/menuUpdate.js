function updateCoffeePrice() {
	// Prices for each coffee item
	const prices = {
		JustJava: 22.00,
		CafeAuLait: { single: 2.00, double: 3.00 },
		IcedCappucino: { single: 4.75, double: 5.75 }
	};

	// Get quantity inputs
	const qtyJava = document.querySelector('input[name="quantity-col-JustJava"]');
	const qtyAuLait = document.querySelector('input[name="quantity-col-CafeAuLait"]');
	const qtyCappuccino = document.querySelector('input[name="quantity-col-IcedCappucino"]');

	// Get radio buttons for shot selection
	const shotAuLait = document.querySelector('input[name="shot-CafeAuLait"]:checked');
	const shotCappuccino = document.querySelector('input[name="shot-IcedCappucino"]:checked');

	// Get total price cells
	const priceJava = document.getElementById('price-JustJava');
	const priceAuLait = document.getElementById('price-CafeAuLait');
	const priceCappuccino = document.getElementById('price-IcedCappucino');

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
	const totalPriceField = document.getElementById('grandTotal');
	const grandTotal = javaTotal + auLaitTotal + cappuccinoTotal;
	if (totalPriceField) {
		totalPriceField.textContent = "$" + grandTotal.toFixed(2);
	}
}

// Add event listeners to quantity inputs
document.addEventListener('DOMContentLoaded', function() {
	const qtyInputs = document.querySelectorAll('input[type="number"][name^="quantity-col-"]');
	qtyInputs.forEach(function(input) {
		input.addEventListener('input', updateCoffeePrice);
	});
	// Add listeners for radio buttons
	const shotRadios = document.querySelectorAll('input[type="radio"][name^="shot-"]');
	shotRadios.forEach(function(radio) {
		radio.addEventListener('change', updateCoffeePrice);
	});

	updateCoffeePrice(); // Initial update
});