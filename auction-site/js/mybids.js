document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    initializeFilters();
    
    // Initialize bid items
    initializeBidItems();
    
    // Initialize pagination
    initializePagination();
    
    // Start countdown timers
    startCountdownTimers();
});

function initializeFilters() {
    const statusFilters = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const timeFilter = document.querySelector('.filter-group select[name="time-period"]');
    const sortFilter = document.querySelector('.filter-group select[name="sort-by"]');
    
    // Status filter change handler
    statusFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterBids();
        });
    });
    
    // Time period filter change handler
    timeFilter.addEventListener('change', function() {
        filterBids();
    });
    
    // Sort filter change handler
    sortFilter.addEventListener('change', function() {
        sortBids();
    });
}

function filterBids() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-group input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    const timePeriod = document.querySelector('.filter-group select[name="time-period"]').value;
    
    const bidItems = document.querySelectorAll('.bid-item');
    
    bidItems.forEach(item => {
        const status = item.getAttribute('data-status');
        const bidDate = new Date(item.getAttribute('data-bid-date'));
        
        let showItem = activeFilters.length === 0 || activeFilters.includes(status);
        
        if (showItem && timePeriod !== 'all') {
            const now = new Date();
            switch(timePeriod) {
                case 'week':
                    showItem = isWithinLastWeek(bidDate, now);
                    break;
                case 'month':
                    showItem = isWithinLastMonth(bidDate, now);
                    break;
                case 'year':
                    showItem = isWithinLastYear(bidDate, now);
                    break;
            }
        }
        
        item.style.display = showItem ? 'flex' : 'none';
    });
    
    updateEmptyState();
}

function sortBids() {
    const sortBy = document.querySelector('.filter-group select[name="sort-by"]').value;
    const bidsList = document.querySelector('.bids-list');
    const bidItems = Array.from(document.querySelectorAll('.bid-item'));
    
    bidItems.sort((a, b) => {
        switch(sortBy) {
            case 'recent':
                return new Date(b.getAttribute('data-bid-date')) - new Date(a.getAttribute('data-bid-date'));
            case 'highest':
                return parseFloat(b.getAttribute('data-bid-amount')) - parseFloat(a.getAttribute('data-bid-amount'));
            case 'ending':
                return new Date(a.getAttribute('data-end-date')) - new Date(b.getAttribute('data-end-date'));
            default:
                return 0;
        }
    });
    
    bidItems.forEach(item => bidsList.appendChild(item));
}

function initializeBidItems() {
    const bidItems = document.querySelectorAll('.bid-item');
    
    bidItems.forEach(item => {
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Initialize action buttons
        const actionButtons = item.querySelectorAll('.bid-actions button');
        actionButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                handleBidAction(action, item);
            });
        });
    });
}

function handleBidAction(action, item) {
    const auctionId = item.getAttribute('data-auction-id');
    
    switch(action) {
        case 'view':
            window.location.href = `auction-details.html?id=${auctionId}`;
            break;
        case 'bid':
            // Implement bid functionality
            console.log('Placing bid for auction:', auctionId);
            break;
        case 'contact':
            // Implement contact seller functionality
            console.log('Contacting seller for auction:', auctionId);
            break;
    }
}

function initializePagination() {
    const paginationButtons = document.querySelectorAll('.bids-pagination button');
    
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                // Remove active class from all buttons
                paginationButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Load page content
                loadPage(this.getAttribute('data-page'));
            }
        });
    });
}

function loadPage(pageNumber) {
    // Implement page loading functionality
    console.log('Loading page:', pageNumber);
}

function startCountdownTimers() {
    const timers = document.querySelectorAll('.timer-value');
    
    timers.forEach(timer => {
        const endDate = new Date(timer.getAttribute('data-end-date'));
        
        const countdown = setInterval(() => {
            const now = new Date();
            const distance = endDate - now;
            
            if (distance < 0) {
                clearInterval(countdown);
                timer.textContent = 'Auction Ended';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            timer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    });
}

function updateEmptyState() {
    const visibleItems = document.querySelectorAll('.bid-item[style="display: flex"]');
    const emptyState = document.querySelector('.empty-state');
    
    if (visibleItems.length === 0 && emptyState) {
        emptyState.style.display = 'block';
    } else if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Helper functions for date filtering
function isWithinLastWeek(date, now) {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
}

function isWithinLastMonth(date, now) {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
}

function isWithinLastYear(date, now) {
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    return date >= yearAgo;
} 