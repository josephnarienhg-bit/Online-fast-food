// Admin Password (stored in localStorage)
const ADMIN_PASSWORD = 'JOSEPH@2007';

// Initialize default menu items
const defaultMenuItems = [
    {
        id: 1,
        name: 'Biryani',
        price: 250.00,
        // High-quality stable biryani image URL
        image: 'https://images.unsplash.com/photo-1585937421612-70a630e4e229?w=1000&h=750&fit=crop&q=80'
    }, 
    {
        id: 2,
        name: 'Kabab',
        price: 180.00,
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop&q=90'
    },
    {
        id: 3,
        name: 'Parrota',
        price: 50.00,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=90'
    },
    {
        id: 4,
        name: 'Chicken Fried Rice',
        price: 200.00,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&q=90'
    }
];

// Initialize localStorage
function initializeStorage() {
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify(defaultMenuItems));
    } else {
        // If menuItems already exist (from prior runs), ensure Biryani image is valid.
        try {
            const items = JSON.parse(localStorage.getItem('menuItems') || '[]');
            let changed = false;
            // Multiple fallback URLs for Biryani - very reliable sources
            const biryaniUrls = [
                'https://images.unsplash.com/photo-1585937421612-70a630e4e229?w=1000&h=750&fit=crop&q=80',
                'https://images.unsplash.com/photo-1456619519551-f2db022d2117?w=1000&h=750&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516320318423-f06f85e504b3?w=1000&h=750&fit=crop&q=80'
            ];
            const preferredBiryaniImage = biryaniUrls[0];
            
            items.forEach(it => {
                if (it && it.name && it.name.toString().toLowerCase().includes('biryani')) {
                    // If image is missing or points to a known-bad URL or placeholder, update it
                    const img = (it.image || '').toString();
                    if (!img || img.includes('1631452180519') || img.includes('placeholder.com') || 
                        img.includes('photo-1604908177522') || img.trim() === '' || 
                        img.includes('via.placeholder') || img.includes('unsplash') === false) {
                        it.image = preferredBiryaniImage;
                        changed = true;
                    }
                }
            });
            if (changed) {
                localStorage.setItem('menuItems', JSON.stringify(items));
            }
        } catch (e) {
            console.warn('Could not verify stored menu items for image fixes', e);
        }
    }
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('nextItemId')) {
        localStorage.setItem('nextItemId', '5');
    }
}

// Get menu items from localStorage
function getMenuItems() {
    return JSON.parse(localStorage.getItem('menuItems') || '[]');
}

// Save menu items to localStorage
function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Get transactions from localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
}

// Save transaction to localStorage
function saveTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Get last saved address from localStorage
function getLastAddress() {
    return JSON.parse(localStorage.getItem('lastAddress') || 'null');
}

// Save address to localStorage for future orders
function saveLastAddress(address) {
    localStorage.setItem('lastAddress', JSON.stringify(address));
}

// Get user profile from localStorage
function getUserProfile(username) {
    const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    return profiles[username] || { name: '', email: '', phone: '', address: '' };
}

// Save user profile to localStorage
function saveUserProfile(username, profile) {
    const profiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    profiles[username] = profile;
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
}

