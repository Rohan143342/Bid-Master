document.addEventListener('DOMContentLoaded', function() {
    // Initialize bid history functionality
    initializeBidHistory();
});

function initializeBidHistory() {
    const bidSort = document.getElementById('bidSort');
    const bidTimeRange = document.getElementById('bidTimeRange');
    const bidHistoryTable = document.querySelector('.bid-history-table tbody');

    // Sort bids when select changes
    bidSort.addEventListener('change', function() {
        sortBids(this.value);
    });

    // Filter bids by time range
    bidTimeRange.addEventListener('change', function() {
        filterBidsByTime(this.value);
    });

    // Initialize tooltips for bid status
    initializeBidStatusTooltips();
}

function sortBids(sortBy) {
    const tbody = document.querySelector('.bid-history-table tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const amountA = parseFloat(a.querySelector('.bid-amount').textContent.replace('$', ''));
        const amountB = parseFloat(b.querySelector('.bid-amount').textContent.replace('$', ''));
        const timeA = new Date(a.querySelector('.bid-time').getAttribute('data-time'));
        const timeB = new Date(b.querySelector('.bid-time').getAttribute('data-time'));

        switch(sortBy) {
            case 'highest':
                return amountB - amountA;
            case 'lowest':
                return amountA - amountB;
            case 'recent':
                return timeB - timeA;
            default:
                return 0;
        }
    });

    // Clear and re-append sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));

    // Update highest bid highlighting
    updateHighestBidHighlight();
}

function filterBidsByTime(timeRange) {
    const rows = document.querySelectorAll('.bid-history-table tbody tr');
    const now = new Date();

    rows.forEach(row => {
        const bidTime = new Date(row.querySelector('.bid-time').getAttribute('data-time'));
        let show = true;

        switch(timeRange) {
            case 'today':
                show = isSameDay(bidTime, now);
                break;
            case 'week':
                show = isWithinLastWeek(bidTime, now);
                break;
            case 'month':
                show = isWithinLastMonth(bidTime, now);
                break;
            case 'all':
                show = true;
                break;
        }

        row.style.display = show ? '' : 'none';
    });
}

function updateHighestBidHighlight() {
    const rows = document.querySelectorAll('.bid-history-table tbody tr');
    let highestBid = 0;
    let highestBidRow = null;

    rows.forEach(row => {
        const amount = parseFloat(row.querySelector('.bid-amount').textContent.replace('$', ''));
        row.classList.remove('highest-bid');
        
        if (amount > highestBid) {
            highestBid = amount;
            highestBidRow = row;
        }
    });

    if (highestBidRow) {
        highestBidRow.classList.add('highest-bid');
    }
}

function initializeBidStatusTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Helper functions for date filtering
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function isWithinLastWeek(date, now) {
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    return date >= oneWeekAgo;
}

function isWithinLastMonth(date, now) {
    const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    return date >= oneMonthAgo;
}

// Function to update bid history in real-time
function updateBidHistory(newBid) {
    const tbody = document.querySelector('.bid-history-table tbody');
    const newRow = document.createElement('tr');
    
    // Create bidder info cell
    const bidderInfo = document.createElement('td');
    bidderInfo.innerHTML = `
        <div class="bidder-info">
            <img src="${newBid.bidderAvatar}" alt="${newBid.bidderName}" class="bidder-avatar">
            <span class="bidder-name">${newBid.bidderName}</span>
        </div>
    `;

    // Create amount cell
    const amountCell = document.createElement('td');
    amountCell.className = 'bid-amount';
    amountCell.textContent = `$${newBid.amount}`;

    // Create time cell
    const timeCell = document.createElement('td');
    timeCell.className = 'bid-time';
    timeCell.textContent = newBid.time;
    timeCell.setAttribute('data-time', newBid.timestamp);

    // Create status cell
    const statusCell = document.createElement('td');
    statusCell.innerHTML = `<span class="bid-status ${newBid.status.toLowerCase()}">${newBid.status}</span>`;

    // Append all cells to the new row
    newRow.appendChild(bidderInfo);
    newRow.appendChild(amountCell);
    newRow.appendChild(timeCell);
    newRow.appendChild(statusCell);

    // Insert the new row at the top of the table
    tbody.insertBefore(newRow, tbody.firstChild);

    // Update highest bid highlighting
    updateHighestBidHighlight();
} 