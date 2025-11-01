function handleLogin() {
    const username = prompt("Enter username:");
    if (username === null) return; // User cancelled
    
    const password = prompt("Enter password:");
    if (password === null) return; // User cancelled
    
    // Simple authentication logic
    if (username === "admin" && password === "123") {
        alert("Welcome Admin! You have admin privileges.");
        window.location.href = "admin/priceUpdate.html";
    } else {
        alert("Invalid credentials! Please try again.");
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        alert("You have been logged out successfully.");
        window.location.href = "../index.html";
    }
}