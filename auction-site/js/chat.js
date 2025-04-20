// Live Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessages = document.getElementById('chatMessages');
    const notificationBadge = document.querySelector('.notification-badge');
    const emailSupportForm = document.getElementById('emailSupportForm');

    // Toggle chat window
    chatToggleBtn.addEventListener('click', function() {
        chatWindow.classList.add('active');
        notificationBadge.style.display = 'none';
    });

    // Close chat window
    closeChatBtn.addEventListener('click', function() {
        chatWindow.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            messageInput.value = '';

            // Simulate support response
            setTimeout(() => {
                const responses = [
                    "Thank you for your message. How can I assist you today?",
                    "I'll be happy to help you with that. Could you please provide more details?",
                    "Is there anything specific you'd like to know about our auction process?",
                    "I can help you with your bidding or selling questions. What would you like to know?"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'support');
            }, 1000);
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="time">${currentTime}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message on button click
    sendMessageBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Show notification badge after 5 seconds
    setTimeout(() => {
        notificationBadge.style.display = 'flex';
    }, 5000);

    // Handle email support form submission
    if (emailSupportForm) {
        emailSupportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('supportName').value,
                email: document.getElementById('supportEmail').value,
                subject: document.getElementById('supportSubject').value,
                message: document.getElementById('supportMessage').value
            };

            // Simulate sending email (replace with actual API call)
            console.log('Sending support email:', formData);
            
            // Show success message
            const modal = bootstrap.Modal.getInstance(document.getElementById('emailSupportModal'));
            modal.hide();
            
            // Show success notification
            showNotification('Your message has been sent. We will get back to you soon!', 'success');
            
            // Reset form
            emailSupportForm.reset();
        });
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}); 