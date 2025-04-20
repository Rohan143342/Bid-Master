// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize all popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Countdown Timer Function
    function updateCountdown(element, endDate) {
        const now = new Date().getTime();
        const distance = endDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        element.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (distance < 0) {
            clearInterval(timer);
            element.innerHTML = "AUCTION ENDED";
        }
    }

    // Initialize countdown timers for all auction items
    document.querySelectorAll('.auction-timer').forEach(function(timer) {
        const endDate = new Date(timer.getAttribute('data-end-date')).getTime();
        updateCountdown(timer, endDate);
        setInterval(() => updateCountdown(timer, endDate), 1000);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Search functionality
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('input').value.trim();
            if (searchTerm) {
                // Implement search functionality here
                console.log('Searching for:', searchTerm);
            }
        });
    }

    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    // Add to watchlist functionality
    document.querySelectorAll('.watchlist-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const auctionId = this.getAttribute('data-auction-id');
            // Implement watchlist functionality here
            console.log('Added auction', auctionId, 'to watchlist');
            this.classList.toggle('active');
        });
    });

    // Place bid functionality
    document.querySelectorAll('.place-bid-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const auctionId = this.getAttribute('data-auction-id');
            const currentBid = this.getAttribute('data-current-bid');
            // Implement bid placement functionality here
            console.log('Placing bid for auction', auctionId, 'Current bid:', currentBid);
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Example usage of notification system
    // showNotification('Welcome to our auction site!', 'success');
    // showNotification('New bid placed on your watchlist item!', 'info');
    // showNotification('Auction ending soon!', 'warning');
    // showNotification('Error placing bid. Please try again.', 'error');

    // Add CSS for notifications
    const style = document.createElement('style');
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
        }
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        .notification-success { background-color: var(--success-color); }
        .notification-info { background-color: var(--primary-color); }
        .notification-warning { background-color: var(--warning-color); }
        .notification-error { background-color: var(--error-color); }
    `;
    document.head.appendChild(style);
}); 