// Active Auctions Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load active auctions
    loadActiveAuctions();
    
    // Initialize filters
    initializeFilters();
    
    // Initialize pagination
    initializePagination();

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));

    // Price range slider functionality
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = `$${this.value}`;
        });
    }

    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-toggle');
    const auctionsGrid = document.querySelector('.auctions-grid');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active state
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update grid view
            if (view === 'list') {
                auctionsGrid.classList.add('list-view');
            } else {
                auctionsGrid.classList.remove('list-view');
            }
        });
    });

    // Filter functionality
    const filterForm = document.getElementById('filterForm');
    const filterTags = document.querySelector('.filter-tags');
    
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }

    // Filter tag removal
    document.addEventListener('click', function(e) {
        if (e.target.matches('.filter-tag i')) {
            const tag = e.target.closest('.filter-tag');
            const filterType = tag.dataset.type;
            const filterValue = tag.dataset.value;
            
            // Remove the filter
            const input = document.querySelector(`input[name="${filterType}"][value="${filterValue}"]`);
            if (input) {
                input.checked = false;
            }
            
            // Remove the tag
            tag.remove();
            
            // Reapply filters
            applyFilters();
        }
    });

    // Watchlist functionality
    const watchlistButtons = document.querySelectorAll('.watchlist-btn');
    watchlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const auctionId = this.dataset.auctionId;
            toggleWatchlist(auctionId, this);
        });
    });

    // Bid functionality
    const bidButtons = document.querySelectorAll('.place-bid-btn');
    bidButtons.forEach(button => {
        button.addEventListener('click', function() {
            const auctionId = this.dataset.auctionId;
            const currentBid = this.dataset.currentBid;
            showBidModal(auctionId, currentBid);
        });
    });

    // Countdown timers
    const countdowns = document.querySelectorAll('.auction-timer');
    countdowns.forEach(timer => {
        const endTime = new Date(timer.dataset.endTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            if (distance < 0) {
                timer.textContent = 'Auction ended';
                timer.classList.add('ended');
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            timer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
    });

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('.auction-image img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    
    if (menuToggle && filtersSidebar) {
        menuToggle.addEventListener('click', function() {
            filtersSidebar.classList.toggle('show');
        });
    }
});

// Load active auctions
function loadActiveAuctions() {
    // Show loading state
    const auctionsContainer = document.getElementById('auction-items');
    if (!auctionsContainer) return;
    
    auctionsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading auctions...</p>
        </div>
    `;
    
    // In a real application, this would be an AJAX call to the server
    // For demo purposes, we'll simulate loading data from localStorage
    
    setTimeout(() => {
        // Get auctions from localStorage
        const auctions = getAuctionsFromStorage();
        
        // Update counts
        document.getElementById('active-count').textContent = auctions.length;
        document.getElementById('total-count').textContent = auctions.length;
        document.getElementById('results-count').textContent = auctions.length;
        
        // Display auctions
        displayAuctions(auctions);
        
        // Update pagination
        updatePagination(auctions.length);
    }, 1000);
}

// Get auctions from localStorage
function getAuctionsFromStorage() {
    // Get all auctions from localStorage
    const auctions = [];
    
    // Get user's own auctions
    const userAuctions = JSON.parse(localStorage.getItem('userAuctions') || '[]');
    auctions.push(...userAuctions);
    
    // Get all auctions
    const allAuctions = JSON.parse(localStorage.getItem('allAuctions') || '[]');
    auctions.push(...allAuctions);
    
    // Remove duplicates based on auction ID
    const uniqueAuctions = auctions.filter((auction, index, self) =>
        index === self.findIndex((a) => a.id === auction.id)
    );
    
    // Sort by newest first
    uniqueAuctions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return uniqueAuctions;
}

// Generate sample auctions for demonstration
function generateSampleAuctions() {
    const categories = ['electronics', 'fashion', 'home', 'art', 'vehicles', 'sports'];
    const sampleAuctions = [];
    
    // Generate 10 sample auctions
    for (let i = 1; i <= 10; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const auction = {
            id: `sample-${i}`,
            title: `Sample ${capitalizeFirstLetter(category)} Item ${i}`,
            price: Math.floor(Math.random() * 1000) + 50,
            bids: Math.floor(Math.random() * 20),
            timeLeft: Math.floor(Math.random() * 5) + 1,
            image: `https://placehold.co/300x200/3498db/ffffff?text=${capitalizeFirstLetter(category)}+${i}`,
            category: category,
            subcategory: null,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            isSample: true
        };
        
        sampleAuctions.push(auction);
    }
    
    return sampleAuctions;
}

