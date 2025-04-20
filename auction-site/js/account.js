// Account JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update user information in the account page
    updateUserInfo(currentUser);
    
    // Load user's auctions, bids, and watchlist
    loadUserData(currentUser.id);
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Handle tab navigation
    const accountTabs = document.querySelectorAll('.account-nav a');
    accountTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            accountTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetId = this.getAttribute('href').substring(1);
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });
        });
    });
});

// Update user information in the account page
function updateUserInfo(user) {
    // Update profile information
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
    
    const userPhoneElement = document.getElementById('userPhone');
    if (userPhoneElement) {
        userPhoneElement.textContent = user.phone;
    }
    
    // Update profile image if available
    const profileImageElement = document.getElementById('profileImage');
    if (profileImageElement) {
        // Use initials as fallback if no image
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
        profileImageElement.textContent = initials;
    }
}

// Load user's auctions, bids, and watchlist
function loadUserData(userId) {
    // Get all auctions from localStorage
    const allAuctions = JSON.parse(localStorage.getItem('allAuctions') || '[]');
    
    // Get user's auctions
    const userAuctions = allAuctions.filter(auction => auction.sellerId === userId);
    
    // Display user's auctions
    displayUserAuctions(userAuctions);
    
    // Get user's bids
    const userBids = allAuctions.filter(auction => 
        auction.bids && auction.bids.some(bid => bid.bidderId === userId)
    );
    
    // Display user's bids
    displayUserBids(userBids);
    
    // Get user's watchlist
    const userWatchlist = allAuctions.filter(auction => 
        auction.watchlist && auction.watchlist.includes(userId)
    );
    
    // Display user's watchlist
    displayUserWatchlist(userWatchlist);
}

