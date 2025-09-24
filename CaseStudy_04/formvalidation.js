
// Form validation for jobs.html
function validateForm(event) {
    'use strict';

    // retrieve input elements
    var name = document.getElementById('myName');
    var email = document.getElementById('myEmail');
    var startDate = document.getElementById('startDate');
    var exp = document.getElementsByName('myExp')[0];
    var errorMsg = '';

    // 1. Name validation: only alphabet characters and spaces
    var namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(name.value.trim())) {
        errorMsg += 'Name must contain only alphabet characters and spaces.\n';
    }

    // 2. Email validation with specific criteria
    var emailPattern = /^[\w.-]+@([\w-]+\.){1,3}[A-Za-z]{2,3}$/;
    if (!emailPattern.test(email.value.trim())) {
        errorMsg += 'Please enter a valid email address.\n';
    }

    // 4. Start date validation: cannot be from today or in the past
    if (startDate.value) {
        var selectedDate = new Date(startDate.value);
        var today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        
        if (selectedDate <= today) {
            errorMsg += 'Start date must be in the future (after today).\n';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('jobForm');
    if (form) {
        form.addEventListener('submit', validateForm);
    }
});