// Display auctions
function displayAuctions(auctions) {
    const container = document.getElementById('auction-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (auctions.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h3>No active auctions found</h3>
                <p>Try listing your own item for auction.</p>
                <a href="list-item.html" class="btn btn-primary mt-3">List an Item</a>
            </div>
        `;
        return;
    }
    
    auctions.forEach(auction => {
        const endTime = new Date(auction.endTime).getTime();
        const auctionCard = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="auction-card">
                    <div class="auction-image">
                        <img src="${auction.image}" alt="${auction.title}">
                        <div class="auction-category">${capitalizeFirstLetter(auction.category)}</div>
                    </div>
                    <div class="auction-details">
                        <h4>${auction.title}</h4>
                        <div class="auction-price">$${auction.price.toFixed(2)}</div>
                        <div class="auction-meta">
                            <span><i class="fas fa-gavel"></i> ${auction.bids} bids</span>
                            <span class="countdown" data-end-time="${endTime}">
                                <i class="fas fa-clock"></i> <span class="time-left">Loading...</span>
                            </span>
                        </div>
                        <a href="auction-details.html?id=${auction.id}" class="btn btn-sm btn-primary">View Auction</a>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += auctionCard;
    });

    // Initialize countdown timers
    const countdowns = document.querySelectorAll('.countdown');
    countdowns.forEach(timer => {
        const endTime = parseInt(timer.dataset.endTime);
        const timeLeftSpan = timer.querySelector('.time-left');
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            if (distance < 0) {
                timeLeftSpan.textContent = 'Auction ended';
                timeLeftSpan.classList.add('text-danger');
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            let timeText = '';
            if (days > 0) timeText += `${days}d `;
            if (hours > 0) timeText += `${hours}h `;
            if (minutes > 0) timeText += `${minutes}m `;
            timeText += `${seconds}s`;
            
            timeLeftSpan.textContent = timeText;
            
            // Add warning class if less than 1 hour remaining
            if (distance < 3600000) { // 1 hour in milliseconds
                timeLeftSpan.classList.add('text-danger');
            }
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
    });
}

// Initialize filters
function initializeFilters() {
    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    if (priceRange && minPrice && maxPrice) {
        priceRange.addEventListener('input', function() {
            maxPrice.value = this.value;
        });
        
        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', function() {
            // In a real app, this would filter the auctions
            // For demo, we'll just reload with the same data
            loadActiveAuctions();
        });
        
        // Reset filters button
        document.getElementById('reset-filters').addEventListener('click', function() {
            // Reset all filter inputs
            document.querySelectorAll('.filters-sidebar input').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else if (input.type === 'range') {
                    input.value = input.max;
                } else {
                    input.value = '';
                }
            });
            
            // Reload auctions
            loadActiveAuctions();
        });
    }
    
    // Sort options
    const sortOptions = document.getElementById('sort-options');
    if (sortOptions) {
        sortOptions.addEventListener('change', function() {
            // In a real app, this would sort the auctions
            // For demo, we'll just reload with the same data
            loadActiveAuctions();
        });
    }
}

// Initialize pagination
function initializePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
}

// Update pagination
function updatePagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    const itemsPerPage = 9;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    pagination.innerHTML += `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === 1 ? 'active' : ''}">
                <a class="page-link" href="#">${i}</a>
            </li>
        `;
    }
    
    // Next button
    pagination.innerHTML += `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    // Add click handlers
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.getAttribute('aria-label') === 'Previous') {
                // Go to previous page
                const activePage = pagination.querySelector('.active');
                if (activePage && activePage.previousElementSibling) {
                    activePage.classList.remove('active');
                    activePage.previousElementSibling.classList.add('active');
                    // In a real app, this would load the previous page
                }
            } else if (this.getAttribute('aria-label') === 'Next') {
                // Go to next page
                const activePage = pagination.querySelector('.active');
                if (activePage && activePage.nextElementSibling) {
                    activePage.classList.remove('active');
                    activePage.nextElementSibling.classList.add('active');
                    // In a real app, this would load the next page
                }
            } else {
                // Go to specific page
                pagination.querySelectorAll('.page-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                // In a real app, this would load the specific page
            }
        });
    });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper Functions
