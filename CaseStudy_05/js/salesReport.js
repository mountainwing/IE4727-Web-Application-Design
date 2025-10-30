// Sales Report JavaScript
// Handles fetching and displaying sales reports by products and categories

// Generate sales report by product
async function generateSalesReportByProduct() {
    const reportDate = document.getElementById('reportDate').value;
    await fetchSalesData('products', reportDate);
}

// Generate sales report by category (shot types)
async function generateSalesReportByCategory() {
    const reportDate = document.getElementById('reportDate').value;
    await fetchSalesData('categories', reportDate);
}

// Main function to fetch sales data from server
async function fetchSalesData(reportType = 'orders', filterDate = null) {
    const loadingMsg = document.getElementById('loadingMessage');
    const messageArea = document.getElementById('messageArea');
    
    try {
        // Show loading message
        loadingMsg.style.display = 'block';
        messageArea.textContent = '';
        
        // Prepare request URL
        let url = '../server/viewOrders.php';
        const params = new URLSearchParams();
        
        if (reportType) {
            params.append('type', reportType);
        }
        if (filterDate) {
            params.append('date', filterDate);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('Fetching sales data from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Handle different report types
            switch (reportType) {
                case 'products':
                    displayProductsReport(result.products, filterDate);
                    break;
                case 'categories':
                    displayCategoriesReport(result.categories, filterDate);
                    break;
                default:
                    showMessage('Unknown report type', 'error');
            }
        } else {
            showMessage(`Error loading sales data: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Error fetching sales data:', error);
        showMessage('Error loading sales data. Please try again.', 'error');
    } finally {
        // Hide loading message
        loadingMsg.style.display = 'none';
    }
}



// Display products report
function displayProductsReport(products, filterDate) {
    const tableBody = document.getElementById('salesTableBody');
    const salesTable = document.getElementById('salesTable');
    const tableHeader = document.querySelector('#salesTable thead tr');
    
    // Clear previous data
    tableBody.innerHTML = '';
    
    // Set table headers for products
    tableHeader.innerHTML = `
        <th>Product</th>
        <th>Total Quantity Sold</th>
        <th>Total Dollar Sales</th>
    `;
    
    if (!products || products.length === 0) {
        salesTable.style.display = 'none';
        const dateText = filterDate ? ` for ${filterDate}` : '';
        showMessage(`No product sales found${dateText}.`, 'info');
        return;
    }
    
    // Populate table rows
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'table-row-1' : '';
        
        row.innerHTML = `
            <td class="table-leftcol">${escapeHtml(product.product_name)}</td>
            <td class="table-leftcol">${product.total_quantity}</td>
            <td class="table-leftcol">$${parseFloat(product.total_sales).toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show the table
    salesTable.style.display = 'table';
}

// Display categories report
function displayCategoriesReport(categories, filterDate) {
    const tableBody = document.getElementById('salesTableBody');
    const salesTable = document.getElementById('salesTable');
    const tableHeader = document.querySelector('#salesTable thead tr');
    
    // Clear previous data
    tableBody.innerHTML = '';
    
    // Set table headers for categories
    tableHeader.innerHTML = `
        <th>Category</th>
        <th>Total Quantity Sold</th>
        <th>Total Dollar Sales</th>
    `;
    
    if (!categories || categories.length === 0) {
        salesTable.style.display = 'none';
        const dateText = filterDate ? ` for ${filterDate}` : '';
        showMessage(`No category sales found${dateText}.`, 'info');
        return;
    }
    
    // Populate table rows
    categories.forEach((category, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'table-row-1' : '';
        
        // Handle different possible property names from PHP backend
        const categoryName = category.category_name || category.category || category.shot_type || 'Unknown Category';
        const totalQuantity = category.total_quantity || 0;
        const totalSales = category.total_sales || 0;
        
        row.innerHTML = `
            <td class="table-leftcol">${escapeHtml(categoryName)}</td>
            <td class="table-leftcol">${totalQuantity}</td>
            <td class="table-leftcol">$${parseFloat(totalSales).toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show the table
    salesTable.style.display = 'table';
}

// Show messages to user
function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;
    
    // Style based on message type
    if (type === 'success') {
        messageArea.style.color = 'green';
    } else if (type === 'error') {
        messageArea.style.color = 'red';
    } else {
        messageArea.style.color = '#A48269';
    }
    
    // Clear message after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            messageArea.textContent = '';
        }, 5000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('reportDate');
    if (dateInput) {
        dateInput.value = today;
    }
    
    console.log('Sales Report functionality loaded');
});