// Display user's auctions
function displayUserAuctions(auctions) {
    const container = document.getElementById('myAuctions');
    if (!container) return;
    
    if (auctions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-gavel fa-3x text-muted mb-3"></i>
                <h4>No Auctions Yet</h4>
                <p>You haven't created any auctions yet.</p>
                <a href="list-item.html" class="btn btn-primary mt-3">Create Your First Auction</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    auctions.forEach(auction => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="auction-card">
                    <div class="auction-image">
                        <img src="${auction.image}" alt="${auction.title}">
                        <div class="auction-category">${capitalizeFirstLetter(auction.category)}</div>
                    </div>
                    <div class="auction-details">
                        <h4>${auction.title}</h4>
                        <div class="auction-price">$${auction.price.toFixed(2)}</div>
                        <div class="auction-meta">
                            <span><i class="fas fa-gavel"></i> ${auction.bids ? auction.bids.length : 0} bids</span>
                            <span><i class="fas fa-clock"></i> ${auction.timeLeft}d left</span>
                        </div>
                        <div class="auction-actions">
                            <a href="auction-details.html?id=${auction.id}" class="btn btn-sm btn-primary">View</a>
                            <a href="edit-auction.html?id=${auction.id}" class="btn btn-sm btn-outline-primary">Edit</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Display user's bids
function displayUserBids(auctions) {
    const container = document.getElementById('myBids');
    if (!container) return;
    
    if (auctions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-hand-holding-usd fa-3x text-muted mb-3"></i>
                <h4>No Bids Yet</h4>
                <p>You haven't placed any bids yet.</p>
                <a href="auctions.html" class="btn btn-primary mt-3">Browse Auctions</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    auctions.forEach(auction => {
        const userBid = auction.bids.find(bid => bid.bidderId === JSON.parse(localStorage.getItem('currentUser')).id);
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="auction-card">
                    <div class="auction-image">
                        <img src="${auction.image}" alt="${auction.title}">
                        <div class="auction-category">${capitalizeFirstLetter(auction.category)}</div>
                    </div>
                    <div class="auction-details">
                        <h4>${auction.title}</h4>
                        <div class="auction-price">Your Bid: $${userBid.amount.toFixed(2)}</div>
                        <div class="auction-meta">
                            <span><i class="fas fa-gavel"></i> ${auction.bids.length} bids</span>
                            <span><i class="fas fa-clock"></i> ${auction.timeLeft}d left</span>
                        </div>
                        <div class="auction-actions">
                            <a href="auction-details.html?id=${auction.id}" class="btn btn-sm btn-primary">View</a>
                            <button class="btn btn-sm btn-outline-primary place-bid-btn" data-auction-id="${auction.id}" data-current-bid="${auction.currentBid}">Place Bid</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to place bid buttons
    const placeBidButtons = container.querySelectorAll('.place-bid-btn');
    placeBidButtons.forEach(button => {
        button.addEventListener('click', function() {
            const auctionId = this.dataset.auctionId;
            const currentBid = parseFloat(this.dataset.currentBid);
            showBidModal(auctionId, currentBid);
        });
    });
}

// Display user's watchlist
function displayUserWatchlist(auctions) {
    const container = document.getElementById('myWatchlist');
    if (!container) return;
    
    if (auctions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h4>Watchlist Empty</h4>
                <p>You haven't added any items to your watchlist yet.</p>
                <a href="auctions.html" class="btn btn-primary mt-3">Browse Auctions</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    auctions.forEach(auction => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="auction-card">
                    <div class="auction-image">
                        <img src="${auction.image}" alt="${auction.title}">
                        <div class="auction-category">${capitalizeFirstLetter(auction.category)}</div>
                    </div>
                    <div class="auction-details">
                        <h4>${auction.title}</h4>
                        <div class="auction-price">$${auction.price.toFixed(2)}</div>
                        <div class="auction-meta">
                            <span><i class="fas fa-gavel"></i> ${auction.bids ? auction.bids.length : 0} bids</span>
                            <span><i class="fas fa-clock"></i> ${auction.timeLeft}d left</span>
                        </div>
                        <div class="auction-actions">
                            <a href="auction-details.html?id=${auction.id}" class="btn btn-sm btn-primary">View</a>
                            <button class="btn btn-sm btn-outline-danger remove-watchlist" data-auction-id="${auction.id}">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to remove watchlist buttons
    const removeWatchlistButtons = container.querySelectorAll('.remove-watchlist');
    removeWatchlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const auctionId = this.dataset.auctionId;
            removeFromWatchlist(auctionId);
        });
    });
}

// Show bid modal
function showBidModal(auctionId, currentBid) {
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="bidModal" tabindex="-1" aria-labelledby="bidModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bidModalLabel">Place a Bid</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="bidForm">
                            <div class="mb-3">
                                <label for="bidAmount" class="form-label">Your Bid Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="bidAmount" min="${currentBid + 1}" step="0.01" required>
                                </div>
                                <div class="form-text">Minimum bid: $${(currentBid + 1).toFixed(2)}</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitBid">Place Bid</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get modal element
    const modalElement = document.getElementById('bidModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Show modal
    modal.show();
    
    // Handle bid submission
    const submitBidButton = document.getElementById('submitBid');
    submitBidButton.addEventListener('click', function() {
        const bidAmount = parseFloat(document.getElementById('bidAmount').value);
        
        if (isNaN(bidAmount) || bidAmount <= currentBid) {
            showNotification('Please enter a valid bid amount higher than the current bid', 'error');
            return;
        }
        
        // Place bid
        placeBid(auctionId, bidAmount);
        
        // Hide modal
        modal.hide();
        
        // Remove modal from DOM after it's hidden
        modalElement.addEventListener('hidden.bs.modal', function() {
            modalElement.remove();
        });
    });
}

// Place bid
function placeBid(auctionId, bidAmount) {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get all auctions
    const allAuctions = JSON.parse(localStorage.getItem('allAuctions') || '[]');
    
    // Find auction
    const auctionIndex = allAuctions.findIndex(auction => auction.id === auctionId);
    
    if (auctionIndex === -1) {
        showNotification('Auction not found', 'error');
        return;
    }
    
    // Create bid object
    const bid = {
        bidderId: currentUser.id,
        bidderName: `${currentUser.firstName} ${currentUser.lastName}`,
        amount: bidAmount,
        timestamp: new Date().toISOString()
    };
    
    // Add bid to auction
    if (!allAuctions[auctionIndex].bids) {
        allAuctions[auctionIndex].bids = [];
    }
    
    allAuctions[auctionIndex].bids.push(bid);
    allAuctions[auctionIndex].currentBid = bidAmount;
    
    // Update auction in localStorage
    localStorage.setItem('allAuctions', JSON.stringify(allAuctions));
    
    // Show success notification
    showNotification('Bid placed successfully!', 'success');
    
    // Reload user data
    loadUserData(currentUser.id);
}

// Remove from watchlist
function removeFromWatchlist(auctionId) {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get all auctions
    const allAuctions = JSON.parse(localStorage.getItem('allAuctions') || '[]');
    
    // Find auction
    const auctionIndex = allAuctions.findIndex(auction => auction.id === auctionId);
    
    if (auctionIndex === -1) {
        showNotification('Auction not found', 'error');
        return;
    }
    
    // Remove user from watchlist
    if (allAuctions[auctionIndex].watchlist) {
        allAuctions[auctionIndex].watchlist = allAuctions[auctionIndex].watchlist.filter(id => id !== currentUser.id);
        
        // Update auction in localStorage
        localStorage.setItem('allAuctions', JSON.stringify(allAuctions));
        
        // Show success notification
        showNotification('Item removed from watchlist', 'success');
        
        // Reload user data
        loadUserData(currentUser.id);
    }
}

// Logout
function logout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Show success notification
    showNotification('Logged out successfully', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
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