function applyFilters() {
    const formData = new FormData(filterForm);
    const filters = {};
    
    for (let [key, value] of formData.entries()) {
        if (value) {
            filters[key] = value;
        }
    }
    
    // Update filter tags
    updateFilterTags(filters);
    
    // Simulate API call
    showLoading();
    setTimeout(() => {
        // Here you would typically make an API call
        console.log('Applying filters:', filters);
        hideLoading();
    }, 500);
}

function updateFilterTags(filters) {
    filterTags.innerHTML = '';
    
    for (let [type, value] of Object.entries(filters)) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.dataset.type = type;
        tag.dataset.value = value;
        
        tag.innerHTML = `
            ${value}
            <i class="fas fa-times"></i>
        `;
        
        filterTags.appendChild(tag);
    }
}

function toggleWatchlist(auctionId, button) {
    // Simulate API call
    button.classList.toggle('active');
    const isActive = button.classList.contains('active');
    
    showNotification(
        isActive ? 'Added to watchlist' : 'Removed from watchlist',
        isActive ? 'success' : 'info'
    );
}

function showBidModal(auctionId, currentBid) {
    // Create and show bid modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'bidModal';
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Place Bid</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="bidForm">
                        <div class="mb-3">
                            <label class="form-label">Your Bid Amount</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" class="form-control" min="${parseInt(currentBid) + 1}" step="1" required>
                            </div>
                        </div>
                        <div class="form-check mb-3">
                            <input type="checkbox" class="form-check-input" id="autoBid">
                            <label class="form-check-label" for="autoBid">Enable Auto-Bidding</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="placeBid('${auctionId}')">Place Bid</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bidModal = new bootstrap.Modal(modal);
    bidModal.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
}

function placeBid(auctionId) {
    const bidForm = document.getElementById('bidForm');
    const bidAmount = bidForm.querySelector('input[type="number"]').value;
    const autoBid = bidForm.querySelector('#autoBid').checked;
    
    // Simulate API call
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('Bid placed successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('bidModal')).hide();
    }, 500);
}

function showLoading() {
    const cards = document.querySelectorAll('.auction-card');
    cards.forEach(card => card.classList.add('loading'));
}