// Display menu items
function displayMenu(filter = '') {
    const menuGrid = document.getElementById('menuGrid');
    const menuItems = getMenuItems();
    const q = (filter || '').toString().trim().toLowerCase();
    
    menuGrid.innerHTML = '';
    
    const filtered = menuItems.filter(item => {
        if (!q) return true;
        return item.name.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        menuGrid.innerHTML = '<p style="text-align:center; color:#666; padding:2rem;">No items found.</p>';
        return;
    }

    filtered.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        
        // Create image with better error handling
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.style.width = '100%';
        img.style.height = '300px';
        img.style.objectFit = 'cover';
        
        // Enhanced error handling with fallback URLs
        let fallbackAttempt = 0;
        const fallbackUrls = [
            'https://images.unsplash.com/photo-1585937421612-70a630e4e229?w=400&h=300&fit=crop&q=80',
            'https://images.unsplash.com/photo-1456619519551-f2db022d2117?w=400&h=300&fit=crop&q=80',
            'https://via.placeholder.com/400x300?text=' + item.name
        ];
        
        img.onerror = function() {
            if (fallbackAttempt < fallbackUrls.length) {
                img.src = fallbackUrls[fallbackAttempt];
                fallbackAttempt++;
            }
        };
        
        menuItemDiv.appendChild(img);
        
        // Add info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'menu-item-info';
        infoDiv.innerHTML = `
            <h3>${item.name}</h3>
            <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
            <div style="display:flex; gap:0.5rem;">
                <button onclick="addToCart(${item.id})" class="btn-primary">Add to Cart</button>
                <button onclick="orderNow(${item.id})" class="btn-secondary">Order Now</button>
            </div>
        `;
        menuItemDiv.appendChild(infoDiv);
        
        menuGrid.appendChild(menuItemDiv);
    });
}

