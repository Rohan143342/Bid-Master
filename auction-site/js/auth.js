// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Basic validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email format validation
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate login process
            simulateLogin(email, password, rememberMe);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Basic validation
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email format validation
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Phone format validation
            if (!isValidPhone(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }
            
            // Password match validation
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Password strength validation
            if (getPasswordStrength(password) < 2) {
                showNotification('Please choose a stronger password', 'error');
                return;
            }
            
            // Terms validation
            if (!terms) {
                showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Simulate signup process
            simulateSignup(firstName, lastName, email, phone, password);
        });
    }

    // Password strength checker function
    function checkPasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-meter-fill');
        const strengthText = document.querySelector('.strength-text span');
        
        if (!strengthMeter || !strengthText) return;
        
        // Reset classes
        strengthMeter.classList.remove('weak', 'medium', 'strong', 'very-strong');
        
        // Calculate strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        
        // Contains number
        if (/\d/.test(password)) strength++;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;
        
        // Contains special character
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update UI based on strength
        if (strength <= 2) {
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#dc3545';
        } else if (strength <= 3) {
            strengthMeter.classList.add('medium');
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#ffc107';
        } else if (strength <= 4) {
            strengthMeter.classList.add('strong');
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#198754';
        } else {
            strengthMeter.classList.add('very-strong');
            strengthText.textContent = 'Very Strong';
            strengthText.style.color = '#0d6efd';
        }
        
        return strength;
    }

    // Get password strength (0-4)
    function getPasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        
        // Contains number
        if (/\d/.test(password)) strength++;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;
        
        // Contains special character
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    }

    // Simulate login process
    function simulateLogin(email, password, rememberMe) {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Store current user in localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                }));
                
                // Set remember me cookie if needed
                if (rememberMe) {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
                    document.cookie = `rememberMe=true; expires=${expiryDate.toUTCString()}; path=/`;
                }
                
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Show success message
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'my-account.html';
                }, 1500);
            } else {
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Show error message
                showNotification('Invalid email or password', 'error');
            }
        }, 1500);
    }

    // Simulate signup process
    function simulateSignup(firstName, lastName, email, phone, password) {
        // Show loading state
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Check if email already exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const emailExists = users.some(user => user.email === email);
            
            if (emailExists) {
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Show error message
                showNotification('Email already registered. Please use a different email or login.', 'error');
                return;
            }
            
            // Generate user ID
            const userId = 'user_' + Date.now();
            
            // Create new user object
            const newUser = {
                id: userId,
                firstName,
                lastName,
                email,
                phone,
                password,
                createdAt: new Date().toISOString(),
                auctions: [],
                bids: [],
                watchlist: []
            };
            
            // Add user to users array
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Store current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: userId,
                firstName,
                lastName,
                email,
                phone
            }));
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            showNotification('Account created successfully! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'my-account.html';
            }, 1500);
        }, 1500);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${getNotificationIcon(type)}"></i>
                <p>${message}</p>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Get notification icon based on type
    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-exclamation-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            default:
                return 'fas fa-info-circle';
        }
    }
    
    // Add notification styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                color: white;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            .notification-content {
                display: flex;
                align-items: center;
            }
            .notification-icon {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            .notification-success { background-color: var(--success-color); }
            .notification-info { background-color: var(--primary-color); }
            .notification-warning { background-color: var(--warning-color); }
            .notification-error { background-color: var(--error-color); }
        `;
        document.head.appendChild(style);
    }
}); 