// List Item Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form elements
    initializeForm();
    
    // Initialize image upload
    initializeImageUpload();
    
    // Initialize auction settings
    initializeAuctionSettings();
    
    // Initialize form validation
    initializeValidation();
    
    // Initialize action buttons
    initializeActionButtons();
});

// Initialize form elements
function initializeForm() {
    // Category dropdown
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            updateSubcategories(this.value);
        });
    }
    
    // Condition dropdown
    const conditionSelect = document.getElementById('condition');
    if (conditionSelect) {
        conditionSelect.addEventListener('change', function() {
            updateConditionDescription(this.value);
        });
    }
    
    // Auction type
    const auctionTypeSelect = document.getElementById('auction-type');
    if (auctionTypeSelect) {
        auctionTypeSelect.addEventListener('change', function() {
            togglePricingOptions(this.value);
        });
    }
    
    // Auction duration
    const durationSelect = document.getElementById('auction-duration');
    if (durationSelect) {
        durationSelect.addEventListener('change', function() {
            updateEndDate(this.value);
        });
    }
}

// Update subcategories based on selected category
function updateSubcategories(category) {
    const subcategorySelect = document.getElementById('subcategory');
    if (!subcategorySelect) return;
    
    // Clear current options
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    
    // Define subcategories for each category
    const subcategories = {
        'electronics': ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Gaming', 'Cameras', 'Audio', 'TVs'],
        'fashion': ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Watches', 'Bags', 'Sunglasses'],
        'home': ['Furniture', 'Decor', 'Kitchen', 'Bathroom', 'Bedding', 'Lighting', 'Storage'],
        'art': ['Paintings', 'Sculptures', 'Photography', 'Prints', 'Antiques', 'Collectibles'],
        'vehicles': ['Cars', 'Motorcycles', 'Boats', 'Parts', 'Accessories'],
        'sports': ['Equipment', 'Clothing', 'Accessories', 'Memorabilia', 'Outdoor Gear']
    };
    
    // Add subcategories for selected category
    if (subcategories[category]) {
        subcategories[category].forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.toLowerCase();
            option.textContent = subcategory;
            subcategorySelect.appendChild(option);
        });
    }
}

// Update condition description
function updateConditionDescription(condition) {
    const conditionDescription = document.getElementById('condition-description');
    if (!conditionDescription) return;
    
    const descriptions = {
        'new': 'Item is brand new, unused, and in its original packaging.',
        'like-new': 'Item is in excellent condition, may have been used once or twice.',
        'good': 'Item is in good condition with normal wear and tear.',
        'fair': 'Item shows signs of wear but is still functional.',
        'poor': 'Item has significant wear or damage but may still be usable.'
    };
    
    conditionDescription.textContent = descriptions[condition] || 'Please select a condition.';
}

// Toggle pricing options based on auction type
function togglePricingOptions(auctionType) {
    const buyNowPriceContainer = document.getElementById('buy-now-price-container');
    const fixedPriceContainer = document.getElementById('fixed-price-container');
    
    if (!buyNowPriceContainer || !fixedPriceContainer) return;
    
    // Hide all containers first
    buyNowPriceContainer.style.display = 'none';
    fixedPriceContainer.style.display = 'none';
    
    // Show relevant container based on auction type
    switch (auctionType) {
        case 'buy-now':
            buyNowPriceContainer.style.display = 'block';
            break;
        case 'best-offer':
            fixedPriceContainer.style.display = 'block';
            break;
        case 'standard':
            // Standard auction doesn't need additional price fields
            break;
    }
}