// Add item to cart
function addToCart(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    let cart = getCart();
    const existingItem = cart.find(c => c.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
    updateCartCount();
    
    // Show cart if hidden
    document.getElementById('cartSection').classList.add('active');
}

// Quick order: add item to cart and open cart then proceed to payment modal for quick checkout
function orderNow(itemId) {
    addToCart(itemId);
    // open cart
    document.getElementById('cartSection').classList.add('active');
    // automatically open address modal after a short delay
    setTimeout(() => {
        openAddressModal();
    }, 500);
}

// Remove item from cart
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartDisplay();
    updateCartCount();
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
    let cart = getCart();
    const item = cart.find(c => c.id === itemId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        saveCart(cart);
        updateCartDisplay();
        updateCartCount();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Your cart is empty</p>';
        updateBill();
        return;
    }
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
        `;
        cartItems.appendChild(cartItemDiv);
    });
    
    updateBill();
}

// Update bill totals
function updateBill() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        saveCart([]);
        updateCartDisplay();
        updateCartCount();
    }
}

// Print bill
function printBill() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Bill</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #764ba2; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f8f9fa; }
                    .total-row { font-weight: bold; font-size: 1.2em; }
                    .right { text-align: right; }
                </style>
            </head>
            <body>
                <h1>HAARY JACNY HOTEL</h1>
                <h2 style="text-align: center; color: #666; margin-top: 0.5rem;">Bill</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th class="right">Price</th>
                            <th class="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td class="right">₹${item.price.toFixed(2)}</td>
                                <td class="right">₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="right">Subtotal:</td>
                            <td class="right">₹${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="right">Tax (5%):</td>
                            <td class="right">₹${tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" class="right">Total:</td>
                            <td class="right">₹${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <p style="text-align: center; margin-top: 30px;">Thank you for your visit!</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Pay now - generate QR code
function payNow() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    // Create transaction
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        tax: tax,
        total: total
    };
    
    saveTransaction(transaction);
    
    // Generate QR code
    const qrModal = document.getElementById('qrModal');
    const qrcodeDiv = document.getElementById('qrcode');
    const paymentAmount = document.getElementById('paymentAmount');
    
    qrcodeDiv.innerHTML = '';
    paymentAmount.textContent = `₹${total.toFixed(2)}`;
    
    // Generate QR code with transaction details
    const qrData = JSON.stringify({
        amount: total,
        transactionId: transaction.id,
        date: transaction.date
    });
    
    // Check if QRCode library is loaded
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrcodeDiv, {
                text: qrData,
                width: 256,
                height: 256
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrcodeDiv.innerHTML = '<p style="color: red;">QR Code generation failed. Please try again.</p>';
        }
    } else {
        qrcodeDiv.innerHTML = '<p style="color: red;">QR Code library not loaded. Please refresh the page.</p>';
    }
    
    qrModal.classList.add('active');
    
    // Clear cart after payment
    saveCart([]);
    updateCartDisplay();
    updateCartCount();
}

// Open Address Modal for Order Placement
function openAddressModal() {
    const modal = document.getElementById('addressModal');
    const lastAddress = getLastAddress();
    
    // Prefill from last saved address if available
    if (lastAddress) {
        document.getElementById('custName').value = lastAddress.name || '';
        document.getElementById('custPhone').value = lastAddress.phone || '';
        document.getElementById('custAddress').value = lastAddress.address || '';
        document.getElementById('custCity').value = lastAddress.city || '';
        document.getElementById('custPostal').value = lastAddress.postal || '';
    } else {
        // Clear fields if no previous address
        document.getElementById('addressForm').reset();
    }
    
    modal.classList.add('active');
}

// Close Address Modal
function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.classList.remove('active');
}

// Place Order - Validate Address & Process Payment
function placeOrder() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const postal = document.getElementById('custPostal').value.trim();
    
    // Validate all fields
    if (!name || !phone || !address || !city || !postal) {
        alert('Please fill in all address fields');
        return;
    }
    
    // Validate phone number (basic check - at least 10 digits)
    if (!/\d{10,}/.test(phone.replace(/\D/g, ''))) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Save address for future orders
    const deliveryInfo = { name, phone, address, city, postal };
    saveLastAddress(deliveryInfo);
    
    // Close address modal
    closeAddressModal();
    
    // Validate cart
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    // Store transaction data temporarily for payment method selection
    window.pendingTransaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        tax: tax,
        total: total,
        delivery: deliveryInfo
    };
    
    // Show payment method modal
    document.getElementById('paymentMethodModal').classList.add('active');
}

// Handle Cash Payment
function processCashPayment() {
    const transaction = window.pendingTransaction;
    if (!transaction) {
        alert('Transaction data missing');
        return;
    }
    
    // Save transaction to localStorage
    saveTransaction(transaction);
    
    // Close payment method modal
    document.getElementById('paymentMethodModal').classList.remove('active');
    
    // Close cart section
    document.getElementById('cartSection').classList.remove('active');
    
    // Populate cash confirmation modal
    document.getElementById('cashOrderId').textContent = transaction.id;
    document.getElementById('cashOrderTotal').textContent = `₹${transaction.total.toFixed(2)}`;
    document.getElementById('cashDeliveryAddr').textContent = `${transaction.delivery.address}, ${transaction.delivery.city} ${transaction.delivery.postal}`;
    
    // Show cash confirmation modal
    document.getElementById('cashConfirmationModal').classList.add('active');
    
    // Clear cart
    saveCart([]);
    updateCartDisplay();
    updateCartCount();
    
    // Clear pending transaction
    window.pendingTransaction = null;
}

// Handle QR Payment
function processQrPayment() {
    const transaction = window.pendingTransaction;
    if (!transaction) {
        alert('Transaction data missing');
        return;
    }
    
    // Save transaction to localStorage
    saveTransaction(transaction);
    
    // Close payment method modal
    document.getElementById('paymentMethodModal').classList.remove('active');
    
    // Close cart section
    document.getElementById('cartSection').classList.remove('active');
    
    // Generate QR code
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';
    
    // Generate QR code with transaction details
    const qrData = JSON.stringify({
        amount: transaction.total,
        transactionId: transaction.id,
        date: transaction.date,
        delivery: transaction.delivery
    });
    
    // Check if QRCode library is loaded
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrcodeDiv, {
                text: qrData,
                width: 256,
                height: 256
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrcodeDiv.innerHTML = '<p style="color: red;">QR Code generation failed. Please try again.</p>';
        }
    } else {
        qrcodeDiv.innerHTML = '<p style="color: red;">QR Code library not loaded. Please refresh the page.</p>';
    }
    
    // Populate QR confirmation modal
    document.getElementById('qrOrderId').textContent = transaction.id;
    document.getElementById('qrOrderTotal').textContent = `₹${transaction.total.toFixed(2)}`;
    document.getElementById('qrDeliveryAddr').textContent = `${transaction.delivery.address}, ${transaction.delivery.city} ${transaction.delivery.postal}`;
    
    // Show QR confirmation modal
    document.getElementById('qrConfirmationModal').classList.add('active');
    
    // Clear cart
    saveCart([]);
    updateCartDisplay();
    updateCartCount();
    
    // Clear pending transaction
    window.pendingTransaction = null;
}

// Close Payment Method Modal
function closePaymentMethodModal() {
    document.getElementById('paymentMethodModal').classList.remove('active');
}

// Settings Functions
function openSettingsModal() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    const profile = getUserProfile(currentUser);
    document.getElementById('settingsUsername').value = currentUser;
    document.getElementById('settingsName').value = profile.name || '';
    document.getElementById('settingsEmail').value = profile.email || '';
    document.getElementById('settingsPhone').value = profile.phone || '';
    document.getElementById('settingsAddress').value = profile.address || '';

    document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const name = document.getElementById('settingsName').value.trim();
    const email = document.getElementById('settingsEmail').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const address = document.getElementById('settingsAddress').value.trim();

    // Validation
    if (!name) {
        alert('Please enter your full name');
        return;
    }

    if (email && !email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }

    const profile = { name, email, phone, address };
    saveUserProfile(currentUser, profile);
    alert('✓ Profile updated successfully!');
    closeSettingsModal();
}

// Order History Functions
function openOrderHistoryModal() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    document.getElementById('orderHistoryModal').classList.add('active');
    displayOrderHistory('all');
}

function closeOrderHistoryModal() {
    document.getElementById('orderHistoryModal').classList.remove('active');
}

function displayOrderHistory(filter = 'all') {
    const currentUser = localStorage.getItem('currentUser');
    const transactions = getTransactions();
    
    // Filter transactions for current user
    const userTransactions = transactions.filter(t => {
        if (filter === 'cash') return t.delivery !== undefined;
        if (filter === 'qr') return t.delivery !== undefined;
        return true;
    });

    const orderList = document.getElementById('orderHistoryList');
    const noOrders = document.getElementById('noOrdersMessage');

    if (userTransactions.length === 0) {
        orderList.innerHTML = '';
        noOrders.style.display = 'block';
        return;
    }

    noOrders.style.display = 'none';
    orderList.innerHTML = '';

    // Display orders in reverse chronological order (newest first)
    userTransactions.reverse().forEach(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const itemsList = transaction.items.map(item => 
            `${item.name} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('<br>');

        const deliveryInfo = transaction.delivery ? 
            `📍 ${transaction.delivery.address}, ${transaction.delivery.city}` :
            'No delivery info';

        const orderItemHTML = `
            <div class="order-item">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${transaction.id}</div>
                        <div class="order-date">${formattedDate}</div>
                    </div>
                    <div class="order-amount">₹${transaction.total.toFixed(2)}</div>
                </div>
                <div class="order-details">
                    <p><strong>Items:</strong></p>
                    <p>${itemsList}</p>
                    <p style="margin-top: 0.5rem;"><strong>Delivery:</strong> ${deliveryInfo}</p>
                </div>
            </div>
        `;
        
        orderList.innerHTML += orderItemHTML;
    });
}

