// Password strength analyzer
function analyzePassword(password, userInfo = {}) {
    let score = 0;
    let feedback = [];
    let recommendations = [];
    
    // Basic length checks
    if (password.length === 0) {
        return { 
            score: 0, 
            feedback: ["Password is empty"], 
            recommendations: ["Enter a password"] 
        };
    }
    if (password.length > 6) {
        score++;
    } else {
        feedback.push("Password is too short");
        recommendations.push("Use at least 7 characters");
    }
    if (password.length >= 10) {
        score++;
    } else {
        recommendations.push("Use at least 10 characters for better security");
    }
    if (password.length >= 14) {
        score++;
    }

    // Character type checks
    const hasUpperCase = /[A-Z]/.test(password);
    if (hasUpperCase) {
        score++;
    } else {
        feedback.push("No uppercase letters");
        recommendations.push("Add uppercase letters (A-Z)");
    }

    const hasLowerCase = /[a-z]/.test(password);
    if (hasLowerCase) {
        score++;
    } else {
        feedback.push("No lowercase letters");
        recommendations.push("Add lowercase letters (a-z)");
    }

    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) {
        score++;
    } else {
        feedback.push("No numbers");
        recommendations.push("Add numbers (0-9)");
    }

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasSpecialChar) {
        score++;
    } else {
        feedback.push("No special characters");
        recommendations.push("Add special characters (!@#$%^&*(),.?\":{}|<>)");
    }

    // Check for repeated characters
    const repeatedChars = /(.)\1{2,}/.test(password); // Three or more repeated characters
    if (repeatedChars) {
        score--;
        feedback.push("Contains repeated characters");
        recommendations.push("Avoid sequences of repeated characters (e.g., 'aaa', '111')");
    }

    // Check for sequential characters
    const sequentialChars = (
        /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password) ||
        /012|123|234|345|456|567|678|789/i.test(password)
    );
    if (sequentialChars) {
        score--;
        feedback.push("Contains sequential characters");
        recommendations.push("Avoid sequences like 'abc', '123'");
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome', 'login'];
    if (commonPasswords.includes(password.toLowerCase())) {
        score = 0; // Force weak for common passwords
        feedback.push("This is a commonly used password");
        recommendations.push("Choose a unique password that's not commonly used");
    }

    // Profile validation - check if password contains user info
    if (userInfo) {
        const userInfoRegex = new RegExp(Object.values(userInfo)
            .filter(value => value && value.length > 3) // Only check values longer than 3 chars
            .map(value => value.toLowerCase())
            .join('|'), 'i');
        
        if (userInfoRegex.test(password.toLowerCase()) && Object.keys(userInfo).length > 0) {
            score = Math.max(0, score - 2); // Significant penalty
            feedback.push("Password contains personal information");
            recommendations.push("Don't include your name, username, birth date or other personal information");
        }
    }

    return {
        score,
        feedback,
        recommendations
    };
}

// Generate a password suggestion
function generatePasswordSuggestion() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Add additional random characters
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = 0; i < 8; i++) { // Generate 12-character password (4 + 8)
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById("password");
    const strengthBar = document.getElementById("strength-bar");
    const messageElement = document.getElementById("message");
    const showButton = document.querySelector(".show");
    const suggestButton = document.getElementById("suggest-password");
    const feedbackList = document.getElementById("password-feedback");
    const recommendationsList = document.getElementById("password-recommendations");
    const userInfoForm = document.getElementById("user-info-form");
    
    // Handle password input changes
    function updatePasswordStrength() {
        const password = passwordInput.value;
        
        // Gather user info for validation
        const userInfo = {
            name: document.getElementById("name").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            birthdate: document.getElementById("birthdate").value
        };
        
        const { score, feedback, recommendations } = analyzePassword(password, userInfo);
        
        // Update strength bar
        updateStrengthIndicator(score);
        
        // Update feedback
        feedbackList.innerHTML = '';
        if (feedback.length > 0) {
            feedback.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                feedbackList.appendChild(li);
            });
        }
        
        // Update recommendations
        recommendationsList.innerHTML = '';
        if (recommendations.length > 0) {
            recommendations.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                recommendationsList.appendChild(li);
            });
        }
    }
    
    function updateStrengthIndicator(score) {
        // Clear previous classes
        strengthBar.className = "strength-indicator";
        
        if (score <= 3) {
            strengthBar.classList.add("weak");
            strengthBar.style.width = "33%";
            messageElement.textContent = "Weak password";
            messageElement.className = "message weak";
        } else if (score <= 6) {
            strengthBar.classList.add("fair");
            strengthBar.style.width = "66%";
            messageElement.textContent = "Fair password";
            messageElement.className = "message fair";
        } else {
            strengthBar.classList.add("good");
            strengthBar.style.width = "100%";
            messageElement.textContent = "Strong password";
            messageElement.className = "message good";
        }
    }
    
    // Toggle password visibility
    showButton.addEventListener('click', function() {
        if (passwordInput.type === "password") {
            passwordInput.setAttribute("type", "text");
            showButton.textContent = "Hide";
            showButton.classList.add("hide");
        } else {
            passwordInput.setAttribute("type", "password");
            showButton.textContent = "Show";
            showButton.classList.remove("hide");
        }
    });
    
    // Suggest password
    suggestButton.addEventListener('click', function() {
        const suggestion = generatePasswordSuggestion();
        passwordInput.value = suggestion;
        passwordInput.type = "text";
        showButton.textContent = "Hide";
        showButton.classList.add("hide");
        updatePasswordStrength();
    });
    
    // Add event listeners
    passwordInput.addEventListener('input', updatePasswordStrength);
    document.getElementById("name").addEventListener('change', updatePasswordStrength);
    document.getElementById("username").addEventListener('change', updatePasswordStrength);
    document.getElementById("email").addEventListener('change', updatePasswordStrength);
    document.getElementById("birthdate").addEventListener('change', updatePasswordStrength);
    
    // Form submission
    document.getElementById("passwordForm").addEventListener('submit', function(e) {
        e.preventDefault();
        updatePasswordStrength();
    });
});