function hideLoading() {
    const cards = document.querySelectorAll('.auction-card');
    cards.forEach(card => card.classList.remove('loading'));
}

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
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Auction listing functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentPage = 1;
    let itemsPerPage = 12;
    let totalItems = 0;
    let currentFilters = {
        minPrice: 0,
        maxPrice: 10000,
        category: 'all',
        condition: 'all',
        endingSoon: false
    };

    // Load initial auctions
    loadAuctions();

    // Handle filter changes
    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('change', function() {
            const filterType = this.getAttribute('data-filter');
            const value = this.value;
            
            currentFilters[filterType] = value;
            currentPage = 1; // Reset to first page
            loadAuctions();
        });
    });

    // Handle sort changes
    document.getElementById('sortAuctions').addEventListener('change', function() {
        currentPage = 1; // Reset to first page
        loadAuctions();
    });

    // Handle pagination
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page) {
                currentPage = page;
                loadAuctions();
            }
        });
    });

    // Function to load auctions
    function loadAuctions() {
        const auctionItems = document.getElementById('auctionItems');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // Show loading spinner
        auctionItems.innerHTML = '';
        loadingSpinner.style.display = 'block';

        // Simulate API call with setTimeout
        setTimeout(() => {
            // Get sort value
            const sortValue = document.getElementById('sortAuctions').value;
            
            // Generate mock auction data
            const auctions = generateMockAuctions();
            
            // Apply filters
            let filteredAuctions = filterAuctions(auctions);
            
            // Apply sorting
            filteredAuctions = sortAuctions(filteredAuctions, sortValue);
            
            // Calculate pagination
            totalItems = filteredAuctions.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex);
            
            // Update results count
            document.getElementById('resultsCount').textContent = 
                `Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} items`;
            
            // Generate HTML for auctions
            auctionItems.innerHTML = paginatedAuctions.map(auction => generateAuctionHTML(auction)).join('');
            
            // Update pagination
            updatePagination(currentPage, totalPages);
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
        }, 500);
    }

    // Function to generate mock auction data
    function generateMockAuctions() {
        const categories = ['Electronics', 'Fashion', 'Home & Living', 'Art & Collectibles', 'Vehicles', 'Sports & Leisure'];
        const conditions = ['New', 'Like New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];
        const titles = [
            'iPhone 15 Pro Max', 'MacBook Pro M3', 'Samsung 4K Smart TV',
            'Designer Handbag', 'Vintage Watch', 'Gaming PC',
            'Antique Vase', 'Luxury Car', 'Mountain Bike',
            'Smart Home Bundle', 'Camera Kit', 'Musical Instrument'
        ];
        
        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            title: titles[Math.floor(Math.random() * titles.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            currentBid: Math.floor(Math.random() * 5000) + 100,
            timeLeft: Math.floor(Math.random() * 72) + 1,
            bids: Math.floor(Math.random() * 50),
            image: `https://picsum.photos/400/300?random=${i}`
        }));
    }

    // Function to filter auctions
    function filterAuctions(auctions) {
        return auctions.filter(auction => {
            const priceMatch = auction.currentBid >= currentFilters.minPrice && 
                             auction.currentBid <= currentFilters.maxPrice;
            const categoryMatch = currentFilters.category === 'all' || 
                                auction.category === currentFilters.category;
            const conditionMatch = currentFilters.condition === 'all' || 
                                 auction.condition === currentFilters.condition;
            const timeMatch = !currentFilters.endingSoon || auction.timeLeft <= 24;
            
            return priceMatch && categoryMatch && conditionMatch && timeMatch;
        });
    }

    // Function to sort auctions
    function sortAuctions(auctions, sortValue) {
        return [...auctions].sort((a, b) => {
            switch(sortValue) {
                case 'price-low':
                    return a.currentBid - b.currentBid;
                case 'price-high':
                    return b.currentBid - a.currentBid;
                case 'ending-soon':
                    return a.timeLeft - b.timeLeft;
                case 'most-bids':
                    return b.bids - a.bids;
                default:
                    return 0;
            }
        });
    }

    // Function to generate auction HTML
    function generateAuctionHTML(auction) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="auction-card">
                    <div class="auction-image">
                        <img src="${auction.image}" alt="${auction.title}" class="img-fluid">
                        <div class="auction-category">${auction.category}</div>
                    </div>
                    <div class="auction-details">
                        <h3 class="auction-title">${auction.title}</h3>
                        <div class="auction-info">
                            <span class="current-bid">Current Bid: $${auction.currentBid}</span>
                            <span class="time-left">${auction.timeLeft}h left</span>
                        </div>
                        <div class="auction-meta">
                            <span class="condition">${auction.condition}</span>
                            <span class="bids">${auction.bids} bids</span>
                        </div>
                        <a href="auction-details.html?id=${auction.id}" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to update pagination
    function updatePagination(currentPage, totalPages) {
        const pagination = document.querySelector('.pagination');
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add click handlers to new pagination links
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                if (page) {
                    currentPage = page;
                    loadAuctions();
                }
            });
        });
    }
}); 