// Menu Management - CRUD Operations

// Display admin menu list
function displayAdminMenu() {
    const adminMenuList = document.getElementById('adminMenuList');
    const menuItems = getMenuItems();
    
    adminMenuList.innerHTML = '';
    
    menuItems.forEach(item => {
        const adminItemDiv = document.createElement('div');
        adminItemDiv.className = 'admin-menu-item';
        adminItemDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem;"> 
                <img src="${item.image || 'https://via.placeholder.com/120x90?text=No+Image'}" alt="${item.name}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;" onerror="this.onerror=null;this.src='https://via.placeholder.com/120x90?text=No+Image'">
                <div class="admin-menu-item-info">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <p style="font-size: 0.8rem; color: #999;">${(item.image && item.image.length>50) ? item.image.substring(0,50) + '...' : (item.image || '')}</p>
                </div>
            </div>
            <div class="admin-menu-item-actions">
                <button class="btn-edit" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        `;
        adminMenuList.appendChild(adminItemDiv);
    });
}

// Add new menu item
function addMenuItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('itemName').value.trim();
    const priceInput = document.getElementById('itemPrice').value;
    const imageInput = document.getElementById('itemImage').value.trim();
    const imageFileInput = document.getElementById('itemImageFile');
    
    if (!name || !image) {
        alert('Please fill in all fields');
        return;
    }
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
        alert('Please enter a valid positive number for price');
        return;
    }
    // Helper to read selected file as data URL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    (async function(){
        let finalImage = imageInput || '';
        // If a file was selected, prefer it and convert to data URL
        if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
            try {
                finalImage = await readFileAsDataURL(imageFileInput.files[0]);
            } catch (e) {
                console.error('Failed to read image file', e);
                alert('Failed to read selected image file.');
                return;
            }
        }

        const menuItems = getMenuItems();
        const nextId = parseInt(localStorage.getItem('nextItemId'));

        const newItem = {
            id: nextId,
            name: name,
            price: price,
            image: finalImage
        };

        menuItems.push(newItem);
        saveMenuItems(menuItems);
        localStorage.setItem('nextItemId', (nextId + 1).toString());

        // Reset form
        document.getElementById('addItemForm').reset();

        // Update displays
        displayMenu();
        displayAdminMenu();

        alert('Item added successfully!');
    })();
}

// Edit menu item
function editMenuItem(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    const newName = prompt('Enter new name:', item.name);
    if (newName === null || newName.trim() === '') return;
    
    const newPrice = prompt('Enter new price:', item.price);
    if (newPrice === null) return;
    
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue < 0) {
        alert('Please enter a valid positive number for price');
        return;
    }
    
    const newImage = prompt('Enter new image URL:', item.image);
    if (newImage === null || newImage.trim() === '') return;
    
    item.name = newName.trim();
    item.price = priceValue;
    item.image = newImage.trim();
    
    saveMenuItems(menuItems);
    displayMenu();
    displayAdminMenu();
    
    alert('Item updated successfully!');
}

// Delete menu item
function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const menuItems = getMenuItems();
    const filteredItems = menuItems.filter(i => i.id !== itemId);
    
    saveMenuItems(filteredItems);
    displayMenu();
    displayAdminMenu();
    
    alert('Item deleted successfully!');
}

// Password protection for admin
function checkAdminPassword() {
    const passwordModal = document.getElementById('passwordModal');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    passwordModal.classList.add('active');
    adminPasswordInput.focus();
    
    document.getElementById('submitPasswordBtn').onclick = () => {
        const enteredPassword = adminPasswordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            passwordModal.classList.remove('active');
            adminPasswordInput.value = '';
            openAdminPanel();
        } else {
            alert('Incorrect password!');
            adminPasswordInput.value = '';
        }
    };
    
    document.getElementById('cancelPasswordBtn').onclick = () => {
        passwordModal.classList.remove('active');
        adminPasswordInput.value = '';
    };
    
    adminPasswordInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            document.getElementById('submitPasswordBtn').click();
        }
    };
}

// Open admin panel
function openAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.add('active');
    displayAdminMenu();
}

// Close admin panel
function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('active');
}

// Sales Report
function generateSalesReport() {
    const monthSelect = document.getElementById('monthSelect').value;
    const transactions = getTransactions();
    
    let filteredTransactions = transactions;
    
    if (monthSelect) {
        const [year, month] = monthSelect.split('-');
        filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() == year && 
                   (transactionDate.getMonth() + 1) == month;
        });
    } else {
        // Default to current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() == currentYear && 
                   (transactionDate.getMonth() + 1) == currentMonth;
        });
    }
    
    displaySalesReport(filteredTransactions);
}

function displaySalesReport(transactions) {
    const reportData = document.getElementById('reportData');
    
    if (transactions.length === 0) {
        reportData.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No transactions found for the selected period.</p>';
        return;
    }
    
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    // Calculate item-wise sales
    const itemSales = {};
    transactions.forEach(t => {
        t.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    const itemSalesArray = Object.entries(itemSales).map(([name, data]) => ({
        name,
        ...data
    })).sort((a, b) => b.revenue - a.revenue);
    
    reportData.innerHTML = `
        <div class="report-summary">
            <div class="report-card">
                <h3>Total Sales</h3>
                <p>₹${totalSales.toFixed(2)}</p>
            </div>
            <div class="report-card">
                <h3>Total Transactions</h3>
                <p>${totalTransactions}</p>
            </div>
            <div class="report-card">
                <h3>Average Order Value</h3>
                <p>₹${totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : '0.00'}</p>
            </div>
        </div>
        <h3 style="margin: 2rem 0 1rem 0;">Item-wise Sales</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${itemSalesArray.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.revenue.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Open sales report
function openSalesReport() {
    const salesReportSection = document.getElementById('salesReportSection');
    salesReportSection.classList.add('active');
    
    // Set current month as default
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('monthSelect').value = `${year}-${month}`;
    
    generateSalesReport();
}

// Close sales report
function closeSalesReport() {
    const salesReportSection = document.getElementById('salesReportSection');
    salesReportSection.classList.remove('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize
        initializeStorage();
        // If there's a query param q, prefill search and filter
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        if (q) {
            const searchInput = document.getElementById('headerSearchInput');
            if (searchInput) searchInput.value = q;
            displayMenu(q);
        } else {
            displayMenu();
        }
        updateCartDisplay();
        updateCartCount();
    } catch (error) {
        console.error('Error initializing:', error);
        alert('Error loading page. Please refresh.');
    }
    
    // Cart toggle
    document.getElementById('cartToggleBtn').addEventListener('click', () => {
        document.getElementById('cartSection').classList.add('active');
    });
    
    document.getElementById('closeCartBtn').addEventListener('click', () => {
        document.getElementById('cartSection').classList.remove('active');
    });
    
    // Cart actions
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('printBillBtn').addEventListener('click', printBill);
    document.getElementById('payNowBtn').addEventListener('click', openAddressModal);
    
    // Address Modal
    document.getElementById('closeAddressModal').addEventListener('click', closeAddressModal);
    document.getElementById('cancelAddressBtn').addEventListener('click', closeAddressModal);
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
    
    // Payment Method Modal
    document.getElementById('closePaymentModal').addEventListener('click', closePaymentMethodModal);
    document.getElementById('cashPaymentBtn').addEventListener('click', processCashPayment);
    document.getElementById('qrPaymentBtn').addEventListener('click', processQrPayment);
    
    // Order Confirmation Modals
    document.getElementById('closeCashConfirmBtn').addEventListener('click', () => {
        document.getElementById('cashConfirmationModal').classList.remove('active');
    });
    document.getElementById('closeQrConfirmBtn').addEventListener('click', () => {
        document.getElementById('qrConfirmationModal').classList.remove('active');
    });
    
    // Settings Modal
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Order History Modal
    document.getElementById('orderHistoryBtn').addEventListener('click', openOrderHistoryModal);
    document.getElementById('closeOrderHistoryModal').addEventListener('click', closeOrderHistoryModal);
    document.getElementById('closeOrderHistoryBtn').addEventListener('click', closeOrderHistoryModal);
    
    // Order history filter buttons
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayOrderHistory(this.dataset.filter);
        });
    });
    
    // QR Modal
    document.getElementById('closeQrModal').addEventListener('click', () => {
        document.getElementById('qrModal').classList.remove('active');
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('qrModal').classList.remove('active');
    });
    
    // Admin panel
    document.getElementById('manageMenuBtn').addEventListener('click', checkAdminPassword);
    document.getElementById('closeAdminBtn').addEventListener('click', closeAdminPanel);
    document.getElementById('addItemForm').addEventListener('submit', addMenuItem);
    
    // Sales report
    document.getElementById('salesReportBtn').addEventListener('click', openSalesReport);
    document.getElementById('closeReportBtn').addEventListener('click', closeSalesReport);
    document.getElementById('generateReportBtn').addEventListener('click', generateSalesReport);

    // Header search behavior
    const headerSearch = document.getElementById('headerSearchInput');
    if (headerSearch) {
        headerSearch.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            displayMenu(val);
        });
        headerSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // optional: push query param
                const v = headerSearch.value.trim();
                if (v) history.replaceState(null, '', '?q=' + encodeURIComponent(v));
                displayMenu(v);
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const qrModal = document.getElementById('qrModal');
        const passwordModal = document.getElementById('passwordModal');
        const adminPanel = document.getElementById('adminPanel');
        const salesReportSection = document.getElementById('salesReportSection');
        const addressModal = document.getElementById('addressModal');
        const paymentMethodModal = document.getElementById('paymentMethodModal');
        
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
        }
        if (e.target === passwordModal) {
            passwordModal.classList.remove('active');
        }
        if (e.target === adminPanel) {
            adminPanel.classList.remove('active');
        }
        if (e.target === salesReportSection) {
            salesReportSection.classList.remove('active');
        }
        if (e.target === addressModal) {
            addressModal.classList.remove('active');
        }
        if (e.target === paymentMethodModal) {
            paymentMethodModal.classList.remove('active');
        }
        
        const cashConfirmationModal = document.getElementById('cashConfirmationModal');
        const qrConfirmationModal = document.getElementById('qrConfirmationModal');
        
        if (e.target === cashConfirmationModal) {
            cashConfirmationModal.classList.remove('active');
        }
        if (e.target === qrConfirmationModal) {
            qrConfirmationModal.classList.remove('active');
        }
        
        const settingsModal = document.getElementById('settingsModal');
        const orderHistoryModal = document.getElementById('orderHistoryModal');
        
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
        if (e.target === orderHistoryModal) {
            orderHistoryModal.classList.remove('active');
        }
    });

    // Render header user area: replace login link with user badge + logout when logged in
    function logoutCurrentUser() {
        localStorage.removeItem('currentUser');
        // After logout, go to login page
        window.location.href = 'login.html';
    }

    function renderUserArea() {
        const currentUser = localStorage.getItem('currentUser');
        const loginLink = document.getElementById('loginLink');

        if (currentUser) {
            // Create user area container
            const container = document.createElement('div');
            container.id = 'userArea';
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.gap = '0.5rem';

            const nameSpan = document.createElement('span');
            nameSpan.id = 'userName';
            nameSpan.textContent = currentUser;
            nameSpan.style.fontWeight = '600';
            nameSpan.style.color = '#333';

            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'btn-secondary';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', logoutCurrentUser);

            container.appendChild(nameSpan);
            container.appendChild(logoutBtn);

            if (loginLink && loginLink.parentElement) {
                loginLink.parentElement.replaceChild(container, loginLink);
            } else {
                // fallback: append to header actions before cart button
                const headerActions = document.querySelector('.header-actions');
                const cartBtn = document.getElementById('cartToggleBtn');
                if (cartBtn) headerActions.insertBefore(container, cartBtn);
                else headerActions.appendChild(container);
            }
        } else {
            // Not logged in: ensure a Login link exists
            if (!loginLink) {
                const headerActions = document.querySelector('.header-actions');
                const a = document.createElement('a');
                a.href = 'login.html';
                a.id = 'loginLink';
                a.className = 'btn-secondary';
                a.style.textDecoration = 'none';
                a.style.display = 'inline-flex';
                a.style.alignItems = 'center';
                a.style.justifyContent = 'center';
                a.textContent = 'Login';
                const cartBtn = document.getElementById('cartToggleBtn');
                if (cartBtn) headerActions.insertBefore(a, cartBtn);
                else headerActions.appendChild(a);
            }
        }
    }

    // Initialize header user area
    renderUserArea();
});