// Update end date based on auction duration
function updateEndDate(duration) {
    const endDateElement = document.getElementById('auction-end-date');
    if (!endDateElement) return;
    
    const now = new Date();
    let endDate = new Date(now);
    
    // Calculate end date based on duration
    switch (duration) {
        case '3':
            endDate.setDate(now.getDate() + 3);
            break;
        case '5':
            endDate.setDate(now.getDate() + 5);
            break;
        case '7':
            endDate.setDate(now.getDate() + 7);
            break;
        case '10':
            endDate.setDate(now.getDate() + 10);
            break;
        case '14':
            endDate.setDate(now.getDate() + 14);
            break;
        case '30':
            endDate.setDate(now.getDate() + 30);
            break;
    }
    
    // Format date as YYYY-MM-DD
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    
    endDateElement.value = `${year}-${month}-${day}`;
    endDateElement.textContent = endDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Initialize image upload functionality
function initializeImageUpload() {
    const dropZone = document.getElementById('imageUpload');
    const fileInput = document.getElementById('fileInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (!dropZone || !fileInput || !imagePreviewContainer) return;
    
    // Click on drop zone to trigger file input
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('highlight');
    }
    
    function unhighlight() {
        dropZone.classList.remove('highlight');
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle selected files
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        // Limit to 5 images
        const maxImages = 5;
        const currentImages = imagePreviewContainer.querySelectorAll('.image-preview').length;
        
        if (currentImages + files.length > maxImages) {
            showNotification(`You can only upload a maximum of ${maxImages} images.`, 'error');
            return;
        }
        
        // Process each file
        Array.from(files).forEach(file => {
            // Check if file is an image
            if (!file.type.match('image.*')) {
                showNotification('Please upload only image files.', 'error');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size should be less than 5MB.', 'error');
                return;
            }
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const imagePreview = document.createElement('div');
                imagePreview.className = 'image-preview';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('preview-image');
                
                const removeBtn = document.createElement('div');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function() {
                    imagePreview.remove();
                });
                
                imagePreview.appendChild(img);
                imagePreview.appendChild(removeBtn);
                imagePreviewContainer.appendChild(imagePreview);
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Initialize auction settings
function initializeAuctionSettings() {
    // Starting price validation
    const startingPrice = document.getElementById('starting-price');
    if (startingPrice) {
        startingPrice.addEventListener('input', function() {
            validatePrice(this);
        });
    }
    
    // Reserve price validation
    const reservePrice = document.getElementById('reserve-price');
    if (reservePrice) {
        reservePrice.addEventListener('input', function() {
            validatePrice(this);
        });
    }
    
    // Buy now price validation
    const buyNowPrice = document.getElementById('buy-now-price');
    if (buyNowPrice) {
        buyNowPrice.addEventListener('input', function() {
            validatePrice(this);
        });
    }
    
    // Fixed price validation
    const fixedPrice = document.getElementById('fixed-price');
    if (fixedPrice) {
        fixedPrice.addEventListener('input', function() {
            validatePrice(this);
        });
    }
}

// Validate price input
function validatePrice(input) {
    // Remove non-numeric characters except decimal point
    input.value = input.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = input.value.split('.');
    if (parts.length > 2) {
        input.value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
        input.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Ensure minimum value
    const value = parseFloat(input.value);
    if (value < 0.01) {
        input.value = '0.01';
    }
}

// Initialize form validation
function initializeValidation() {
    const form = document.getElementById('list-item-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Form is valid, proceed with submission
            submitForm();
        }
    });
}

// Validate form
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'title', message: 'Please enter an item title' },
        { id: 'category', message: 'Please select a category' },
        { id: 'description', message: 'Please provide a description' },
        { id: 'condition', message: 'Please select the item condition' },
        { id: 'starting-price', message: 'Please enter a starting price' }
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            showFieldError(element, field.message);
            isValid = false;
        } else {
            clearFieldError(element);
        }
    });
    
    // Check if at least one image is uploaded
    const imagePreviews = document.querySelectorAll('.image-preview');
    if (imagePreviews.length === 0) {
        showNotification('Please upload at least one image of your item.', 'error');
        isValid = false;
    }
    
    // Validate auction type specific fields
    const auctionType = document.getElementById('auction-type').value;
    
    if (auctionType === 'buy-now') {
        const buyNowPrice = document.getElementById('buy-now-price');
        if (!buyNowPrice || !buyNowPrice.value || parseFloat(buyNowPrice.value) <= 0) {
            showFieldError(buyNowPrice, 'Please enter a valid buy now price');
            isValid = false;
        }
    } else if (auctionType === 'best-offer') {
        const fixedPrice = document.getElementById('fixed-price');
        if (!fixedPrice || !fixedPrice.value || parseFloat(fixedPrice.value) <= 0) {
            showFieldError(fixedPrice, 'Please enter a valid fixed price');
            isValid = false;
        }
    }
    
    // Validate shipping cost
    const shippingCost = document.getElementById('shipping-cost');
    if (shippingCost && shippingCost.value && parseFloat(shippingCost.value) < 0) {
        showFieldError(shippingCost, 'Shipping cost cannot be negative');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error class to field
    field.classList.add('is-invalid');
    
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-danger mt-1';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove error class
    field.classList.remove('is-invalid');
    
    // Remove error message
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
            }
            
            .notification-content i {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: 15px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification-info {
                background-color: #3498db;
                color: white;
            }
            
            .notification-success {
                background-color: #2ecc71;
                color: white;
            }
            
            .notification-warning {
                background-color: #f39c12;
                color: white;
            }
            
            .notification-error {
                background-color: #e74c3c;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'error':
            return 'fa-times-circle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

// Initialize action buttons
function initializeActionButtons() {
    // Preview button
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            if (validateForm()) {
                previewAuction();
            }
        });
    }
    
    // Save as draft button
    const draftBtn = document.getElementById('draft-btn');
    if (draftBtn) {
        draftBtn.addEventListener('click', function() {
            saveAsDraft();
        });
    }
    
    // Publish button
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            if (validateForm()) {
                publishAuction();
            }
        });
    }
}

// Preview auction
function previewAuction() {
    // In a real application, this would open a preview modal or navigate to a preview page
    showNotification('Preview functionality would show how your auction will appear to buyers.', 'info');
}

// Save as draft
function saveAsDraft() {
    // Collect form data
    const formData = collectFormData();
    
    // In a real application, this would save to localStorage or send to server
    localStorage.setItem('auctionDraft', JSON.stringify(formData));
    
    showNotification('Auction saved as draft. You can continue editing later.', 'success');
}

// Publish auction
function publishAuction() {
    // Collect form data
    const formData = collectFormData();
    
    // Show loading state
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...';
    }
    
    // Simulate API call
    setTimeout(() => {
        // In a real application, this would send data to the server
        console.log('Publishing auction:', formData);
        
        // Generate a unique ID for the auction
        const auctionId = 'auction-' + Date.now();
        
        // Create auction object
        const auction = {
            id: auctionId,
            title: formData.title,
            price: parseFloat(formData.startingPrice || formData.fixedPrice || formData.reservePrice),
            bids: 0,
            timeLeft: parseInt(formData.duration),
            image: document.querySelector('.preview-image')?.src || 'https://placehold.co/300x200/3498db/ffffff?text=No+Image',
            category: formData.category,
            subcategory: formData.subcategory,
            description: formData.description,
            condition: formData.condition,
            brand: formData.brand,
            auctionType: formData.auctionType,
            startingPrice: formData.startingPrice,
            reservePrice: formData.reservePrice,
            buyNowPrice: formData.buyNowPrice,
            fixedPrice: formData.fixedPrice,
            duration: formData.duration,
            shippingMethod: formData.shippingMethod,
            shippingCost: formData.shippingCost,
            returnsAccepted: formData.returnsAccepted,
            returnPolicy: formData.returnPolicy,
            timestamp: new Date().toISOString(),
            isUserAuction: true
        };
        
        // Store the auction in localStorage
        storeAuctionInLocalStorage(auction);
        
        // Show success message
        showNotification('Your auction has been published successfully!', 'success');
        
        // Redirect to the auction page or category page
        setTimeout(() => {
            // Get category for redirect
            const category = document.getElementById('category').value;
            
            // Redirect to the appropriate page
            if (category) {
                window.location.href = `category.html?cat=${category}`;
            } else {
                window.location.href = 'auctions.html';
            }
        }, 1500);
    }, 2000);
}

// Store auction in localStorage
function storeAuctionInLocalStorage(auction) {
    // Get existing user auctions
    const userAuctions = JSON.parse(localStorage.getItem('userAuctions') || '[]');
    
    // Add new auction
    userAuctions.push(auction);
    
    // Save back to localStorage
    localStorage.setItem('userAuctions', JSON.stringify(userAuctions));
    
    // Also store in all auctions
    const allAuctions = JSON.parse(localStorage.getItem('allAuctions') || '[]');
    allAuctions.push(auction);
    localStorage.setItem('allAuctions', JSON.stringify(allAuctions));
}

// Collect form data
function collectFormData() {
    // This is a simplified version - in a real app, you'd collect all form fields
    return {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory')?.value || '',
        description: document.getElementById('description').value,
        condition: document.getElementById('condition').value,
        brand: document.getElementById('brand').value,
        auctionType: document.getElementById('auction-type').value,
        startingPrice: document.getElementById('starting-price').value,
        reservePrice: document.getElementById('reserve-price').value,
        buyNowPrice: document.getElementById('buy-now-price').value,
        fixedPrice: document.getElementById('fixed-price').value,
        duration: document.getElementById('auction-duration').value,
        shippingMethod: document.getElementById('shipping-method').value,
        shippingCost: document.getElementById('shipping-cost').value,
        returnsAccepted: document.getElementById('returns-accepted').value === 'yes',
        returnPolicy: document.getElementById('return-policy').value,
        // Images would be handled separately in a real app
        timestamp: new Date().toISOString()
    };
} 